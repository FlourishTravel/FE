import React, { useEffect, useMemo, useState } from 'react';
import styles from './Notifications.module.css';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/flora';
import { notifyNotificationsChanged } from '../../hooks/useNotificationUnreadCount';

function normalizeNotifications(payload) {
    const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data?.content)
                ? payload.data.content
                : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.content)
                ? payload.content
                : [];
    return rows.map((item, index) => ({
        id: item.id || `notification-${index}`,
        title: item.title || 'Thông báo',
        message: item.message || item.body || '',
        read: Boolean(item.read || item.isRead),
        createdAt: item.createdAt || item.created_at || '',
    }));
}

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const payload = await getNotifications({ unreadOnly: false, limit: 100 });
                if (!alive) return;
                setNotifications(normalizeNotifications(payload));
            } catch (e) {
                if (!alive) return;
                setError(e.message || 'Không tải được danh sách thông báo.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const filtered = useMemo(
        () => (unreadOnly ? notifications.filter((item) => !item.read) : notifications),
        [notifications, unreadOnly],
    );

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications],
    );

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
            );
            notifyNotificationsChanged();
        } catch (e) {
            alert(e.message || 'Không thể đánh dấu đã đọc.');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            notifyNotificationsChanged();
        } catch (e) {
            alert(e.message || 'Không thể đánh dấu tất cả đã đọc.');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Thông báo</h1>
                        <p className={styles.subtitle}>Bạn có {unreadCount} thông báo chưa đọc.</p>
                    </div>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.filterBtn}
                            onClick={() => setUnreadOnly((prev) => !prev)}
                        >
                            {unreadOnly ? 'Hiện tất cả' : 'Chỉ chưa đọc'}
                        </button>
                        <button type="button" className={styles.markAllBtn} onClick={handleMarkAllRead}>
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                </div>

                {loading ? <p className={styles.status}>Đang tải thông báo...</p> : null}
                {error ? <p className={styles.error}>{error}</p> : null}

                {!loading && !error && filtered.length === 0 ? (
                    <p className={styles.status}>Không có thông báo phù hợp.</p>
                ) : null}

                <div className={styles.list}>
                    {filtered.map((item) => (
                        <article
                            key={item.id}
                            className={`${styles.card} ${item.read ? styles.cardRead : styles.cardUnread}`}
                        >
                            <div className={styles.cardMain}>
                                <h2 className={styles.cardTitle}>{item.title}</h2>
                                <p className={styles.cardMessage}>{item.message}</p>
                                {item.createdAt ? (
                                    <time className={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                                ) : null}
                            </div>
                            {!item.read ? (
                                <button
                                    type="button"
                                    className={styles.readBtn}
                                    onClick={() => handleMarkRead(item.id)}
                                >
                                    Đánh dấu đã đọc
                                </button>
                            ) : (
                                <span className={styles.readLabel}>Đã đọc</span>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
