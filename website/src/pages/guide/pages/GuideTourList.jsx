import React, { useState } from 'react';
import styles from './GuideTourList.module.css';

const TOURS = [
    {
        id: 'FL-HN-092',
        name: 'Khám phá Văn hóa Phố Cổ Hà Nội',
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80',
        time: '08:00 - 12:00 (4 giờ)',
        location: 'Hồ Hoàn Kiếm, Hà Nội',
        guests: '12 Khách (2 Trẻ em)',
        badge: 'Hôm nay',
        badgeType: 'today',
        status: 'starting',
        progress: 30,
    },
    {
        id: 'FL-NB-104',
        name: 'Hành trình Tràng An – Bái Đính',
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
        time: '07:30 - 18:00 (Cả ngày)',
        location: 'Ninh Bình',
        guests: '25 Khách (Đoàn VIP)',
        badge: 'Ngày mai',
        badgeType: 'tomorrow',
        status: 'upcoming',
        progress: 0,
    },
    {
        id: 'FL-HL-210',
        name: 'Nghỉ dưỡng 2N1Đ Cruise Hạ Long',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80',
        time: '2 Ngày 1 Đêm',
        location: 'Vịnh Hạ Long, Quảng Ninh',
        guests: '8 Khách (Gia đình)',
        badge: '15 Thg 10',
        badgeType: 'future',
        status: 'upcoming',
        progress: 0,
    },
];

const FILTERS = [
    { key: 'upcoming', label: 'Sắp diễn ra' },
    { key: 'ongoing', label: 'Đang diễn ra' },
    { key: 'completed', label: 'Đã hoàn thành' },
];

const GuideTourList = () => {
    const [activeFilter, setActiveFilter] = useState('upcoming');

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

            <div className={styles.tourGrid}>
                {TOURS.map(tour => (
                    <div key={tour.id} className={styles.tourCard}>
                        <div className={styles.tourCardHeader}>
                            <span className={`${styles.tourBadge} ${styles[`badge_${tour.badgeType}`]}`}>
                                {tour.badge}
                            </span>
                            <span className={styles.tourId}>Mã: {tour.id}</span>
                            <button className={styles.moreBtn}>
                                <span className="material-icons-round">more_vert</span>
                            </button>
                        </div>
                        <div className={styles.tourCardBody}>
                            <img src={tour.image} alt={tour.name} className={styles.tourImage} />
                            <div className={styles.tourInfo}>
                                <h3 className={styles.tourName}>{tour.name}</h3>
                                <div className={styles.tourMeta}>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>schedule</span>
                                        <span>{tour.time}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>location_on</span>
                                        <span>{tour.location}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className="material-icons-round" style={{ fontSize: '16px' }}>groups</span>
                                        <span>{tour.guests}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {tour.status === 'starting' && (
                            <div className={styles.tourProgress}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${tour.progress}%` }}></div>
                                </div>
                                <span className={styles.progressLabel}>Sắp bắt đầu</span>
                            </div>
                        )}
                        <div className={styles.tourCardFooter}>
                            <button className={styles.btnOutline}>Xem chi tiết</button>
                            {tour.status === 'starting' && (
                                <button className={styles.btnPrimary}>
                                    <span className="material-icons-round" style={{ fontSize: '16px' }}>play_arrow</span>
                                    Bắt đầu Tour
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuideTourList;
