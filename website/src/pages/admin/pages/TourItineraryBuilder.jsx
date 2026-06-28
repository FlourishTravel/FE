import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TourItineraryBuilder.module.css';
import {
    getTourItinerary,
    saveTourItinerary,
    saveTourLocations,
    getAdminTourDetail,
} from '../../../api/tours';
import { resolveActivityCoordinates } from '../../../api/geocode';
import AdminImageField from '../components/AdminImageField';

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';

const ACTIVITY_TYPES = [
    { value: '', label: '— Loại hoạt động —' },
    { value: 'SIGHTSEEING', label: 'Tham quan', icon: 'photo_camera' },
    { value: 'DINING', label: 'Ăn uống', icon: 'restaurant' },
    { value: 'TRANSPORT', label: 'Di chuyển', icon: 'directions_bus' },
    { value: 'EXPERIENCE', label: 'Trải nghiệm', icon: 'star' },
    { value: 'FREE_TIME', label: 'Tự do', icon: 'self_improvement' },
    { value: 'SHOPPING', label: 'Mua sắm', icon: 'shopping_bag' },
    { value: 'ACCOMMODATION', label: 'Nhận phòng', icon: 'hotel' },
];

const MEAL_OPTIONS = [
    { key: 'BREAKFAST', label: 'Sáng', icon: 'free_breakfast' },
    { key: 'LUNCH', label: 'Trưa', icon: 'restaurant' },
    { key: 'DINNER', label: 'Tối', icon: 'dinner_dining' },
];

const SUGGESTED_TAGS = [
    'instagrammable',
    'family-friendly',
    'eco-friendly',
    'photo-spot',
    'local-food',
    'adventure',
    'wheelchair-accessible',
    'kid-friendly',
    'romantic',
    'budget',
];

// --- Helpers ---
let tmpCounter = 1;
const tempId = () => `tmp-${Date.now()}-${tmpCounter++}`;

const parseCsv = (s) =>
    (s || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

const joinCsv = (arr) => (arr || []).join(',');

const computeDuration = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return null;
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : null;
};

const fmtMinutes = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
};

