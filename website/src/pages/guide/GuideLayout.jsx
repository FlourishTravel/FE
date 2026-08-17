import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './GuideLayout.module.css';
import logoImg from '../../assets/LogoFlourish\'.jpg';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../api/config';
import { getNotifications, markNotificationRead } from '../../api/flora';

const NAV_ITEMS = [
    { path: '/guide/dashboard', icon: 'dashboard', label: 'Bảng điều khiển', end: true },
    { path: '/guide/tours', icon: 'map', label: 'Quản lý Tour' },
    { path: '/guide/guests', icon: 'groups', label: 'Quản lý Khách' },
    { path: '/guide/communication', icon: 'forum', label: 'Giao tiếp' },
    { path: '/guide/operations', icon: 'settings', label: 'Vận hành' },
    { path: '/guide/expenses', icon: 'account_balance_wallet', label: 'Chi phí' },
    { path: '/guide/profile', icon: 'person', label: 'Hồ sơ' },
];

const BOTTOM_NAV = [
    { path: '/guide/dashboard', icon: 'dashboard', label: 'Tổng quan', end: true },
    { path: '/guide/tours', icon: 'map', label: 'Tour' },
    { path: '/guide/guests', icon: 'groups', label: 'Khách' },
    { path: '/guide/communication', icon: 'forum', label: 'Chat' },
];

const PLACEHOLDER_AVATAR =
    'https://ui-avatars.com/api/?name=HDV&background=10b981&color=fff&size=80';

function unwrapNotifications(payload) {
    const page = payload?.data || payload;
    if (Array.isArray(page)) return page;
    if (Array.isArray(page?.content)) return page.content;
    return [];
}

const GuideLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const avatarSrc = resolveMediaUrl(user?.avatarUrl || user?.avatar) || PLACEHOLDER_AVATAR;
    const displayName = user?.fullName || user?.name || 'HDV';
    const initials = useMemo(() => {
        const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return 'H';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [displayName]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const showSidebarLabels = !sidebarCollapsed || mobileNavOpen;

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const json = await getNotifications({ limit: 8 });
                if (!alive) return;
                setNotifications(unwrapNotifications(json));
            } catch {
                if (alive) setNotifications([]);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        setMobileNavOpen(false);
        setNotifOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        navigate(q ? `/guide/tours?q=${encodeURIComponent(q)}` : '/guide/tours');
    };

    const handleOpenNotif = (item) => {
        setNotifOpen(false);
        if (item?.id && !item.isRead) {
            markNotificationRead(item.id).catch(() => {});
            setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
            );
        }
        navigate('/guide/communication');
    };

    return (
        <div className={styles.guideRoot}>
            {mobileNavOpen ? (
                <button
                    type="button"
                    className={styles.mobileBackdrop}
                    aria-label="Đóng menu"
                    onClick={() => setMobileNavOpen(false)}
                />
            ) : null}

            <aside
                className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${mobileNavOpen ? styles.mobileOpen : ''}`}
            >
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoArea}>
                        {showSidebarLabels ? (
                            <>
                                <div className={styles.logoIconContainer}>
                                    <img src={logoImg} alt="Flourish HDV Logo" className={styles.guideLogoImage} />
                                </div>
                                <div className={styles.logoText}>
                                    <span className={styles.logoTitle}>Flourish HDV</span>
                                    <span className={styles.logoSub}>Hướng dẫn viên</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.collapsedLogoText}>
                                <span className={styles.logoTitleCollapsed}>Flourish</span>
                                <span className={styles.logoTitleCollapsedHighlight}>HDV</span>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.collapseBtn}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        type="button"
                    >
                        <span className="material-icons-round">
                            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navActive : ''}`
                            }
                        >
                            <span className="material-icons-round">{item.icon}</span>
                            {showSidebarLabels && <span className={styles.navLabel}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sosSection}>
                    <button
                        className={styles.sosBtn}
                        type="button"
                        onClick={() => navigate('/guide/operations')}
                        title="Báo cáo sự cố"
                    >
                        <span className={styles.sosText}>SOS</span>
                        {showSidebarLabels && <span>Báo cáo sự cố (SOS)</span>}
                    </button>
                </div>

                <div className={styles.sidebarFooter}>
                    <NavLink to="/guide/profile" className={styles.footerLink}>
                        <span className="material-icons-round">manage_accounts</span>
                        {showSidebarLabels && <span>Hồ sơ & cài đặt</span>}
                    </NavLink>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất" type="button">
                        <span className="material-icons-round">logout</span>
                        {showSidebarLabels && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>
                <header className={styles.topHeader}>
                    <button
                        type="button"
                        className={styles.menuBtn}
                        aria-label="Mở menu"
                        onClick={() => setMobileNavOpen(true)}
                    >
                        <span className="material-icons-round">menu</span>
                    </button>
                    <form className={styles.searchBox} onSubmit={handleSearch}>
                        <span className="material-icons-round" style={{ fontSize: '20px', color: '#9ca3af' }}>
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm tour được giao..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </form>
                    <div className={styles.headerActions}>
                        <div className={styles.notifWrap}>
                            <button
                                className={styles.headerBtn}
                                title="Thông báo"
                                type="button"
                                onClick={() => setNotifOpen((open) => !open)}
                            >
                                <span className="material-icons-round">notifications</span>
                                {unreadCount > 0 ? (
                                    <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                ) : null}
                            </button>
                            {notifOpen ? (
                                <div className={styles.notifPanel}>
                                    <div className={styles.notifPanelTitle}>Thông báo</div>
                                    {notifications.length === 0 ? (
                                        <div className={styles.notifEmpty}>Chưa có thông báo.</div>
                                    ) : (
                                        notifications.map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`${styles.notifItem} ${item.isRead ? '' : styles.notifUnread}`}
                                                onClick={() => handleOpenNotif(item)}
                                            >
                                                <strong>{item.title || 'Thông báo'}</strong>
                                                {item.body ? <span>{item.body}</span> : null}
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <button
                            className={styles.headerBtn}
                            title="Tin nhắn đoàn"
                            type="button"
                            onClick={() => navigate('/guide/communication')}
                        >
                            <span className="material-icons-round">chat_bubble_outline</span>
                        </button>
                        <div className={styles.headerDivider}></div>
                        <button
                            type="button"
                            className={styles.headerUser}
                            title="Hồ sơ"
                            onClick={() => navigate('/guide/profile')}
                        >
                            {user?.avatarUrl || user?.avatar ? (
                                <img src={avatarSrc} alt={displayName} className={styles.headerAvatar} />
                            ) : (
                                <span className={styles.headerAvatarFallback}>{initials}</span>
                            )}
                            <span className={styles.headerUserName}>{displayName}</span>
                        </button>
                    </div>
                </header>

                <main className={styles.content}>
                    <Outlet />
                </main>

                <nav className={styles.bottomNav} aria-label="Điều hướng HDV">
                    {BOTTOM_NAV.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`
                            }
                        >
                            <span className="material-icons-round">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        className={styles.bottomNavItem}
                        onClick={() => setMobileNavOpen(true)}
                    >
                        <span className="material-icons-round">menu</span>
                        <span>Menu</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default GuideLayout;
