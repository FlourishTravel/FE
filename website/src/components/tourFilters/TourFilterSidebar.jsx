import { X } from 'lucide-react';
import SearchFilter from './SearchFilter';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import DurationFilter from './DurationFilter';
import DepartureDateFilter from './DepartureDateFilter';
import TourTypeFilter from './TourTypeFilter';
import AvailabilityFilter from './AvailabilityFilter';
import RatingFilter from './RatingFilter';
import SortFilter from './SortFilter';
import FilterFooter from './FilterFooter';
import styles from './tourFilters.module.css';

export default function TourFilterSidebar({
  draft,
  patchDraft,
  onApply,
  onReset,
  activeCount,
  draftCount,
  mobileOpen,
  onMobileClose,
  categories = [],
  categoriesLoading = false,
}) {
  const count = draftCount ?? activeCount;

  const handleApply = () => {
    onApply();
    onMobileClose?.();
  };

  return (
    <div
      className={`${styles.sidebarShell} ${mobileOpen ? styles.sidebarShellOpen : ''}`}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Đóng bộ lọc"
        onClick={onMobileClose}
        tabIndex={mobileOpen ? 0 : -1}
      />
      <aside className={styles.sidebar} aria-label="Bộ lọc tour">
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Bộ lọc</h2>
          {count > 0 ? <span className={styles.sidebarBadge}>{count}</span> : null}
          <button type="button" className={styles.sidebarClose} onClick={onMobileClose} aria-label="Đóng">
            <X size={22} />
          </button>
        </div>

        <div className={styles.sidebarBody}>
          <SearchFilter value={draft.search} onChange={(search) => patchDraft({ search })} />
          <CategoryFilter
            categories={categories}
            loading={categoriesLoading}
            selected={draft.categories}
            onChange={(categories) => patchDraft({ categories })}
          />
          <PriceFilter
            priceMin={draft.priceMin}
            priceMax={draft.priceMax}
            pricePreset={draft.pricePreset}
            onChange={patchDraft}
          />
          <DurationFilter
            selected={draft.durations}
            onChange={(durations) => patchDraft({ durations })}
          />
          <DepartureDateFilter
            departureDate={draft.departureDate}
            departurePreset={draft.departurePreset}
            onChange={patchDraft}
          />
          <TourTypeFilter
            value={draft.tourType}
            onChange={(tourType) => patchDraft({ tourType })}
          />
          <AvailabilityFilter
            selected={draft.availability}
            onChange={(availability) => patchDraft({ availability })}
          />
          <RatingFilter
            value={draft.minRating}
            onChange={(minRating) => patchDraft({ minRating })}
          />
          <SortFilter value={draft.sort} onChange={(sort) => patchDraft({ sort })} />
        </div>

        <FilterFooter onReset={onReset} onApply={handleApply} />
      </aside>
    </div>
  );
}
