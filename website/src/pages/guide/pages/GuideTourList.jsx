import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './GuideTourList.module.css';
import { listMyGuideSessions } from '../../../api/guideTours';

const FILTERS = [
    { key: 'upcoming', label: 'Sắp diễn ra' },
    { key: 'ongoing', label: 'Đang diễn ra' },
    { key: 'completed', label: 'Đã hoàn thành' },
];

const GuideTourList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const [activeFilter, setActiveFilter] = useState('upcoming');
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                setError('');
                const data = await listMyGuideSessions();
                if (mounted) setTours(data);
            } catch (err) {
                if (mounted) setError(err?.message || 'Khong the tai danh sach tour');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    const filteredTours = useMemo(
        () =>
            tours.filter((tour) => {
                if ((tour?.status || 'upcoming') !== activeFilter) return false;
                if (!query) return true;
                const haystack = `${tour.tourTitle || ''} ${tour.tourCode || ''}`.toLowerCase();
                return haystack.includes(query);
            }),
        [tours, activeFilter, query],
    );

    const toShortDate = (dateStr) => {
        if (!dateStr) return 'Dang cap nhat';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Danh sách Tour được giao</h1>
                    <p className={styles.pageSubtitle}>Quản lý và điều hành các chuyến đi của bạn.</p>
                </div>
                <div className={styles.filterGroup}>
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className={styles.pageSubtitle} style={{ color: '#dc2626' }}>{error}</div>}
            {loading && <div className={styles.pageSubtitle}>Dang tai danh sach tour...</div>}
            {!loading && (
            <div className={styles.tourGrid}>
                {filteredTours.map(tour => (
                    <div key={tour.sessionId} className={styles.tourCard}>
                        <div className={styles.tourCardHeader}>
                            <span className={`${styles.tourBadge} ${styles.badge_future}`}>
                                {toShortDate(tour.startDate)}
                            </span>
                            <span className={styles.tourId}>Mã: {tour.tourCode || 'N/A'}</span>
                        </div>
                        <div className={styles.tourCardBody}>
                            <img src={tour.thumbnailUrl || 'https://picsum.photos/400/220'} alt={tour.tourTitle} className={styles.tourImage} />
                            <div className={styles.tourInfo}>
                                <h3 className={styles.tourName}>{tour.tourTitle}</h3>
                                <div className={styles.tourMeta}>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>schedule</span>
                                        <span>{toShortDate(tour.startDate)} - {toShortDate(tour.endDate)}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>location_on</span>
                                        <span>{tour.location || 'Dang cap nhat'}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>groups</span>
                                        <span>{tour.currentParticipants}/{tour.maxParticipants} khach</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.tourProgress}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${tour.maxParticipants ? Math.round((tour.currentParticipants / tour.maxParticipants) * 100) : 0}%` }}
                                />
                            </div>
                            <span className={styles.progressLabel}>Check-in: {tour.checkedInParticipants || 0}</span>
                        </div>
                        <div className={styles.tourCardFooter}>
                            <button className={styles.btnOutline} onClick={() => navigate(`/guide/tours/${tour.sessionId}`)}>Xem chi tiết</button>
                            <button className={styles.btnPrimary} onClick={() => navigate(`/guide/tours/${tour.sessionId}`)}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>travel_explore</span>
                                Quan ly tour
                            </button>
                        </div>
                    </div>
                ))}
                {!filteredTours.length && (
                    <div className={styles.pageSubtitle}>Khong co tour nao trong muc nay.</div>
                )}
            </div>
            )}
        </div>
    );
};

export default GuideTourList;
