import React, { useState } from 'react';
import styles from './GuideGuestManagement.module.css';

const GUESTS = [
    {
        id: 1,
        name: 'Nguyễn Thị Mai',
        phone: '090 123 4567',
        room: 'Phòng 402',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        checkedIn: true,
        tags: [],
    },
    {
        id: 2,
        name: 'Trần Văn Hoàng',
        phone: '091 987 6543',
        room: 'Phòng 403',
        avatar: null,
        initials: 'TH',
        checkedIn: false,
        tags: [],
    },
    {
        id: 3,
        name: 'Lê Minh Tuấn',
        phone: '098 765 4321',
        room: 'Phòng 405',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        checkedIn: true,
        tags: ['Dị ứng'],
    },
];

const GuideGuestManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Danh sách khách đoàn</h1>
                <div className={styles.headerRight}>
                    <button className={styles.qrBtn}>
                        <span className="material-icons-round" style={{ fontSize: '20px' }}>qr_code_scanner</span>
                        Quét QR Điểm danh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Tiến độ điểm danh</span>
                        <span className={styles.statValueLarge}>38/45 <span className={styles.statUnit}>khách</span></span>
                    </div>
                    <div className={styles.statIconWrap}>
                        <span className="material-icons-round" style={{ fontSize: '22px', color: '#059669' }}>check_circle</span>
                    </div>
                    <div className={styles.statProgress}>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '84%' }}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Yêu cầu đặc biệt</span>
                        <div className={styles.statRow}>
                            <span className={styles.statValueLarge}>7 <span className={styles.statUnit}>lưu ý</span></span>
                            <span className="material-icons-round" style={{ fontSize: '22px', color: '#fbbf24' }}>star</span>
                        </div>
                    </div>
                    <div className={styles.specialTags}>
                        <span className={styles.specialTag}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>eco</span> 5 Chay
                        </span>
                        <span className={styles.specialTag}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>cake</span> 2 Sinh nhật
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainGrid}>
                {/* Guest List */}
                <div className={styles.guestListCard}>
                    <div className={styles.searchBar}>
                        <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm tên, SĐT, phòng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.guestList}>
                        {GUESTS.map(guest => (
                            <div key={guest.id} className={styles.guestItem}>
                                <div className={styles.guestLeft}>
                                    {guest.avatar ? (
                                        <div className={styles.avatarWrap}>
                                            <img src={guest.avatar} alt={guest.name} className={styles.guestAvatar} />
                                            {guest.checkedIn && <span className={styles.onlineDot}></span>}
                                        </div>
                                    ) : (
                                        <div className={styles.avatarWrap}>
                                            <div className={styles.avatarInitials}>{guest.initials}</div>
                                        </div>
                                    )}
                                    <div className={styles.guestInfo}>
                                        <span className={styles.guestName}>{guest.name}</span>
                                        <span className={styles.guestMeta}>
                                            <span className="material-icons-round" style={{ fontSize: '14px' }}>call</span>
                                            {guest.phone} • {guest.room}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.guestRight}>
                                    {guest.tags.includes('Dị ứng') && (
                                        <span className={styles.allergyTag}>
                                            <span className="material-icons-round" style={{ fontSize: '14px' }}>warning</span>
                                            Dị ứng
                                        </span>
                                    )}
                                    {guest.checkedIn ? (
                                        <div className={styles.checkedActions}>
                                            <button className={styles.iconBtn} title="Ghi chú">
                                                <span className="material-icons-round" style={{ fontSize: '18px' }}>description</span>
                                            </button>
                                            <button className={styles.iconBtn} title="Liên hệ">
                                                <span className="material-icons-round" style={{ fontSize: '18px' }}>call</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button className={styles.checkInBtn}>Điểm danh</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    {/* Guest Locator */}
                    <div className={styles.locatorCard}>
                        <div className={styles.locatorHeader}>
                            <div className={styles.locatorTitle}>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>my_location</span>
                                Guest Locator
                            </div>
                            <span className={styles.onlineIndicator}></span>
                        </div>
                        <div className={styles.mapPlaceholder}>
                            <div className={styles.mapContent}>
                                <span className="material-icons-round" style={{ fontSize: '48px', color: '#d1d5db' }}>map</span>
                                <p>Bản đồ vị trí khách</p>
                            </div>
                            <div className={styles.mapAlert}>
                                <span className="material-icons-round" style={{ fontSize: '16px', color: '#ef4444' }}>error</span>
                                <span>3 khách đang ở ngoài khu vực tập trung dự kiến ({'>'}500m).</span>
                            </div>
                        </div>
                    </div>

                    {/* Internal Info */}
                    <div className={styles.internalCard}>
                        <h3 className={styles.internalTitle}>Thông tin nội bộ</h3>
                        <div className={styles.internalList}>
                            <div className={styles.internalItem}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>directions_bus</span>
                                <span>Xe 45 chỗ - Biển số: 43B-123.45</span>
                            </div>
                            <div className={styles.internalItem}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>restaurant</span>
                                <span>Bữa trưa: Nhà hàng Xanh (12:00)</span>
                            </div>
                            <div className={styles.internalItem}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>hotel</span>
                                <span>Check-in KS: Mường Thanh (14:00)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideGuestManagement;
