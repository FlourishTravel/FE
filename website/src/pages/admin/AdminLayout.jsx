import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../api/config';
import styles from './AdminLayout.module.css';
import logoImg from '../../assets/LogoFlourish\'.jpg';

const NAV_ITEMS = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
    { path: '/admin/tours', icon: 'explore', label: 'Quản Lý Tour' },
    { path: '/admin/categories', icon: 'category', label: 'Danh Mục' },
    { path: '/admin/destinations', icon: 'place', label: 'Điểm Đến' },
    { path: '/admin/promotions', icon: 'sell', label: 'Khuyến Mãi' },
    { path: '/admin/contact-requests', icon: 'contact_mail', label: 'Liên Hệ' },
    { path: '/admin/catalog-tickets', icon: 'confirmation_number', label: 'Danh Mục Vé' },
    { path: '/admin/notifications', icon: 'campaign', label: 'Thông Báo' },
    { path: '/admin/reviews', icon: 'reviews', label: 'Đánh Giá' },
    { path: '/admin/guide-profiles', icon: 'badge', label: 'Hồ Sơ HDV' },
    { path: '/admin/content', icon: 'article', label: 'Nội Dung' },
    { path: '/admin/dispatch', icon: 'calendar_month', label: 'Điều Hành Tour' },
    { path: '/admin/bookings', icon: 'book_online', label: 'Quản Lý Đặt Chỗ' },
    { path: '/admin/customers', icon: 'group', label: 'Khách Hàng' },
    { path: '/admin/financials', icon: 'payments', label: 'Tài Chính' },
    { path: '/admin/guide-expenses', icon: 'receipt_long', label: 'Chi Phí HDV' },
    { path: '/admin/staff', icon: 'manage_accounts', label: 'Nhân Viên' },
    { path: '/admin/settings', icon: 'settings', label: 'Cài Đặt' },
];

const BOTTOM_NAV = [
    { path: '/admin', icon: 'dashboard', label: 'Tổng quan', end: true },
    { path: '/admin/tours', icon: 'explore', label: 'Tour' },
    { path: '/admin/bookings', icon: 'book_online', label: 'Đặt chỗ' },
    { path: '/admin/customers', icon: 'group', label: 'Khách' },
];

const PLACEHOLDER_AVATAR =
    'https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&size=80';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const displayName = user?.fullName || user?.name || 'Admin';
    const avatarSrc = resolveMediaUrl(user?.avatarUrl || user?.avatar) || PLACEHOLDER_AVATAR;
    const showSidebarLabels = !sidebarCollapsed || mobileNavOpen;
    const initials = useMemo(() => {
        const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return 'A';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }, [displayName]);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        navigate(q ? `/admin/tours?q=${encodeURIComponent(q)}` : '/admin/tours');
    };

    return (
        <div className={styles.adminRoot}>
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
                                    <img src={logoImg} alt="Flourish Admin Logo" className={styles.guideLogoImage} />
                                </div>
                                <div className={styles.logoText}>
                                    <span className={styles.logoTitle}>Flourish Travel</span>
                                    <span className={styles.logoSub}>Admin Panel</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.collapsedLogoText}>
                                <span className={styles.logoTitleCollapsed}>Flourish</span>
                                <span className={styles.logoTitleCollapsedHighlight}>Admin</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className={styles.collapseBtn}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
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

                <div className={styles.sidebarFooter}>
                    <div className={styles.userCard}>
                        {user?.avatarUrl || user?.avatar ? (
                            <img src={avatarSrc} alt="" className={styles.userAvatar} />
                        ) : (
                            <span className={styles.userAvatarFallback}>{initials}</span>
                        )}
                        {showSidebarLabels && (
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{displayName}</span>
                                <span className={styles.userRole}>Admin</span>
                            </div>
                        )}
                    </div>
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
                        <span className="material-icons-round" style={{ fontSize: '20px', color: '#9ca3af' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm tour, booking, khách hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </form>
                    <div className={styles.headerActions}>
                        <button className={styles.headerBtn} title="Thông báo" type="button">
                            <span className="material-icons-round">notifications</span>
                        </button>
                        <div className={styles.headerDivider}></div>
                        <div className={styles.headerUser}>
                            {user?.avatarUrl || user?.avatar ? (
                                <img src={avatarSrc} alt="" className={styles.headerAvatar} />
                            ) : (
                                <span className={styles.headerAvatarFallback}>{initials}</span>
                            )}
                            <span className={styles.headerUserName}>{displayName}</span>
                        </div>
                    </div>
                </header>

                <main className={styles.content}>
                    <Outlet />
                </main>

                <nav className={styles.bottomNav} aria-label="Điều hướng admin">
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

export default AdminLayout;
