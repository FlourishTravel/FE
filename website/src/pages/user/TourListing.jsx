import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, Users, ChevronLeft, ChevronRight, ChevronDown, RotateCcw, Calendar } from 'lucide-react';
import styles from './TourListing.module.css';
import { listPublicTours } from '../../api/tours';
import { listCategories } from '../../api/categories';
import { resolveMediaUrl } from '../../api/config';

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

const BUDGET_OPTIONS = [
    { key: 'all', label: 'Tất cả' },
    { key: '500k', label: '≤ 500k' },
    { key: 'dưới 3tr', label: 'Dưới 3tr' },
    { key: '10tr+', label: 'Từ 10tr' },
];

function budgetToApiRange(key) {
    switch (key) {
        case '500k':
            return { minPrice: undefined, maxPrice: 500_000 };
        case 'dưới 3tr':
            return { minPrice: undefined, maxPrice: 3_000_000 };
        case '10tr+':
            return { minPrice: 10_000_000, maxPrice: undefined };
        default:
            return { minPrice: undefined, maxPrice: undefined };
    }
}

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

function formatGroupHint(t) {
    const es = t?.earliestSession;
    if (es?.maxParticipants != null) return `Tối đa ${es.maxParticipants} khách/đợt`;
    return 'Nhóm theo lịch khởi hành';
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

function getDeparturePoint(t) {
    if (t?.locations && t.locations[0]?.locationName) {
        return t.locations[0].locationName;
    }
    return 'TP. Hồ Chí Minh';
}

const TourListing = () => {
    const [destinationInput, setDestinationInput] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState('all');
    const [savedTours, setSavedTours] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('Đề xuất');
    const [categories, setCategories] = useState([]);
    const [tours, setTours] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [applied, setApplied] = useState({
        destination: '',
        categoryId: null,
        budget: 'all',
    });

    useEffect(() => {
        listCategories()
            .then((list) => setCategories(Array.isArray(list) ? list : []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            const { minPrice, maxPrice } = budgetToApiRange(applied.budget);
            try {
                const res = await listPublicTours({
                    destination: applied.destination || undefined,
                    categoryId: applied.categoryId || undefined,
                    minPrice,
                    maxPrice,
                    page: currentPage - 1,
                    size: 12,
                });
                if (!alive) return;
                setTours(res.content);
                setTotalPages(Math.max(1, res.totalPages || 1));
                setTotalElements(res.totalElements ?? 0);
            } catch (e) {
                if (!alive) return;
                setTours([]);
                setError(e.message || 'Không tải được danh sách tour.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [applied, currentPage]);

    const displayTours = useMemo(() => {
        const arr = [...tours];
        if (sortBy === 'Giá: Thấp đến Cao') {
            arr.sort((a, b) => (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0));
        } else if (sortBy === 'Giá: Cao đến Thấp') {
            arr.sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0));
        } else if (sortBy === 'Thời gian') {
            arr.sort((a, b) => (a.durationDays || 0) - (b.durationDays || 0));
        }
        return arr;
    }, [tours, sortBy]);

    const toggleSave = (id) => {
        setSavedTours((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    const resetFilters = () => {
        setDestinationInput('');
        setSelectedCategoryId(null);
        setSelectedBudget('all');
        setCurrentPage(1);
        setApplied({ destination: '', categoryId: null, budget: 'all' });
    };

    const applyFilters = () => {
        setApplied({
            destination: destinationInput.trim(),
            categoryId: selectedCategoryId,
            budget: selectedBudget,
        });
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

    return (
        <div className={styles.pageContainer}>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2 className={styles.sidebarTitle}>Bộ lọc</h2>
                        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
                            <RotateCcw className={styles.resetIcon} /> Đặt lại
                        </button>
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>TÌM THEO TÊN / ĐIỂM ĐẾN</h3>
                        <input
                            type="search"
                            value={destinationInput}
                            onChange={(e) => setDestinationInput(e.target.value)}
                            placeholder="Ví dụ: Đà Nẵng, Bali..."
                            className={styles.sortSelect}
                            style={{ width: '100%', padding: '10px 12px' }}
                        />
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>DANH MỤC</h3>
                        <div className={styles.sustainPills}>
                            <button
                                type="button"
                                className={`${styles.sustainPill} ${selectedCategoryId == null ? styles.sustainActive : ''}`}
                                onClick={() => setSelectedCategoryId(null)}
                            >
                                Tất cả
                            </button>
                            {categories.map((c) => (
                                <button
                                    type="button"
                                    key={c.id}
                                    className={`${styles.sustainPill} ${selectedCategoryId === c.id ? styles.sustainActive : ''}`}
                                    onClick={() => setSelectedCategoryId(c.id)}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>NGÂN SÁCH (GIÁ TOUR)</h3>
                        <div className={styles.budgetRow}>
                            {BUDGET_OPTIONS.map((b) => (
                                <button
                                    type="button"
                                    key={b.key}
                                    className={`${styles.budgetBtn} ${selectedBudget === b.key ? styles.budgetActive : ''}`}
                                    onClick={() => setSelectedBudget(b.key)}
                                >
                                    {b.label}
                                </button>
                            ))}
                        </div>
                        <div className={styles.budgetBar}>
                            <div className={styles.budgetFill}></div>
                        </div>
                    </div>

                    <button type="button" className={styles.applyBtn} onClick={applyFilters}>
                        Áp dụng bộ lọc
                    </button>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.mainHeader}>
                        <div>
                            <h1 className={styles.mainTitle}>Khám Phá Trải Nghiệm Độc Đáo</h1>
                            <p className={styles.mainSubtitle}>
                                {loading
                                    ? 'Đang tải hành trình từ FlourishTravel...'
                                    : `Hiển thị ${displayTours.length} / ${totalElements} tour còn chỗ (trang ${currentPage} / ${totalPages}).`}
                            </p>
                            {error ? (
                                <p style={{ color: '#c0392b', marginTop: 8 }}>{error}</p>
                            ) : null}
                        </div>
                        <div className={styles.sortContainer}>
                            <span className={styles.sortLabel}>Sắp xếp:</span>
                            <div className={styles.sortDropdown}>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option>Đề xuất</option>
                                    <option>Giá: Thấp đến Cao</option>
                                    <option>Giá: Cao đến Thấp</option>
                                    <option>Thời gian</option>
                                </select>
                                <ChevronDown className={styles.sortIcon} />
                            </div>
                        </div>
                    </div>

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
                                return (
                                    <div key={tour.id} className={styles.tourCard}>
                                        {/* Left Image Section */}
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
                                                className={`${styles.heartBtn} ${savedTours.includes(tour.id) ? styles.heartActive : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleSave(tour.id);
                                                }}
                                            >
                                                <Heart className={styles.heartIcon} />
                                            </button>
                                        </div>

                                        {/* Right Details Section */}
                                        <div className={styles.cardContent}>
                                            {/* Tag & Code Row */}
                                            <div className={styles.cardHeaderRow}>
                                                <span className={styles.tagLabel}>{catName.toUpperCase()}</span>
                                                <span className={styles.tourCode}>Mã tour: {getTourCode(tour)}</span>
                                            </div>

                                            {/* Title */}
                                            <Link to={`/tours/${tour.id}`} className={styles.titleLink}>
                                                <h3 className={styles.cardTitle}>{tour.title}</h3>
                                            </Link>

                                            {/* Info Grid */}
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

                                            {/* Bottom Separator & Pricing/CTA */}
                                            <div className={styles.cardFooterDivider}></div>
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

                    {!loading && displayTours.length === 0 && !error ? (
                        <p style={{ textAlign: 'center', padding: 32, color: '#555' }}>
                            Chưa có tour phù hợp bộ lọc. Thử đổi ngân sách hoặc danh mục — hoặc{' '}
                            <button type="button" style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }} onClick={resetFilters}>
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
