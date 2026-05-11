import React, { useState } from 'react';
import styles from './GuideCommunication.module.css';

const CHAT_MESSAGES = [
    {
        id: 1,
        type: 'system',
        text: '10:30 AM - Bạn đã gửi Broadcast "Tập trung tại sảnh"',
    },
    {
        id: 2,
        sender: 'Anh Tuấn (Phòng 204)',
        text: 'Cho mình hỏi chiều nay mấy giờ xe chạy đi Hội An vậy HDV?',
        time: '10:35 AM',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isMine: false,
    },
    {
        id: 3,
        text: 'Dạ 14:00 xe sẽ đón mình tại sảnh khách sạn ạ. Anh Tuấn nhớ mang theo nón nhé, chiều nay nắng khá gắt.',
        time: '10:38 AM',
        isMine: true,
        read: true,
    },
    {
        id: 4,
        sender: 'Chị Lan (Phòng 205)',
        text: 'Cảm ơn em nhiều nha.',
        time: '10:40 AM',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        isMine: false,
    },
];

const QUICK_TEMPLATES = ['Tập trung', 'Đổi lịch', 'Ăn trưa'];

const LIVE_TIPS = [
    { id: 1, title: 'Góc chụp Hội An', time: 'Đã ghim 5p trước', icon: 'camera_alt', color: '#059669' },
    { id: 2, title: 'Đường thi công', subtitle: 'Tránh lối đi cổng Tây', icon: 'warning', color: '#ef4444' },
];

const GuideCommunication = () => {
    const [activeTab, setActiveTab] = useState('group');
    const [message, setMessage] = useState('');
    const [broadcastContent, setBroadcastContent] = useState('');

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Giao tiếp & Cập nhật</h1>
                    <p className={styles.pageSubtitle}>Quản lý luồng thông tin và hỗ trợ đoàn khách Tour VN-2023-A.</p>
                </div>
                <div className={styles.headerBadges}>
                    <span className={styles.guestBadge}>
                        <span className="material-icons-round" style={{ fontSize: '16px' }}>groups</span>
                        42 Khách
                    </span>
                    <span className={styles.liveBadge}>
                        <span className={styles.liveDot}></span>
                        Đang Live
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainGrid}>
                {/* Broadcast */}
                <div className={styles.broadcastCard}>
                    <h2 className={styles.broadcastTitle}>
                        <span style={{ fontSize: '18px' }}>📡</span> Broadcast Center
                    </h2>
                    <p className={styles.broadcastSub}>Gửi thông báo khẩn/nhắc nhở toàn đoàn.</p>

                    <div className={styles.templateRow}>
                        {QUICK_TEMPLATES.map(t => (
                            <button key={t} className={styles.templateBtn} onClick={() => setBroadcastContent(t)}>
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className={styles.broadcastForm}>
                        <label className={styles.formLabel}>Nội dung thông báo</label>
                        <textarea
                            className={styles.broadcastTextarea}
                            placeholder="Nhập nội dung cần thông báo..."
                            value={broadcastContent}
                            onChange={(e) => setBroadcastContent(e.target.value)}
                            rows={4}
                        ></textarea>
                    </div>

                    <div className={styles.broadcastOptions}>
                        <div className={styles.scheduleRow}>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>schedule</span>
                            <span>Gửi ngay</span>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>expand_more</span>
                        </div>
                        <label className={styles.pushCheckbox}>
                            <input type="checkbox" defaultChecked className={styles.checkbox} />
                            <span>Kèm Push Notification tới App khách</span>
                        </label>
                    </div>

                    <button className={styles.broadcastBtn}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>play_arrow</span>
                        Phát sóng
                    </button>
                </div>

                {/* Chat Area */}
                <div className={styles.chatCard}>
                    <div className={styles.chatTabs}>
                        <button
                            className={`${styles.chatTab} ${activeTab === 'group' ? styles.chatTabActive : ''}`}
                            onClick={() => setActiveTab('group')}
                        >
                            Chat Đoàn (42)
                        </button>
                        <button
                            className={`${styles.chatTab} ${activeTab === 'private' ? styles.chatTabActive : ''}`}
                            onClick={() => setActiveTab('private')}
                        >
                            Chat Riêng (3)
                        </button>
                    </div>

                    <div className={styles.chatMessages}>
                        {CHAT_MESSAGES.map(msg => {
                            if (msg.type === 'system') {
                                return (
                                    <div key={msg.id} className={styles.systemMsg}>
                                        {msg.text}
                                    </div>
                                );
                            }
                            return (
                                <div key={msg.id} className={`${styles.msgRow} ${msg.isMine ? styles.msgMine : ''}`}>
                                    {!msg.isMine && msg.avatar && (
                                        <img src={msg.avatar} alt="" className={styles.msgAvatar} />
                                    )}
                                    <div className={`${styles.msgBubble} ${msg.isMine ? styles.bubbleMine : styles.bubbleOther}`}>
                                        {!msg.isMine && <span className={styles.msgSender}>{msg.sender}</span>}
                                        <p className={styles.msgText}>{msg.text}</p>
                                        <span className={styles.msgTime}>
                                            {msg.time}
                                            {msg.read && <span className="material-icons-round" style={{ fontSize: '14px', color: '#3b82f6' }}>done_all</span>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.chatInputBar}>
                        <button className={styles.chatActionBtn}>
                            <span className="material-icons-round">add_circle_outline</span>
                        </button>
                        <button className={styles.chatActionBtn}>
                            <span className="material-icons-round">image</span>
                        </button>
                        <input
                            type="text"
                            className={styles.chatInput}
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className={styles.sendBtn}>
                            <span className="material-icons-round" style={{ fontSize: '20px' }}>send</span>
                        </button>
                    </div>
                </div>

                {/* Live Tips */}
                <div className={styles.liveTipsCard}>
                    <div className={styles.liveTipsHeader}>
                        <h3 className={styles.liveTipsTitle}>
                            <span style={{ fontSize: '16px' }}>🧭</span> Live Tips
                        </h3>
                        <span className={styles.liveTipsSub}>Ghim bản đồ realtime</span>
                        <button className={styles.addTipBtn}>
                            <span className="material-icons-round" style={{ fontSize: '20px' }}>add</span>
                        </button>
                    </div>

                    <div className={styles.tipMap}>
                        <div className={styles.tipMapContent}>
                            <span className="material-icons-round" style={{ fontSize: '36px', color: '#059669' }}>explore</span>
                            <p>Điểm check-in đẹp</p>
                        </div>
                    </div>

                    <p className={styles.tipActivityLabel}>Ghim đang hoạt động (2)</p>

                    {LIVE_TIPS.map(tip => (
                        <div key={tip.id} className={styles.tipItem}>
                            <div className={styles.tipIcon} style={{ background: `${tip.color}15`, color: tip.color }}>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>{tip.icon}</span>
                            </div>
                            <div className={styles.tipInfo}>
                                <span className={styles.tipName}>{tip.title}</span>
                                {tip.subtitle && <span className={styles.tipSub}>{tip.subtitle}</span>}
                                {tip.time && <span className={styles.tipTime}>{tip.time}</span>}
                            </div>
                            <button className={styles.tipClose}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>close</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GuideCommunication;
