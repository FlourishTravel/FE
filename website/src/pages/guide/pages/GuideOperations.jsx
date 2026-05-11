import React, { useState } from 'react';
import styles from './GuideOperations.module.css';

const TIMELINE = [
    {
        id: 1,
        type: 'food',
        icon: 'restaurant',
        title: 'Ăn sáng tại Khách sạn',
        time: '07:00 AM',
        desc: 'Nhà hàng tầng 2, tập trung hành lý tại sảnh.',
        status: 'completed',
    },
    {
        id: 2,
        type: 'attraction',
        icon: 'landscape',
        title: 'Tham quan Grand Canyon',
        time: '09:30 AM',
        desc: 'South Rim. Điểm tập trung: Visitor Center. Yêu cầu nhắc nhở khách mang nước.',
        status: 'current',
    },
    {
        id: 3,
        type: 'transport',
        icon: 'directions_bus',
        title: 'Di chuyển về Las Vegas',
        time: '14:00 PM',
        desc: 'Khoảng cách 4h di chuyển. Nghỉ giữa chặng tại Kingman.',
        status: 'upcoming',
    },
];

const POLLS = [
    {
        id: 1,
        question: 'Ăn tối nay tại Las Vegas?',
        status: 'open',
        options: [
            { id: 'opt1', text: 'Buffet Hải sản (Tự túc)', votes: 17, total: 24 },
            { id: 'opt2', text: 'Nhà hàng Châu Á (Theo đoàn)', votes: 7, total: 24 },
        ],
        closeTime: '16:00',
    },
    {
        id: 2,
        question: 'Giờ tập trung sáng mai?',
        status: 'closed',
        result: '07:30 AM (100% đồng ý)',
    },
];

const GuideOperations = () => {
    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>Vận hành Tour: Bờ Tây Nước Mỹ</h1>
                    <p className={styles.pageSubtitle}>
                        <span className="material-icons-round" style={{ fontSize: '16px' }}>calendar_today</span>
                        Ngày 3: Grand Canyon - Las Vegas (12/10/2023)
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnOutline}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>groups</span>
                        Đoàn 24 khách
                    </button>
                    <button className={styles.btnPrimary}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>check_circle_outline</span>
                        Điểm danh nhanh
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                {/* Left Column - Timeline */}
                <div className={styles.timelineCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <span className="material-icons-round" style={{ color: '#059669' }}>route</span>
                            Tiến độ Lịch trình
                        </h2>
                        <span className={styles.progressBadge}>2/5 Hoàn thành</span>
                    </div>

                    <div className={styles.timeline}>
                        {TIMELINE.map((item, index) => (
                            <div key={item.id} className={`${styles.timelineItem} ${styles[item.status]}`}>
                                {/* Vertical Line and Icon */}
                                <div className={styles.timelineLeft}>
                                    <div className={styles.iconWrap}>
                                        <span className="material-icons-round">{item.icon}</span>
                                    </div>
                                    {index < TIMELINE.length - 1 && <div className={styles.verticalLine}></div>}
                                </div>

                                {/* Content Box */}
                                <div className={styles.contentBox}>
                                    <div className={styles.itemHeader}>
                                        <h3 className={styles.itemTitle}>{item.title}</h3>
                                        <div className={styles.itemRight}>
                                            <span className={styles.itemTime}>{item.time}</span>
                                            {item.status === 'current' && (
                                                <span className={styles.currentBadge}>Đang diễn ra</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className={styles.itemDesc}>{item.desc}</p>
                                    
                                    <div className={styles.itemActions}>
                                        {item.status === 'completed' && (
                                            <span className={styles.completedText}>
                                                <span className="material-icons-round" style={{ fontSize: '16px' }}>done_all</span>
                                                Đã Check-out
                                            </span>
                                        )}
                                        {item.status === 'current' && (
                                            <div className={styles.actionGroup}>
                                                <button className={styles.btnDisabled}>
                                                    <span className="material-icons-round" style={{ fontSize: '16px' }}>person_remove</span>
                                                    Đã Check-in
                                                </button>
                                                <button className={styles.btnAction}>
                                                    <span className="material-icons-round" style={{ fontSize: '16px' }}>logout</span>
                                                    Check-out
                                                </button>
                                            </div>
                                        )}
                                        {item.status === 'upcoming' && (
                                            <button className={styles.btnUpcoming}>
                                                <span className="material-icons-round" style={{ fontSize: '16px' }}>login</span>
                                                Check-in (Sắp tới)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    {/* SOS Card */}
                    <div className={styles.sosCard}>
                        <div className={styles.sosIcon}>
                            <span className="material-icons-round">warning_amber</span>
                        </div>
                        <h2 className={styles.sosTitle}>Báo Cáo Khẩn Cấp (SOS)</h2>
                        <p className={styles.sosDesc}>
                            Gửi ngay thông báo tới bộ phận Điều hành nếu có sự cố về y tế, thời tiết hoặc tai nạn.
                        </p>
                        <button className={styles.sosBtn}>
                            <span className="material-icons-round">send</span>
                            GỬI SOS NGAY
                        </button>
                    </div>

                    {/* Quick Polls */}
                    <div className={styles.pollsCard}>
                        <div className={styles.pollsHeader}>
                            <h2 className={styles.pollsTitle}>
                                <span className="material-icons-round" style={{ color: '#059669' }}>how_to_vote</span>
                                Bình chọn nhanh
                            </h2>
                            <button className={styles.addPollBtn}>
                                <span className="material-icons-round">add</span>
                            </button>
                        </div>

                        <div className={styles.pollsList}>
                            {POLLS.map(poll => (
                                <div key={poll.id} className={styles.pollItem}>
                                    <div className={styles.pollItemHeader}>
                                        <h3 className={styles.pollQuestion}>{poll.question}</h3>
                                        <span className={`${styles.pollBadge} ${poll.status === 'open' ? styles.badgeOpen : styles.badgeClosed}`}>
                                            {poll.status === 'open' ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                                        </span>
                                    </div>

                                    {poll.status === 'open' ? (
                                        <div className={styles.pollOptions}>
                                            {poll.options.map(opt => {
                                                const percent = Math.round((opt.votes / opt.total) * 100);
                                                return (
                                                    <div key={opt.id} className={styles.optionRow}>
                                                        <div className={styles.optionBg}>
                                                            <div className={styles.optionFill} style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                        <div className={styles.optionContent}>
                                                            <span className={styles.optionText}>{opt.text}</span>
                                                            <span className={styles.optionVotes}>{opt.votes} khách ({percent}%)</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className={styles.pollFooter}>
                                                <span className={styles.pollInfo}>Đã đóng bình chọn lúc {poll.closeTime}</span>
                                                <button className={styles.closePollBtn}>Chốt kết quả</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.pollResult}>
                                            <span className={styles.resultLabel}>Kết quả:</span>
                                            <span className={styles.resultValue}>{poll.result}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weather Widget */}
                    <div className={styles.weatherCard}>
                        <div className={styles.weatherLabel}>THỜI TIẾT ĐIỂM ĐẾN</div>
                        <div className={styles.weatherContent}>
                            <span className="material-icons-round" style={{ fontSize: '42px', color: '#fbbf24' }}>light_mode</span>
                            <span className={styles.temp}>28°C</span>
                            <span className={styles.weatherDesc}>Nắng ráo, Grand Canyon</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideOperations;
