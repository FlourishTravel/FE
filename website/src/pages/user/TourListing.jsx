import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    MapPin,
    Heart,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    Calendar,
    SlidersHorizontal,
} from 'lucide-react';
import styles from './TourListing.module.css';
import filterStyles from '../../components/tourFilters/tourFilters.module.css';
import { listPublicTours } from '../../api/tours';
import { listCategories } from '../../api/categories';
import { resolveMediaUrl } from '../../api/config';
import { addFavorite, listFavorites, removeFavorite } from '../../api/favorites';
import { useAuth } from '../../context/AuthContext';
import {
    TourFilterSidebar,
    ActiveFilterChips,
    CategoryDropdown,
    useTourFilters,
} from '../../components/tourFilters';
import {
    applyClientFilters,
    filtersToApiParams,
    isValidUuid,
    needsClientFiltering,
    sortTours,
} from '../../components/tourFilters/tourFilterUtils';

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

const PAGE_SIZE = 12;

function categoryTagClass(name) {
    if (!name) return 'green';
    return ['green', 'navy', 'red'][name.length % 3];
}

function formatDuration(t) {
    const d = t?.durationDays;
    const n = t?.durationNights;
    if (d && n != null) return `${d} ngày / ${n} đêm`;
    if (d) return `${d} ngày`;
    return '—';
}

function remainingSlots(t) {
    const es = t?.earliestSession;
    if (!es || es.status !== 'scheduled') return null;
    const max = es.maxParticipants ?? 0;
    const cur = es.currentParticipants ?? 0;
    const r = max - cur;
    return r > 0 ? r : null;
}

function formatStartDate(t) {
    const es = t?.earliestSession;
    if (!es || !es.startDate) return 'Liên hệ';
    try {
        const d = new Date(es.startDate);
        if (isNaN(d.getTime())) return 'Liên hệ';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return 'Liên hệ';
    }
}

function getTourCode(t) {
    if (t?.slug) return t.slug.toUpperCase();
    if (t?.id) return `FL-TOUR-${String(t.id).slice(0, 5).toUpperCase()}`;
    return 'FL-TOUR-GEN';
}

const SEGMENT_TITLES = {
    domestic: 'Tour trong nước',
    international: 'Tour quốc tế',
    school: 'Tour trường học',
    corporate: 'Tour doanh nghiệp',
};

function getDeparturePoint(t) {
    if (t?.locations && t.locations[0]?.locationName) {
        return t.locations[0].locationName;
    }
    return 'TP. Hồ Chí Minh';
}

