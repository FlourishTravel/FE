import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GuideTourDetail.module.css';

const ITINERARY = [
    {
        time: '07:30',
        title: 'Đón khách tại Nhà Hát Lớn',
        description: 'Tập trung điểm danh, phổ biến nội quy an toàn trên xe. Khởi hành đi Hạ Long theo đường cao tốc mới.',
        status: 'completed',
        icon: 'directions_bus',
    },
    {
        time: '11:30',
        title: 'Đến bến tàu Tuần Châu',
        description: 'Làm thủ tục lên du thuyền. Nhận phòng và nghe quản lý tàu phổ biến lịch trình chi tiết trong 2 ngày tới.',
        status: 'current',
        icon: 'sailing',
        action: 'Quét vé',
    },
    {
        time: '13:00',
        title: 'Ăn trưa trên du thuyền',
        description: 'Buffet hải sản cao cấp. Lưu ý thực đơn chay cho 3 khách.',
        status: 'upcoming',
        icon: 'restaurant',
    },
    {
        time: '15:00',
        title: 'Tham quan Hang Sửng Sốt',
        description: 'Đi thuyền kayak khám phá hang động. Thời gian tự do chụp ảnh.',
        status: 'upcoming',
        icon: 'landscape',
    },
];

const PARTNERS = [
    {
        type: 'VẬN TẢI',
        name: 'Nhà xe Hải Vân – 4...',
        detail: 'Tài xế: Nguyễn Văn A – ...',
        icon: 'directions_bus',
    },
    {
        type: 'LƯU TRÚ',
        name: 'Mường Thanh Luxu...',
        detail: 'Check-in: 14:00 – Qu...',
        icon: 'hotel',
    },
];

const GuideTourDetail = () => {
    const navigate = useNavigate();
    const [activeDay, setActiveDay] = useState(1);

    return (
        <div className={styles.page}>
            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => navigate('/guide/tours')}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                <span>Quay lại danh sách</span>
            </button>

            {/* Hero Banner */}
            <div className={styles.heroBanner}>
                <img
                    src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80"
                    alt="Ha Long Bay"
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay}>
                    <div className={styles.heroInfo}>
                        <div className={styles.heroBadges}>
                            <span className={styles.statusBadge}>ĐANG DIỄN RA</span>
                            <span className={styles.codeBadge}>Mã: HLB-20231025</span>
                        </div>
                        <h1 className={styles.heroTitle}>Khám phá Vịnh Hạ Long – 3N2Đ</h1>
                    </div>
                    <div className={styles.heroActions}>
                        <button className={styles.heroBtnOutline}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>campaign</span>
                            Gửi thông báo đoàn
                        </button>
                        <button className={styles.heroBtnOutline}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>how_to_reg</span>
                            Điểm danh khách
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    {/* Overview */}
                    <div className={styles.overviewCard}>
                        <h2 className={styles.sectionTitle}>Tổng quan</h2>
                        <div className={styles.overviewGrid}>
                            <div className={styles.overviewItem}>
                                <span className="material-icons-round" style={{ fontSize: '24px', color: '#3b82f6' }}>groups</span>
                                <div>
                                    <span className={styles.overviewLabel}>Sĩ số đoàn</span>
                                    <span className={styles.overviewValue}>24/25</span>
                                </div>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className="material-icons-round" style={{ fontSize: '24px', color: '#3b82f6' }}>calendar_today</span>
                                <div>
                                    <span className={styles.overviewLabel}>Khởi hành</span>
                                    <span className={styles.overviewValue}>25 Th10, 2023</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <span>Tiến độ lịch trình</span>
                                <span className={styles.progressPercent}>45%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '45%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Partners */}
                    <div className={styles.partnersCard}>
                        <div className={styles.partnerHeader}>
                            <h2 className={styles.sectionTitle}>Đối tác dịch vụ</h2>
                            <button className={styles.addBtn}>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
                            </button>
                        </div>
                        {PARTNERS.map((partner, idx) => (
                            <div key={idx} className={styles.partnerItem}>
                                <div className={styles.partnerIcon}>
                                    <span className="material-icons-round">{partner.icon}</span>
                                </div>
                                <div className={styles.partnerInfo}>
                                    <span className={styles.partnerType}>{partner.type}</span>
                                    <span className={styles.partnerName}>{partner.name}</span>
                                    <span className={styles.partnerDetail}>{partner.detail}</span>
                                </div>
                                <button className={styles.callBtn}>
                                    <span className="material-icons-round" style={{ fontSize: '18px' }}>call</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Itinerary */}
                <div className={styles.itineraryCard}>
                    <div className={styles.itineraryHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span style={{ fontSize: '20px' }}>🗓</span> Lịch trình chi tiết
                        </h2>
                        <div className={styles.dayTabs}>
                            {[1, 2, 3].map(day => (
                                <button
                                    key={day}
                                    className={`${styles.dayTab} ${activeDay === day ? styles.dayTabActive : ''}`}
                                    onClick={() => setActiveDay(day)}
                                >
                                    Ngày {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.dayLabel}>
                        <span className={styles.dayBadge}>DAY {activeDay}</span>
                        <h3 className={styles.dayTitle}>Hà Nội – Vịnh Hạ Long</h3>
                    </div>

                    <div className={styles.timeline}>
                        {ITINERARY.map((item, idx) => (
                            <div key={idx} className={styles.timelineItem}>
                                <div className={styles.timelineLeft}>
                                    <div className={`${styles.timelineDot} ${styles[`dot_${item.status}`]}`}></div>
                                    {idx < ITINERARY.length - 1 && <div className={styles.timelineLine}></div>}
                                </div>
                                <div className={styles.timelineTime}>
                                    {item.time}
                                    {item.status === 'current' && <span className={styles.currentLabel}>Sắp tới</span>}
                                </div>
                                <div className={`${styles.timelineContent} ${item.status === 'current' ? styles.contentCurrent : ''}`}>
                                    <div className={styles.contentHeader}>
                                        <span className="material-icons-round" style={{ fontSize: '18px' }}>{item.icon}</span>
                                        <strong>{item.title}</strong>
                                        {item.status === 'completed' && (
                                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#059669' }}>check_circle</span>
                                        )}
                                    </div>
                                    <p className={styles.contentDesc}>{item.description}</p>
                                    {item.action && (
                                        <button className={styles.actionBtn}>
                                            <span className="material-icons-round" style={{ fontSize: '16px' }}>qr_code_scanner</span>
                                            {item.action}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideTourDetail;
