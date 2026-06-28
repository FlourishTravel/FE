import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../api/flora';
import { useNotificationUnreadCount, notifyNotificationsChanged } from '../../hooks/useNotificationUnreadCount';
import { normalizeNotifications, formatNotificationTime } from '../../utils/notificationUtils';
import shared from './navShared.module.css';
import navStyles from '../Navbar.module.css';

const NotificationDropdown = ({ enabled, onNavigate }) => {
    const { count: unreadCount, refresh } = useNotificationUnreadCount(enabled);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    const loadRecent = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const payload = await getNotifications({ unreadOnly: false, limit: 8 });
            setItems(normalizeNotifications(payload).slice(0, 5));
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        if (open) loadRecent();
    }, [open, loadRecent]);

    useEffect(() => {
        const onDocClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onEsc = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);

    const handleRead = async (id) => {
        try {
            await markNotificationRead(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
            notifyNotificationsChanged();
            refresh();
        } catch {
            /* ignore */
        }
    };

    const close = () => setOpen(false);

    return (
        <div className={shared.dropdownWrap} ref={ref}>
            <button
                type="button"
                className={`${navStyles.notificationIconBtn} ${open ? navStyles.notificationIconBtnActive : ''}`}
                title="Thông báo"
                aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <Bell className={navStyles.bellIcon} />
                {unreadCount > 0 && (
                    <span className={navStyles.notificationBadge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            {open && (
                <div className={shared.iconDropdownPanel}>
                    <div className={shared.panelHeader}>
                        <span className={shared.panelTitle}>Thông báo</span>
                        {unreadCount > 0 && (
                            <span className="text-xs text-primary-600 font-medium">{unreadCount} mới</span>
                        )}
                    </div>
                    <div className={shared.notifList}>
                        {loading ? (
                            <p className={shared.emptyNotif}>Đang tải...</p>
                        ) : items.length === 0 ? (
                            <p className={shared.emptyNotif}>Chưa có thông báo mới.</p>
                        ) : (
                            items.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    className={`${shared.notifItem} ${!n.read ? shared.notifItemUnread : ''}`}
                                    onClick={() => {
                                        if (!n.read) handleRead(n.id);
                                    }}
                                >
                                    <span className={`${shared.notifDot} ${n.read ? shared.notifDotRead : ''}`} />
                                    <span className={shared.notifBody}>
                                        <span className={shared.notifTitle}>{n.title}</span>
                                        {n.message ? (
                                            <span className={shared.notifMessage}>{n.message}</span>
                                        ) : null}
                                        <span className={shared.notifTime}>{formatNotificationTime(n.createdAt)}</span>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    <div className={shared.dropdownFooter}>
                        <Link
                            to="/notifications"
                            className={shared.dropdownFooterLink}
                            onClick={() => {
                                close();
                                onNavigate?.();
                            }}
                        >
                            Xem tất cả
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