const TourListing = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const destinationFromQuery = searchParams.get('destination') || '';
    const segmentFromQuery = searchParams.get('segment') || '';
    const categoryIdFromQuery = searchParams.get('categoryId') || '';
    const wishlistOnly = searchParams.get('wishlist') === '1';

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const {
        draft,
        applied,
        patchDraft,
        apply,
        reset,
        syncFilters,
        activeCount,
        draftCount,
        chips,
    } = useTourFilters(destinationFromQuery, categories);

    const [savedTours, setSavedTours] = useState([]);
    const [favoriteLoadingIds, setFavoriteLoadingIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [tours, setTours] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const clientFilterMode = useMemo(() => needsClientFiltering(applied), [applied]);

    useEffect(() => {
        let alive = true;
        setCategoriesLoading(true);
        listCategories()
            .then((list) => {
                if (!alive) return;
                setCategories(Array.isArray(list) ? list : []);
            })
            .catch(() => {
                if (!alive) return;
                setCategories([]);
            })
            .finally(() => {
                if (alive) setCategoriesLoading(false);
            });
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;
        if (!user) {
            setSavedTours([]);
            return undefined;
        }
        (async () => {
            try {
                const list = await listFavorites();
                if (!alive) return;
                setSavedTours(list.map((item) => String(item.tourId)));
            } catch {
                if (!alive) return;
                setSavedTours([]);
            }
        })();
        return () => {
            alive = false;
        };
    }, [user]);

    useEffect(() => {
        syncFilters({
            ...(destinationFromQuery ? { search: destinationFromQuery } : {}),
            categories:
                categoryIdFromQuery && isValidUuid(categoryIdFromQuery)
                    ? [categoryIdFromQuery]
                    : [],
        });
        setCurrentPage(1);
    }, [destinationFromQuery, categoryIdFromQuery, syncFilters]);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            const apiBase = filtersToApiParams(applied, segmentFromQuery);
            try {
                const res = await listPublicTours({
                    ...apiBase,
                    page: clientFilterMode ? 0 : currentPage - 1,
                    size: clientFilterMode ? 60 : PAGE_SIZE,
                });
                if (!alive) return;
                setTours(res.content);
                if (clientFilterMode) {
                    const filtered = sortTours(applyClientFilters(res.content, applied), applied.sort);
                    setTotalElements(filtered.length);
                    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1));
                } else {
                    setTotalPages(Math.max(1, res.totalPages || 1));
                    setTotalElements(res.totalElements ?? 0);
                }
            } catch (e) {
                if (!alive) return;
                console.warn('Tour listing fetch failed:', e);
                setTours([]);
                setTotalElements(0);
                setTotalPages(1);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [applied, currentPage, segmentFromQuery, clientFilterMode]);

    const displayTours = useMemo(() => {
        let arr = clientFilterMode
            ? applyClientFilters(tours, applied)
            : [...tours];
        if (wishlistOnly) {
            arr = arr.filter((t) => savedTours.includes(String(t.id)));
        }
        arr = sortTours(arr, applied.sort);
        if (clientFilterMode) {
            const start = (currentPage - 1) * PAGE_SIZE;
            arr = arr.slice(start, start + PAGE_SIZE);
        }
        return arr;
    }, [tours, applied, wishlistOnly, savedTours, clientFilterMode, currentPage]);

    const toggleSave = async (tourId) => {
        if (!user) {
            alert('Vui lòng đăng nhập để lưu tour yêu thích.');
            return;
        }
        const id = String(tourId);
        if (favoriteLoadingIds.includes(id)) return;
        setFavoriteLoadingIds((prev) => [...prev, id]);
        const isSaved = savedTours.includes(id);
        try {
            if (isSaved) {
                await removeFavorite(id);
                setSavedTours((prev) => prev.filter((s) => s !== id));
            } else {
                await addFavorite(id);
                setSavedTours((prev) => (prev.includes(id) ? prev : [...prev, id]));
            }
        } catch (e) {
            alert(e.message || 'Không thể cập nhật yêu thích.');
        } finally {
            setFavoriteLoadingIds((prev) => prev.filter((x) => x !== id));
        }
    };

    const handleApply = () => {
        apply();
        setCurrentPage(1);
        setMobileFilterOpen(false);
    };

    const handleReset = () => {
        reset();
        setCurrentPage(1);
    };

    const getTagClass = (color) => {
        switch (color) {
            case 'green':
                return styles.tagGreen;
            case 'navy':
                return styles.tagNavy;
            case 'red':
                return styles.tagRed;
            default:
                return styles.tagGreen;
        }
    };

    const handleCategoryDropdown = (categoryId) => {
        syncFilters({ categories: categoryId ? [categoryId] : [] });
        setCurrentPage(1);
    };

    const dropdownCategoryValue =
        applied.categories?.length === 1 ? String(applied.categories[0]) : null;

    const pageTitle = wishlistOnly
        ? 'Tour yêu thích'
        : SEGMENT_TITLES[segmentFromQuery] || 'Khám Phá Trải Nghiệm Độc Đáo';

    return (
        <div className={styles.pageContainer}>
            <div className={styles.layout}>
                <TourFilterSidebar
                    draft={draft}
                    patchDraft={patchDraft}
                    onApply={handleApply}
                    onReset={handleReset}
                    activeCount={activeCount}
                    draftCount={draftCount}
                    mobileOpen={mobileFilterOpen}
                    onMobileClose={() => setMobileFilterOpen(false)}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                />

                <main className={styles.mainContent}>
                    <div className={styles.mainHeader}>
                        <div>
                            <h1 className={styles.mainTitle}>{pageTitle}</h1>
                            <p className={styles.mainSubtitle}>
                                {loading
                                    ? 'Đang tải hành trình từ FlourishTravel...'
                                    : displayTours.length === 0
                                      ? 'Không tìm thấy tour phù hợp với bộ lọc hiện tại.'
                                      : `Hiển thị ${displayTours.length} / ${totalElements} tour (trang ${currentPage} / ${totalPages}).`}
                            </p>
                        </div>
                        <div className={filterStyles.headerActions}>
                            <CategoryDropdown
                                categories={categories}
                                loading={categoriesLoading}
                                value={dropdownCategoryValue}
                                multipleSelected={(applied.categories?.length || 0) > 1}
                                onChange={handleCategoryDropdown}
                            />
                            <button
                                type="button"
                                className={filterStyles.mobileToggle}
                                onClick={() => setMobileFilterOpen(true)}
                            >
                                <SlidersHorizontal size={18} />
                                Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ''}
                            </button>
                        </div>
                    </div>

                    <ActiveFilterChips chips={chips} onClearAll={handleReset} />

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                            <span>Đang tải...</span>
                        </div>
                    ) : (
                        <div className={styles.tourGrid}>
                            {displayTours.map((tour) => {
                                const img = resolveMediaUrl(tour.thumbnailUrl) || PLACEHOLDER_IMG;
                                const catName = tour.category?.name || 'TRẢI NGHIỆM';
                                const tagColor = categoryTagClass(tour.category?.name);
                                const spots = remainingSlots(tour);
                                const tourId = String(tour.id);
                                return (
                                    <div key={tour.id} className={styles.tourCard}>
                                        <div className={styles.cardImageContainer}>
                                            <Link to={`/tours/${tour.id}`} className={styles.imageLink}>
                                                <img src={img} alt={tour.title} className={styles.cardImage} />
                                            </Link>
                                            <span className={`${styles.cardTag} ${getTagClass(tagColor)}`}>{catName}</span>
                                            {spots != null ? (
                                                <span className={styles.spotsLeft}>Chỉ còn {spots} chỗ</span>
                                            ) : null}
                                            <button
                                                type="button"
                                                className={`${styles.heartBtn} ${savedTours.includes(tourId) ? styles.heartActive : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleSave(tourId);
                                                }}
                                                disabled={favoriteLoadingIds.includes(tourId)}
                                            >
                                                <Heart className={styles.heartIcon} />
                                            </button>
                                        </div>

                                        <div className={styles.cardContent}>
                                            <div className={styles.cardHeaderRow}>
                                                <span className={styles.tagLabel}>{catName.toUpperCase()}</span>
                                                <span className={styles.tourCode}>Mã tour: {getTourCode(tour)}</span>
                                            </div>

                                            <Link to={`/tours/${tour.id}`} className={styles.titleLink}>
                                                <h3 className={styles.cardTitle}>{tour.title}</h3>
                                            </Link>

                                            <div className={styles.infoGrid}>
                                                <div className={styles.infoItem}>
                                                    <MapPin className={styles.infoIcon} />
                                                    <span className={styles.infoLabel}>Khởi hành từ:</span>
                                                    <span className={styles.infoValue}>{getDeparturePoint(tour)}</span>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <Calendar className={styles.infoIcon} />
                                                    <span className={styles.infoLabel}>Ngày khởi hành:</span>
                                                    <span className={styles.infoValue}>{formatStartDate(tour)}</span>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <Users className={styles.infoIcon} />
                                                    <span className={styles.infoLabel}>Số chỗ nhận:</span>
                                                    <span className={styles.infoValue}>
                                                        {spots != null ? `${spots} chỗ` : 'Còn chỗ'}
                                                    </span>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <Clock className={styles.infoIcon} />
                                                    <span className={styles.infoLabel}>Thời gian:</span>
                                                    <span className={styles.infoValue}>{formatDuration(tour)}</span>
                                                </div>
                                            </div>

                                            <div className={styles.cardFooterDivider} />
                                            <div className={styles.cardFooter}>
                                                <div className={styles.priceContainer}>
                                                    <span className={styles.priceLabel}>Giá trọn gói từ</span>
                                                    <span className={styles.priceValue}>
                                                        {(Number(tour.basePrice) || 0).toLocaleString('vi-VN')} VNĐ
                                                    </span>
                                                </div>
                                                <div className={styles.actionGroup}>
                                                    <Link to={`/tours/${tour.id}`} className={styles.detailBtn}>
                                                        Xem ngày khác
                                                    </Link>
                                                    <Link to={`/checkout/${tour.id}`} className={styles.bookNowBtn}>
                                                        Đặt ngay
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && displayTours.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: 32, color: '#555' }}>
                            Chưa có tour phù hợp bộ lọc. Thử đổi điều kiện — hoặc{' '}
                            <button
                                type="button"
                                style={{
                                    textDecoration: 'underline',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={handleReset}
                            >
                                xóa bộ lọc
                            </button>
                            .
                        </p>
                    ) : null}

                    <div className={styles.pagination}>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className={styles.pageIcon} />
                        </button>
                        <span className={styles.pageDots} style={{ padding: '0 12px' }}>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className={styles.pageIcon} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TourListing;
