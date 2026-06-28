import {
  DURATION_OPTIONS,
  PRICE_BOUNDS,
  PRICE_PRESETS,
  DEPARTURE_PRESETS,
  TOUR_TYPE_OPTIONS,
  AVAILABILITY_OPTIONS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  createDefaultFilters,
} from './tourFilterConfig';

function norm(s) {
  return String(s || '').toLowerCase();
}

function tourText(t) {
  return norm(`${t.title} ${t.description} ${t.destinationCity} ${t.category?.name} ${t.slug}`);
}

export function resolveDeparturePresetDate(presetKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (d) => d.toISOString().slice(0, 10);

  switch (presetKey) {
    case 'today':
      return iso(today);
    case 'weekend': {
      const day = today.getDay();
      const sat = new Date(today);
      sat.setDate(today.getDate() + ((6 - day + 7) % 7));
      return iso(sat);
    }
    case 'next-week': {
      const next = new Date(today);
      next.setDate(today.getDate() + 7);
      return iso(next);
    }
    case 'this-month':
      return iso(new Date(today.getFullYear(), today.getMonth(), 1));
    default:
      return '';
  }
}

export function matchesCategory(tour, selectedIds) {
  if (!selectedIds?.length) return true;
  const tourCatId = tour.category?.id != null ? String(tour.category.id) : null;
  if (!tourCatId) return false;
  return selectedIds.some((id) => String(id) === tourCatId);
}

export function matchesDuration(tour, selectedKeys) {
  if (!selectedKeys?.length) return true;
  const days = tour.durationDays ?? 0;
  const nights = tour.durationNights;
  return selectedKeys.some((key) => {
    const opt = DURATION_OPTIONS.find((d) => d.key === key);
    if (!opt) return false;
    if (opt.minDays) return days >= opt.minDays;
    if (opt.nights != null) return days === opt.days && nights === opt.nights;
    return days === opt.days;
  });
}

export function getAvailabilityBucket(tour) {
  if (tour.status === 'full') return 'full';
  const es = tour.earliestSession;
  if (!es || es.status !== 'scheduled') return null;
  const max = es.maxParticipants ?? 0;
  const cur = es.currentParticipants ?? 0;
  const rem = max - cur;
  if (max <= 0) return 'many';
  if (rem <= 0) return 'full';
  if (rem <= 3) return 'few';
  if (rem / max <= 0.2) return 'almost_full';
  return 'many';
}

export function matchesAvailability(tour, selected) {
  if (!selected?.length) return true;
  const bucket = getAvailabilityBucket(tour);
  if (!bucket) return !selected.includes('full');
  return selected.includes(bucket);
}

export function matchesTourType(tour, tourType) {
  if (!tourType) return true;
  const opt = TOUR_TYPE_OPTIONS.find((t) => t.key === tourType);
  if (opt?.segment) return norm(tour.marketSegment) === opt.segment;
  const text = tourText(tour);
  switch (tourType) {
    case 'personal':
      return text.includes('cá nhân') || text.includes('private');
    case 'group':
      return text.includes('nhóm') || text.includes('group');
    case 'family':
      return text.includes('gia đình') || text.includes('family');
    default:
      return true;
  }
}

export function matchesRating(tour, minRating) {
  if (minRating == null) return true;
  const r = Number(tour.averageRating ?? tour.rating);
  if (!Number.isFinite(r)) return false;
  return r >= minRating;
}

export function matchesDepartureDate(tour, dateIso) {
  if (!dateIso) return true;
  const es = tour.earliestSession;
  if (!es?.startDate) return false;
  return String(es.startDate) >= dateIso;
}

export function applyClientFilters(tours, filters) {
  return tours.filter(
    (t) =>
      matchesCategory(t, filters.categories)
      && matchesDuration(t, filters.durations)
      && matchesAvailability(t, filters.availability)
      && matchesTourType(t, filters.tourType)
      && matchesRating(t, filters.minRating)
      && matchesDepartureDate(t, filters.departureDate)
  );
}

export function sortTours(tours, sortKey) {
  const arr = [...tours];
  switch (sortKey) {
    case 'price_asc':
      return arr.sort((a, b) => (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0));
    case 'price_desc':
      return arr.sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0));
    case 'newest':
      return arr.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    case 'departure_asc':
      return arr.sort((a, b) => {
        const da = a.earliestSession?.startDate || '9999';
        const db = b.earliestSession?.startDate || '9999';
        return da.localeCompare(db);
      });
    case 'rating_desc':
      return arr.sort(
        (a, b) => (Number(b.averageRating ?? b.rating) || 0) - (Number(a.averageRating ?? a.rating) || 0),
      );
    case 'bestseller':
      return arr.sort(
        (a, b) =>
          (b.earliestSession?.currentParticipants || 0) - (a.earliestSession?.currentParticipants || 0),
      );
    default:
      return arr;
  }
}