const fmtVnd = (value) => {
    if (value === null || value === undefined || value === '') return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

const newActivity = (sortOrder = 0) => ({
    _key: tempId(),
    sortOrder,
    startTime: '',
    endTime: '',
    durationMinutes: null,
    title: '',
    description: '',
    activityType: '',
    locationName: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    costEstimate: '',
    costIncluded: true,
    tags: '', // CSV in form state
    locationAddress: '',
    isGatheringEvent: false,
    gatheringEventType: '',
    scheduleStatus: 'ESTIMATED',
});

const fmtCoord = (v) => {
    if (v === '' || v == null) return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n.toFixed(7).replace(/\.?0+$/, '');
};

const newPlace = (visitOrder = 0) => ({
    _key: tempId(),
    locationName: '',
    latitude: '',
    longitude: '',
    visitOrder,
});

const mapPlacesForDay = (tourLocations, dayNumber) =>
    (tourLocations || [])
        .filter((loc) => (loc.dayNumber ?? 1) === dayNumber)
        .sort((a, b) => (a.visitOrder ?? 0) - (b.visitOrder ?? 0))
        .map((loc, idx) => ({
            _key: tempId(),
            locationName: loc.locationName ?? '',
            latitude: fmtCoord(loc.latitude),
            longitude: fmtCoord(loc.longitude),
            visitOrder: loc.visitOrder ?? idx,
        }));

const buildPlacesPayload = (days) =>
    days.flatMap((d, idx) => {
        const dayNumber = d.dayNumber ?? idx + 1;
        return (d.places || [])
            .map((p, pidx) => ({
                dayNumber,
                visitOrder: pidx,
                locationName: p.locationName?.trim() || null,
                latitude: p.latitude === '' || p.latitude == null ? null : Number(p.latitude),
                longitude: p.longitude === '' || p.longitude == null ? null : Number(p.longitude),
            }))
            .filter((p) => p.locationName);
    });

const newDay = (dayNumber, tourLocations = []) => ({
    _key: tempId(),
    dayNumber,
    title: `Ngày ${dayNumber}`,
    description: '',
    summary: '',
    coverImageUrl: '',
    accommodation: '',
    transport: '',
    meals: [], // array of meal keys
    highlights: '',
    places: (() => {
        const mapped = mapPlacesForDay(tourLocations, dayNumber);
        return mapped.length ? mapped : [newPlace(0)];
    })(),
    activities: [],
});

const fromServer = (serverList, tourLocations = []) =>
    serverList.map((d, idx) => ({
        _key: tempId(),
        dayNumber: d.dayNumber ?? idx + 1,
        title: d.title ?? `Ngày ${idx + 1}`,
        description: d.description ?? '',
        summary: d.summary ?? '',
        coverImageUrl: d.coverImageUrl ?? '',
        accommodation: d.accommodation ?? '',
        transport: d.transport ?? '',
        meals: parseCsv(d.mealsIncluded),
        highlights: d.highlights ?? '',
        places: (() => {
            const mapped = mapPlacesForDay(tourLocations, d.dayNumber ?? idx + 1);
            return mapped.length ? mapped : [newPlace(0)];
        })(),
        activities: (d.activities ?? []).map((a, aidx) => ({
            _key: tempId(),
            sortOrder: a.sortOrder ?? aidx,
            startTime: a.startTime ?? '',
            endTime: a.endTime ?? '',
            durationMinutes: a.durationMinutes ?? computeDuration(a.startTime, a.endTime),
            title: a.title ?? '',
            description: a.description ?? '',
            activityType: a.activityType ?? '',
            locationName: a.locationName ?? '',
            latitude: a.latitude ?? '',
            longitude: a.longitude ?? '',
            imageUrl: a.imageUrl ?? '',
            costEstimate: a.costEstimate ?? '',
            costIncluded: a.costIncluded ?? true,
            tags: a.tags ?? '',
            locationAddress: a.locationAddress ?? '',
            isGatheringEvent: a.isGatheringEvent ?? false,
            gatheringEventType: a.gatheringEventType ?? '',
            scheduleStatus: a.scheduleStatus ?? 'ESTIMATED',
        })),
    }));

const toServer = (days) =>
    days.map((d, idx) => ({
        dayNumber: d.dayNumber ?? idx + 1,
        title: d.title?.trim() || `Ngày ${idx + 1}`,
        description: d.description?.trim() || null,
        summary: d.summary?.trim() || null,
        coverImageUrl: d.coverImageUrl?.trim() || null,
        accommodation: d.accommodation?.trim() || null,
        transport: d.transport?.trim() || null,
        mealsIncluded: joinCsv(d.meals) || null,
        highlights: d.highlights?.trim() || null,
        activities: (d.activities || []).map((a, aidx) => ({
            sortOrder: aidx,
            startTime: a.startTime || null,
            endTime: a.endTime || null,
            durationMinutes:
                a.durationMinutes ?? computeDuration(a.startTime, a.endTime) ?? null,
            title: a.title?.trim() || null,
            description: a.description?.trim() || null,
            activityType: a.activityType || null,
            locationName: a.locationName?.trim() || null,
            latitude: a.latitude === '' || a.latitude === null ? null : Number(a.latitude),
            longitude: a.longitude === '' || a.longitude === null ? null : Number(a.longitude),
            imageUrl: a.imageUrl?.trim() || null,
            costEstimate:
                a.costEstimate === '' || a.costEstimate === null ? null : Number(a.costEstimate),
            costIncluded: a.costIncluded ?? true,
            tags: a.tags?.trim() || null,
            locationAddress: a.locationAddress?.trim() || null,
            isGatheringEvent: Boolean(a.isGatheringEvent),
            gatheringEventType: a.gatheringEventType || null,
            scheduleStatus: a.scheduleStatus || null,
        })),
    }));

// Haversine cho tổng quãng đường
const haversineKm = (a, b) => {
    if (!a || !b) return 0;
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

const TourItineraryBuilder = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();

    const [days, setDays] = useState([]);
    const [activeKey, setActiveKey] = useState(null);
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [dirty, setDirty] = useState(false);
    const [geoLookup, setGeoLookup] = useState(null);

    const load = useCallback(async () => {
        if (!tourId) return;
        setLoading(true);
        setErrorMsg('');
        try {
            // Itinerary là dữ liệu chính của màn hình này: nếu fetch lỗi thì phải báo lỗi,
            // không fallback sang form trắng để tránh ghi đè dữ liệu cũ.
            const [detailRes, itin] = await Promise.all([
                getAdminTourDetail(tourId).catch(() => null),
                getTourItinerary(tourId),
            ]);
            setTour(detailRes);
            const tourLocations = detailRes?.locations ?? [];
            const mapped = itin.length
                ? fromServer(itin, tourLocations)
                : [newDay(1, tourLocations)];
            setDays(mapped);
            setActiveKey(mapped[0]?._key ?? null);
            setDirty(false);
        } catch (err) {
            setErrorMsg(err?.message || 'Không tải được dữ liệu lịch trình');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const activeDay = useMemo(
        () => days.find((d) => d._key === activeKey) || null,
        [days, activeKey]
    );
    const activeDayHasActivities = (activeDay?.activities?.length || 0) > 0;

    const markDirty = () => setDirty(true);

    const updateDay = (key, patch) => {
        setDays((prev) => prev.map((d) => (d._key === key ? { ...d, ...patch } : d)));
        markDirty();
    };

    const toggleMeal = (dayKey, meal) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? {
                          ...d,
                          meals: d.meals.includes(meal)
                              ? d.meals.filter((m) => m !== meal)
                              : [...d.meals, meal],
                      }
                    : d
            )
        );
        markDirty();
    };

    const handleAddDay = () => {
        const nextNum = days.length + 1;
        const d = newDay(nextNum, tour?.locations ?? []);
        setDays((prev) => [...prev, d]);
        setActiveKey(d._key);
        markDirty();
    };

    const handleDeleteDay = (key) => {
        if (days.length <= 1) return;
        if (!window.confirm('Xoá ngày này khỏi lịch trình?')) return;
        setDays((prev) => {
            const next = prev.filter((d) => d._key !== key).map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
            if (activeKey === key) setActiveKey(next[0]?._key ?? null);
            return next;
        });
        markDirty();
    };

    const handleAddActivity = (dayKey) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? { ...d, activities: [...d.activities, newActivity(d.activities.length)] }
                    : d
            )
        );
        markDirty();
    };

    const handleFetchPlaceCoords = async (dayKey, placeKey, place) => {
        const name = place.locationName?.trim();
        if (!name) {
            setGeoLookup({
                placeKey,
                error: 'Nhập tên địa điểm trước khi lấy tọa độ.',
            });
            return;
        }

        setGeoLookup({ placeKey, loading: true, error: null, success: null });
        try {
            const hit = await resolveActivityCoordinates({
                locationName: name,
                destinationCity: tour?.destinationCity,
            });
            if (!hit) {
                setGeoLookup({
                    placeKey,
                    error: 'Không tìm thấy tọa độ. Thử tên chi tiết hơn hoặc nhập thủ công.',
                });
                return;
            }
            updatePlace(dayKey, placeKey, {
                latitude: fmtCoord(hit.latitude),
                longitude: fmtCoord(hit.longitude),
            });
            setGeoLookup({ placeKey, success: `Đã điền tọa độ (${hit.label}).` });
            window.setTimeout(() => {
                setGeoLookup((prev) => (prev?.placeKey === placeKey ? null : prev));
            }, 3000);
        } catch (err) {
            setGeoLookup({
                placeKey,
                error: err?.message || 'Lỗi khi tra cứu tọa độ.',
            });
        }
    };

    const updatePlace = (dayKey, placeKey, patch) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? {
                          ...d,
                          places: (d.places || []).map((p) =>
                              p._key === placeKey ? { ...p, ...patch } : p
                          ),
                      }
                    : d
            )
        );
        markDirty();
    };

    const handleAddPlace = (dayKey) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? {
                          ...d,
                          places: [...(d.places || []), newPlace((d.places || []).length)],
                      }
                    : d
            )
        );
        markDirty();
    };

    const deletePlace = (dayKey, placeKey) => {
        setDays((prev) =>
            prev.map((d) => {
                if (d._key !== dayKey) return d;
                const next = (d.places || []).filter((p) => p._key !== placeKey);
                return { ...d, places: next.length ? next : [newPlace(0)] };
            })
        );
        markDirty();
    };

    const handleFetchCoords = async (dayKey, actKey, act) => {
        const place = act.locationName?.trim();
        const address = act.locationAddress?.trim();
        if (!place && !address) {
            setGeoLookup({
                actKey,
                error: 'Nhập tên địa điểm hoặc địa chỉ trước khi lấy tọa độ.',
            });
            return;
        }

        setGeoLookup({ actKey, loading: true, error: null, success: null });
        try {
            const hit = await resolveActivityCoordinates({
                locationName: place,
                locationAddress: address,
                destinationCity: tour?.destinationCity,
            });
            if (!hit) {
                setGeoLookup({
                    actKey,
                    error: 'Không tìm thấy tọa độ. Thử địa chỉ chi tiết hơn hoặc nhập thủ công.',
                });
                return;
            }
            updateActivity(dayKey, actKey, {
                latitude: String(hit.latitude),
                longitude: String(hit.longitude),
            });
            setGeoLookup({
                actKey,
                success: `Đã điền tọa độ (${hit.label}).`,
            });
            window.setTimeout(() => {
                setGeoLookup((prev) => (prev?.actKey === actKey ? null : prev));
            }, 3000);
        } catch (err) {
            setGeoLookup({
                actKey,
                error: err?.message || 'Lỗi khi tra cứu tọa độ. Kiểm tra mạng và thử lại.',
            });
        }
    };

    const updateActivity = (dayKey, actKey, patch) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? {
                          ...d,
                          activities: d.activities.map((a) => {
                              if (a._key !== actKey) return a;
                              const merged = { ...a, ...patch };
                              // tự tính lại durationMinutes khi đổi giờ
                              if (patch.startTime !== undefined || patch.endTime !== undefined) {
                                  merged.durationMinutes = computeDuration(
                                      merged.startTime,
                                      merged.endTime
                                  );
                              }
                              return merged;
                          }),
                      }
                    : d
            )
        );
        markDirty();
    };

    const deleteActivity = (dayKey, actKey) => {
        setDays((prev) =>
            prev.map((d) =>
                d._key === dayKey
                    ? { ...d, activities: d.activities.filter((a) => a._key !== actKey) }
                    : d
            )
        );
        markDirty();
    };

    const moveActivity = (dayKey, actKey, dir) => {
        setDays((prev) =>
            prev.map((d) => {
                if (d._key !== dayKey) return d;
                const idx = d.activities.findIndex((a) => a._key === actKey);
                if (idx < 0) return d;
                const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                if (targetIdx < 0 || targetIdx >= d.activities.length) return d;
                const next = [...d.activities];
                [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
                return { ...d, activities: next };
            })
        );
        markDirty();
    };

    const toggleActivityTag = (dayKey, actKey, tag) => {
        setDays((prev) =>
            prev.map((d) => {
                if (d._key !== dayKey) return d;
                return {
                    ...d,
                    activities: d.activities.map((a) => {
                        if (a._key !== actKey) return a;
                        const current = parseCsv(a.tags);
                        const next = current.includes(tag)
                            ? current.filter((t) => t !== tag)
                            : [...current, tag];
                        return { ...a, tags: next.join(', ') };
                    }),
                };
            })
        );
        markDirty();
    };

    const handleSave = async () => {
        if (!tourId) return;
        setSaving(true);
        setErrorMsg('');
        try {
            const payload = toServer(days);
            const locPayload = buildPlacesPayload(days);
            const fresh = await saveTourItinerary(tourId, payload);
            let freshLocs = tour?.locations ?? [];
            try {
                freshLocs = await saveTourLocations(tourId, locPayload);
            } catch (locErr) {
                if (locErr?.status !== 404) {
                    throw new Error(
                        locErr?.message ||
                            'Đã lưu lịch trình nhưng không lưu được địa điểm. Thử Lưu lại.'
                    );
                }
            }
            setDays(fromServer(fresh, freshLocs));
            setTour((prev) => (prev ? { ...prev, locations: freshLocs } : prev));
            setDirty(false);
            setSuccessMsg('Đã lưu lịch trình và địa điểm');
        } catch (err) {
            setErrorMsg(err?.message || 'Không lưu được lịch trình');
        } finally {
            setSaving(false);
        }
    };

    // Summary stats
    const stats = useMemo(() => {
        const totalActivities = days.reduce((s, d) => s + d.activities.length, 0);
        const totalMeals = days.reduce((s, d) => s + d.meals.length, 0);
        const totalCostExtra = days.reduce(
            (s, d) =>
                s +
                d.activities.reduce(
                    (ss, a) => ss + (!a.costIncluded && a.costEstimate ? Number(a.costEstimate) : 0),
                    0
                ),
            0
        );
        const totalMinutes = days.reduce(
            (s, d) => s + d.activities.reduce((ss, a) => ss + (a.durationMinutes || 0), 0),
            0
        );
        // distance: sum across all activities order, only count consecutive ones with lat/lng
        let totalKm = 0;
        days.forEach((d) => {
            const pts = d.activities
                .map((a) => {
                    const lat = parseFloat(a.latitude);
                    const lng = parseFloat(a.longitude);
                    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
                })
                .filter(Boolean);
            for (let i = 1; i < pts.length; i++) {
                totalKm += haversineKm(pts[i - 1], pts[i]);
            }
        });
        return {
            days: days.length,
            totalActivities,
            totalMeals,
            totalCostExtra,
            totalMinutes,
            totalKm: Math.round(totalKm),
        };
    }, [days]);

    const debugDayCounts = useMemo(
        () =>
            days
                .map((d) => `D${d.dayNumber || '?'}:${(d.activities || []).length}`)
                .join(' | '),
        [days]
    );

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.titleArea}>
                    <button className={styles.backBtn} onClick={() => navigate('/admin/tours')}>
                        <span className="material-icons-round">arrow_back</span>
                    </button>
                    <div>
                        <h1 className={styles.pageTitle}>Xây dựng Lịch trình</h1>
                        <p className={styles.pageSubtitle}>
                            {tour?.title
                                ? `Tour: ${tour.title}`
                                : 'Tuỳ chỉnh hoạt động và điểm đến theo từng ngày.'}
                            {dirty && <span className={styles.dirtyTag}>• Thay đổi chưa lưu</span>}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className={styles.refreshBtn}
                        onClick={load}
                        disabled={loading || saving}
                        title="Tải lại từ server"
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            {loading ? 'hourglass_top' : 'refresh'}
                        </span>
                        Tải lại
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={saving || loading}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>
                            {saving ? 'hourglass_top' : 'save'}
                        </span>
                        {saving ? 'Đang lưu...' : 'Lưu Lịch Trình'}
                    </button>
                </div>
            </div>

            <div className={styles.debugBox}>
                <strong>Debug:</strong>{' '}
                routeTourId=<code>{tourId || '—'}</code> | detailTourId=
                <code>{tour?.id || '—'}</code> | days=
                <code>{days.length}</code> | activities=
                <code>{debugDayCounts || 'none'}</code>
            </div>

            {(errorMsg || successMsg) && (
                <div
                    className={`${styles.banner} ${
                        errorMsg ? styles.bannerError : styles.bannerSuccess
                    }`}
                >
                    <span className="material-icons-round" style={{ fontSize: 18 }}>
                        {errorMsg ? 'error_outline' : 'check_circle'}
                    </span>
                    <span>{errorMsg || successMsg}</span>
                    <button
                        className={styles.bannerClose}
                        onClick={() => {
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        type="button"
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>
                            close
                        </span>
                    </button>
                </div>
            )}

            <div className={styles.builderLayout}>
                {/* Left Column - Form */}
                <div className={styles.itineraryCard}>
                    <div className={styles.dayTabs}>
                        {days.map((day, index) => (
                            <button
                                key={day._key}
                                className={`${styles.dayTab} ${
                                    activeKey === day._key ? styles.dayTabActive : ''
                                }`}
                                onClick={() => setActiveKey(day._key)}
                            >
                                Ngày {index + 1}
                                <span className={styles.dayTabCount}>
                                    {(day.places?.length || 0) + day.activities.length}
                                </span>
                            </button>
                        ))}
                        <button className={styles.addDayBtn} onClick={handleAddDay}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>
                                add
                            </span>
                            Thêm Ngày
                        </button>
                    </div>

                    {activeDay && (
                        <div className={styles.dayContent}>
                            {/* Day Header */}
                            <div className={styles.dayHeader}>
                                <input
                                    type="text"
                                    value={activeDay.title}
                                    onChange={(e) => updateDay(activeDay._key, { title: e.target.value })}
                                    placeholder="Tiêu đề ngày (VD: Khám phá Thủ đô)"
                                />
                                {days.length > 1 && (
                                    <button
                                        className={styles.deleteDayBtn}
                                        onClick={() => handleDeleteDay(activeDay._key)}
                                        title="Xoá ngày này"
                                    >
                                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                                            delete_outline
                                        </span>
                                    </button>
                                )}
                            </div>

                            <div className={styles.placesSection}>
                                <div className={styles.sectionDivider}>
                                    <span>Địa điểm trong ngày</span>
                                </div>
                                <p className={styles.placesHint}>
                                    Nhập <strong>tên địa điểm chính</strong> của ngày — hiển thị trên portal HDV
                                    (thay &quot;Đang cập nhật&quot;). Tọa độ là tuỳ chọn.
                                </p>
                                <div className={styles.placesList}>
                                    {(activeDay.places || []).map((place, pidx) => (
                                        <div key={place._key} className={styles.placeItem}>
                                            <div className={styles.placeIndex}>{pidx + 1}</div>
                                            <div className={styles.placeFields}>
                                                <label className={styles.placeFieldLabel}>
                                                    Tên địa điểm
                                                </label>
                                                <input
                                                    type="text"
                                                    className={styles.activityInput}
                                                    placeholder="VD: Bến xe Cần Thơ, Trường GTVT TP.HCM..."
                                                    value={place.locationName}
                                                    onChange={(e) =>
                                                        updatePlace(activeDay._key, place._key, {
                                                            locationName: e.target.value,
                                                        })
                                                    }
                                                />
                                                <div className={styles.coordRow}>
                                                    <div className={styles.coordField}>
                                                        <label className={styles.placeFieldLabel}>Vĩ độ (Lat)</label>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            className={styles.geoInput}
                                                            placeholder="10.024"
                                                            value={place.latitude}
                                                            onChange={(e) =>
                                                                updatePlace(activeDay._key, place._key, {
                                                                    latitude: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className={styles.coordField}>
                                                        <label className={styles.placeFieldLabel}>Kinh độ (Lng)</label>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            className={styles.geoInput}
                                                            placeholder="105.762"
                                                            value={place.longitude}
                                                            onChange={(e) =>
                                                                updatePlace(activeDay._key, place._key, {
                                                                    longitude: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className={styles.geoFetchRow}>
                                                    <button
                                                        type="button"
                                                        className={styles.geoFetchBtn}
                                                        disabled={
                                                            geoLookup?.placeKey === place._key &&
                                                            geoLookup.loading
                                                        }
                                                        onClick={() =>
                                                            handleFetchPlaceCoords(
                                                                activeDay._key,
                                                                place._key,
                                                                place
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            className="material-icons-round"
                                                            style={{ fontSize: 16 }}
                                                        >
                                                            {geoLookup?.placeKey === place._key &&
                                                            geoLookup.loading
                                                                ? 'hourglass_top'
                                                                : 'my_location'}
                                                        </span>
                                                        Lấy tọa độ tự động
                                                    </button>
                                                    {geoLookup?.placeKey === place._key && geoLookup.error && (
                                                        <span className={styles.geoFetchHintError}>
                                                            {geoLookup.error}
                                                        </span>
                                                    )}
                                                    {geoLookup?.placeKey === place._key && geoLookup.success && (
                                                        <span className={styles.geoFetchHintSuccess}>
                                                            {geoLookup.success}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {(activeDay.places || []).length > 1 && (
                                                <button
                                                    type="button"
                                                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                                    onClick={() => deletePlace(activeDay._key, place._key)}
                                                    title="Xoá địa điểm"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                        close
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className={styles.placeAddBtn}
                                        onClick={() => handleAddPlace(activeDay._key)}
                                    >
                                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                                            add_location_alt
                                        </span>
                                        Thêm địa điểm khác
                                    </button>
                                </div>
                            </div>

                            {/* Summary + meta */}
                            <div className={styles.metaGrid}>
                                <div className={styles.formField}>
                                    <label>Tóm tắt ngắn</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Hook 1-2 câu để khách quan tâm ngay từ đầu..."
                                        value={activeDay.summary}
                                        onChange={(e) =>
                                            updateDay(activeDay._key, { summary: e.target.value })
                                        }
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <AdminImageField
                                        label="Ảnh cover ngày"
                                        value={activeDay.coverImageUrl}
                                        onChange={(v) =>
                                            updateDay(activeDay._key, { coverImageUrl: v })
                                        }
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>Phương tiện</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Xe limousine 9 chỗ, cáp treo, đi bộ..."
                                        value={activeDay.transport}
                                        onChange={(e) =>
                                            updateDay(activeDay._key, { transport: e.target.value })
                                        }
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>Lưu trú</label>
                                    <input
                                        type="text"
                                        placeholder="VD: KS Mường Thanh Đà Nẵng 4*"
                                        value={activeDay.accommodation}
                                        onChange={(e) =>
                                            updateDay(activeDay._key, {
                                                accommodation: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Meals */}
                            <div className={styles.formField}>
                                <label>Bữa ăn bao gồm</label>
                                <div className={styles.mealRow}>
                                    {MEAL_OPTIONS.map((m) => {
                                        const active = activeDay.meals.includes(m.key);
                                        return (
                                            <button
                                                key={m.key}
                                                type="button"
                                                className={`${styles.mealChip} ${
                                                    active ? styles.mealChipActive : ''
                                                }`}
                                                onClick={() => toggleMeal(activeDay._key, m.key)}
                                            >
                                                <span
                                                    className="material-icons-round"
                                                    style={{ fontSize: 16 }}
                                                >
                                                    {m.icon}
                                                </span>
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className={styles.formField}>
                                <label>Điểm nổi bật (mỗi dòng 1 ý)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Cáp treo Bà Nà — Kỷ lục thế giới&#10;Buffet hải sản trên núi"
                                    value={activeDay.highlights}
                                    onChange={(e) =>
                                        updateDay(activeDay._key, { highlights: e.target.value })
                                    }
                                />
                            </div>

                            {/* Description */}
                            <div className={styles.formField}>
                                <label>Mô tả tổng quan ngày</label>
                                <textarea
                                    rows={3}
                                    placeholder="Mô tả tổng thể ngày này..."
                                    value={activeDay.description}
                                    onChange={(e) =>
                                        updateDay(activeDay._key, { description: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.sectionDivider}>
                                <span>Hoạt động trong ngày</span>
                            </div>

                            {/* Activities */}
                            <div className={styles.activityList}>
                                {activeDay.activities.map((act, idx) => (
                                    <div key={act._key} className={styles.activityItem}>
                                        <div className={styles.activityDot}>{idx + 1}</div>
                                        <div className={styles.activityActions}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => moveActivity(activeDay._key, act._key, 'up')}
                                                disabled={idx === 0}
                                                title="Di chuyển lên"
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                    arrow_upward
                                                </span>
                                            </button>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => moveActivity(activeDay._key, act._key, 'down')}
                                                disabled={idx === activeDay.activities.length - 1}
                                                title="Di chuyển xuống"
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                    arrow_downward
                                                </span>
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                                onClick={() => deleteActivity(activeDay._key, act._key)}
                                                title="Xoá hoạt động"
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                    close
                                                </span>
                                            </button>
                                        </div>

                                        {/* Row 1: thời gian + loại + tiêu đề */}
                                        <div className={styles.actGridTop}>
                                            <div className={styles.timeGroup}>
                                                <input
                                                    type="time"
                                                    value={act.startTime || ''}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            startTime: e.target.value,
                                                        })
                                                    }
                                                />
                                                <span className={styles.timeSep}>→</span>
                                                <input
                                                    type="time"
                                                    value={act.endTime || ''}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            endTime: e.target.value,
                                                        })
                                                    }
                                                />
                                                {act.durationMinutes != null && (
                                                    <span className={styles.durTag}>
                                                        {fmtMinutes(act.durationMinutes)}
                                                    </span>
                                                )}
                                            </div>
                                            <select
                                                className={styles.typeSelect}
                                                value={act.activityType || ''}
                                                onChange={(e) =>
                                                    updateActivity(activeDay._key, act._key, {
                                                        activityType: e.target.value,
                                                    })
                                                }
                                            >
                                                {ACTIVITY_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <input
                                            type="text"
                                            className={styles.actTitle}
                                            placeholder="Tiêu đề hoạt động..."
                                            value={act.title}
                                            onChange={(e) =>
                                                updateActivity(activeDay._key, act._key, {
                                                    title: e.target.value,
                                                })
                                            }
                                        />

                                        {/* Row: location + geo */}
                                        <div className={styles.actGridGeo}>
                                            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                                <div className={styles.inputIcon}>
                                                    <span className="material-icons-round" style={{ fontSize: 18 }}>
                                                        place
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    className={styles.activityInput}
                                                    placeholder="Tên địa điểm"
                                                    value={act.locationName}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            locationName: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                className={styles.geoInput}
                                                placeholder="Lat"
                                                step="0.0000001"
                                                value={act.latitude}
                                                onChange={(e) =>
                                                    updateActivity(activeDay._key, act._key, {
                                                        latitude: e.target.value,
                                                    })
                                                }
                                            />
                                            <input
                                                type="number"
                                                className={styles.geoInput}
                                                placeholder="Lng"
                                                step="0.0000001"
                                                value={act.longitude}
                                                onChange={(e) =>
                                                    updateActivity(activeDay._key, act._key, {
                                                        longitude: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className={styles.actGridGeo}>
                                            <input
                                                type="text"
                                                className={styles.activityInput}
                                                placeholder="Địa chỉ chi tiết (tuỳ chọn)"
                                                value={act.locationAddress || ''}
                                                onChange={(e) =>
                                                    updateActivity(activeDay._key, act._key, {
                                                        locationAddress: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className={styles.geoFetchRow}>
                                            <button
                                                type="button"
                                                className={styles.geoFetchBtn}
                                                disabled={geoLookup?.actKey === act._key && geoLookup.loading}
                                                onClick={() =>
                                                    handleFetchCoords(activeDay._key, act._key, act)
                                                }
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                    {geoLookup?.actKey === act._key && geoLookup.loading
                                                        ? 'hourglass_top'
                                                        : 'my_location'}
                                                </span>
                                                {geoLookup?.actKey === act._key && geoLookup.loading
                                                    ? 'Đang tra cứu...'
                                                    : 'Lấy tọa độ tự động'}
                                            </button>
                                            {geoLookup?.actKey === act._key && geoLookup.error && (
                                                <span className={styles.geoFetchHintError}>{geoLookup.error}</span>
                                            )}
                                            {geoLookup?.actKey === act._key && geoLookup.success && (
                                                <span className={styles.geoFetchHintSuccess}>{geoLookup.success}</span>
                                            )}
                                        </div>

                                        <div className={styles.actGridTop}>
                                            <label className={styles.inlineCheck}>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(act.isGatheringEvent)}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            isGatheringEvent: e.target.checked,
                                                        })
                                                    }
                                                />
                                                Hoạt động tập trung / lên xe
                                            </label>
                                            {act.isGatheringEvent && (
                                                <select
                                                    className={styles.typeSelect}
                                                    value={act.gatheringEventType || ''}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            gatheringEventType: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">— Loại tập trung —</option>
                                                    <option value="DEPARTURE">Khởi hành</option>
                                                    <option value="RETURN_TO_BUS">Tập trung lên xe</option>
                                                    <option value="MEETING">Họp đoàn</option>
                                                    <option value="CHECK_IN">Nhận phòng</option>
                                                    <option value="CHECK_OUT">Trả phòng</option>
                                                </select>
                                            )}
                                            <select
                                                className={styles.typeSelect}
                                                value={act.scheduleStatus || 'ESTIMATED'}
                                                onChange={(e) =>
                                                    updateActivity(activeDay._key, act._key, {
                                                        scheduleStatus: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="CONFIRMED">Đã xác nhận</option>
                                                <option value="ESTIMATED">Dự kiến</option>
                                                <option value="UNAVAILABLE">Chưa có</option>
                                            </select>
                                        </div>

                                        {/* Row: image + cost */}
                                        <div className={styles.actGridMedia}>
                                            <div style={{ minWidth: 0 }}>
                                                <AdminImageField
                                                    label="Ảnh hoạt động"
                                                    value={act.imageUrl}
                                                    onChange={(v) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            imageUrl: v,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className={styles.costGroup}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="Chi phí (VND)"
                                                    value={act.costEstimate}
                                                    onChange={(e) =>
                                                        updateActivity(activeDay._key, act._key, {
                                                            costEstimate: e.target.value,
                                                        })
                                                    }
                                                />
                                                <label className={styles.includedToggle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!act.costIncluded}
                                                        onChange={(e) =>
                                                            updateActivity(activeDay._key, act._key, {
                                                                costIncluded: e.target.checked,
                                                            })
                                                        }
                                                    />
                                                    <span>Đã bao gồm</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Tags chips */}
                                        <div className={styles.tagsRow}>
                                            {SUGGESTED_TAGS.map((tag) => {
                                                const selected = parseCsv(act.tags).includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        className={`${styles.tagChip} ${
                                                            selected ? styles.tagChipActive : ''
                                                        }`}
                                                        onClick={() =>
                                                            toggleActivityTag(activeDay._key, act._key, tag)
                                                        }
                                                    >
                                                        #{tag}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <textarea
                                            className={styles.activityDesc}
                                            rows={2}
                                            placeholder="Mô tả chi tiết hoạt động..."
                                            value={act.description}
                                            onChange={(e) =>
                                                updateActivity(activeDay._key, act._key, {
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            {!activeDayHasActivities && (
                                <div className={styles.emptyActivities}>
                                    Chưa có `tour_activity` cho ngày này. Hãy tạo hoạt động đầu tiên.
                                </div>
                            )}

                            <button
                                className={styles.addActivityBtn}
                                onClick={() => handleAddActivity(activeDay._key)}
                            >
                                <span className="material-icons-round">add_circle_outline</span>
                                {activeDayHasActivities
                                    ? 'Thêm hoạt động mới'
                                    : 'Tạo hoạt động đầu tiên'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>Tóm tắt Lịch trình</h3>

                    <div className={styles.statList}>
                        <SummaryStat icon="calendar_today" label="Tổng thời gian" value={`${stats.days} Ngày`} />
                        <SummaryStat
                            icon="location_on"
                            label="Số hoạt động"
                            value={`${stats.totalActivities} hoạt động`}
                        />
                        <SummaryStat
                            icon="schedule"
                            label="Tổng thời lượng"
                            value={stats.totalMinutes ? fmtMinutes(stats.totalMinutes) : '—'}
                        />
                        <SummaryStat icon="map" label="Quãng đường dự kiến" value={`~${stats.totalKm} km`} />
                        <SummaryStat
                            icon="restaurant"
                            label="Bữa ăn bao gồm"
                            value={`${stats.totalMeals} bữa`}
                        />
                        <SummaryStat
                            icon="account_balance_wallet"
                            label="Chi phí bổ sung dự kiến"
                            value={fmtVnd(stats.totalCostExtra)}
                            highlight={stats.totalCostExtra > 0}
                        />
                    </div>

                    <div className={styles.tourInfo}>
                        <img
                            src={tour?.images?.[0]?.imageUrl || PLACEHOLDER_IMG}
                            alt="Tour Preview"
                            className={styles.tourImage}
                            onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                        />
                        <span className={styles.tourCode}>
                            Slug: {tour?.slug ? `/${tour.slug}` : `TEMP-${tourId}`}
                        </span>
                        <h4 className={styles.tourName}>{tour?.title || 'Tour Mới Khởi Tạo'}</h4>
                        <p className={styles.statLabel}>
                            Vui lòng hoàn thành lịch trình trước khi công bố tour này.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryStat = ({ icon, label, value, highlight }) => (
    <div className={styles.statItem}>
        <div className={`${styles.statIcon} ${highlight ? styles.statIconWarn : ''}`}>
            <span className="material-icons-round">{icon}</span>
        </div>
        <div className={styles.statInfo}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
        </div>
    </div>
);

export default TourItineraryBuilder;