export function filtersToApiParams(filters, urlSegment) {
  const selected = normalizeCategoryIds(filters.categories);
  const categoryId = selected.length === 1 ? selected[0] : undefined;
  return {
    destination: filters.search?.trim() || undefined,
    minPrice: filters.priceMin > PRICE_BOUNDS.min ? filters.priceMin : undefined,
    maxPrice: filters.priceMax < PRICE_BOUNDS.max ? filters.priceMax : undefined,
    startDate: filters.departureDate || undefined,
    categoryId,
    segment: urlSegment || undefined,
    size: needsClientFiltering(filters) ? 60 : 12,
  };
}

export function needsClientFiltering(filters) {
  const categoryCount = filters.categories?.length || 0;
  return (
    categoryCount > 1
    || filters.durations?.length
    || filters.availability?.length
    || filters.tourType
    || filters.minRating != null
    || (filters.departureDate && filters.departurePreset !== 'today')
  );
}

export function countActiveFilters(filters) {
  const defaults = createDefaultFilters();
  let n = 0;
  if (filters.search?.trim()) n += 1;
  if (filters.categories?.length) n += 1;
  if (filters.priceMin !== defaults.priceMin || filters.priceMax !== defaults.priceMax) n += 1;
  if (filters.durations?.length) n += 1;
  if (filters.departureDate || filters.departurePreset) n += 1;
  if (filters.tourType) n += 1;
  if (filters.availability?.length) n += 1;
  if (filters.minRating != null) n += 1;
  if (filters.sort && filters.sort !== 'popular') n += 1;
  return n;
}

export function buildFilterChips(filters, onRemove, categories = []) {
  const chips = [];
  const categoryMap = new Map(categories.map((c) => [String(c.id), c.name]));

  if (filters.search?.trim()) {
    chips.push({ id: 'search', label: filters.search.trim(), remove: () => onRemove({ search: '' }) });
  }
  if (filters.categories?.length) {
    filters.categories.forEach((id) => {
      const idStr = String(id);
      chips.push({
        id: `cat-${idStr}`,
        label: categoryMap.get(idStr) || 'Danh mục',
        remove: () =>
          onRemove({
            categories: filters.categories.filter((k) => String(k) !== idStr),
          }),
      });
    });
  }
  if (filters.pricePreset) {
    const preset = PRICE_PRESETS.find((p) => p.key === filters.pricePreset);
    if (preset) {
      chips.push({
        id: 'price',
        label: preset.label,
        remove: () =>
          onRemove({ priceMin: PRICE_BOUNDS.min, priceMax: PRICE_BOUNDS.max, pricePreset: null }),
      });
    }
  } else if (filters.priceMin !== PRICE_BOUNDS.min || filters.priceMax !== PRICE_BOUNDS.max) {
    const fmt = (v) => formatVnd(v);
    chips.push({
      id: 'price',
      label: `${fmt(filters.priceMin)} – ${fmt(filters.priceMax)}`,
      remove: () => onRemove({ priceMin: PRICE_BOUNDS.min, priceMax: PRICE_BOUNDS.max, pricePreset: null }),
    });
  }
  filters.durations?.forEach((key) => {
    const opt = DURATION_OPTIONS.find((d) => d.key === key);
    if (opt) {
      chips.push({
        id: `dur-${key}`,
        label: opt.label,
        remove: () => onRemove({ durations: filters.durations.filter((k) => k !== key) }),
      });
    }
  });
  if (filters.departureDate) {
    chips.push({
      id: 'departure',
      label: `Khởi hành từ ${filters.departureDate.split('-').reverse().join('/')}`,
      remove: () => onRemove({ departureDate: '', departurePreset: null }),
    });
  }
  if (filters.tourType) {
    const opt = TOUR_TYPE_OPTIONS.find((t) => t.key === filters.tourType);
    chips.push({
      id: 'type',
      label: opt?.label || filters.tourType,
      remove: () => onRemove({ tourType: null }),
    });
  }
  filters.availability?.forEach((key) => {
    const opt = AVAILABILITY_OPTIONS.find((a) => a.key === key);
    if (opt) {
      chips.push({
        id: `avail-${key}`,
        label: opt.label,
        remove: () => onRemove({ availability: filters.availability.filter((k) => k !== key) }),
      });
    }
  });
  if (filters.minRating != null) {
    const opt = RATING_OPTIONS.find((r) => r.min === filters.minRating);
    chips.push({
      id: 'rating',
      label: opt?.label || `${filters.minRating}★+`,
      remove: () => onRemove({ minRating: null }),
    });
  }
  return chips;
}

export function labelForSort(key) {
  return SORT_OPTIONS.find((s) => s.key === key)?.label || 'Phổ biến nhất';
}

export function labelForPreset(key) {
  return DEPARTURE_PRESETS.find((p) => p.key === key)?.label || '';
}

export function formatVnd(n) {
  return `${Number(n).toLocaleString('vi-VN')}₫`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

export function normalizeCategoryIds(ids) {
  return (ids || []).map(String).filter((id) => isValidUuid(id));
}
