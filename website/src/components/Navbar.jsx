import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, Plane, MapPin, BookOpen, Compass, Bell, Ticket, Users, LayoutDashboard, Shield,
} from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/LogoFlourish\'.jpg';
import { useAuth } from '../context/AuthContext';
import { useNotificationUnreadCount } from '../hooks/useNotificationUnreadCount';
import { resolveMediaUrl } from '../api/config';

const NAV_LINKS = [
    { name: 'Chuyến đi', icon: MapPin, href: '/my-journey', matchPrefix: '/my-journey' },
    { name: 'Điểm đến', icon: Plane, href: '/destinations' },
    { name: 'Cẩm nang', icon: BookOpen, href: '/travel-guide' },
    { name: 'Tour', icon: Compass, href: '/tours', matchPrefix: '/tours' },
    { name: 'Vé & hoạt động', icon: Ticket, href: '/activities' },
    { name: 'Đội ngũ HDV', icon: Users, href: '/our-guides', matchPrefix: '/our-guides' },
];

function isNavActive(pathname, link) {
    if (link.href === '/my-journey') {
        return pathname.startsWith('/my-journey') || pathname.startsWith('/chat/');
    }
    const prefix = link.matchPrefix || link.href;
    if (prefix === '/tours') {
        return pathname === '/tours' || (pathname.startsWith('/tours/') && !pathname.startsWith('/tours/itinerary'));
    }
    if (link.href === '/travel-guide') {
        return pathname === '/travel-guide';
    }
    if (link.matchPrefix) {
        return pathname === link.href || pathname.startsWith(`${link.matchPrefix}/`);
    }
    return pathname === link.href;
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;
    const { user } = useAuth();
    const { count: unreadCount } = useNotificationUnreadCount(Boolean(user));

    const accountLabel = user?.name || user?.email || 'User';
    const avatarSrc = user?.avatar ? resolveMediaUrl(user.avatar) : '';

    const getInitials = (label) => {
        const safeLabel = (label || '').trim();
        if (!safeLabel) return 'U';
        const parts = safeLabel.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    };

    const closeMobile = () => setIsOpen(false);

    const notificationLink = (
        <Link
            to="/notifications"
            className={`${styles.notificationIconBtn} ${pathname === '/notifications' ? styles.notificationIconBtnActive : ''}`}
            title="Thông báo"
            aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
            onClick={closeMobile}
        >
            <Bell className={styles.bellIcon} />
            {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.inner}>
                    <div className={styles.logoContainer}>
                        <Link to="/" className={styles.logoText} onClick={closeMobile}>
                            <img src={logo} alt="Flourish Logo" className={styles.logoIcon} />
                            <span className={styles.logoWordmark}>Flourish Tourism</span>
                        </Link>
                    </div>

                    <div className={styles.desktopMenu}>
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={isNavActive(pathname, link) ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                                title={link.name}
                            >
                                <link.icon className={styles.navIcon} aria-hidden />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className={styles.authContainer}>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className={styles.portalLink} title="Quản trị">
                                        <Shield className={styles.portalIcon} />
                                        <span className={styles.portalLabel}>Admin</span>
                                    </Link>
                                )}
                                {user.role === 'guide' && (
                                    <Link to="/guide/dashboard" className={styles.portalLink} title="Portal HDV">
                                        <LayoutDashboard className={styles.portalIcon} />
                                        <span className={styles.portalLabel}>HDV</span>
                                    </Link>
                                )}
                                {notificationLink}
                                <Link
                                    to="/profile"
                                    className={styles.accountBtn}
                                    title="Tài khoản"
                                    aria-label="Tài khoản"
                                >
                                    <span className={styles.accountAvatarWrap}>
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={accountLabel} className={styles.accountAvatar} />
                                        ) : (
                                            <span className={styles.accountFallback}>{getInitials(accountLabel)}</span>
                                        )}
                                    </span>
                                    <span className={styles.accountName}>{accountLabel}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={styles.signInBtn}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className={styles.joinBtn}>
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>

                    <div className={styles.mobileActions}>
                        {user && notificationLink}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className={styles.mobileMenuBtn}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={isNavActive(pathname, link) ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink}
                                onClick={closeMobile}
                            >
                                <link.icon className="w-5 h-5" aria-hidden />
                                {link.name}
                            </Link>
                        ))}
                        <div className={styles.mobileAuthContainer}>
                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className={styles.mobilePortalLink} onClick={closeMobile}>
                                            <Shield className="w-5 h-5" />
                                            Bảng quản trị
                                        </Link>
                                    )}
                                    {user.role === 'guide' && (
                                        <Link to="/guide/dashboard" className={styles.mobilePortalLink} onClick={closeMobile}>
                                            <LayoutDashboard className="w-5 h-5" />
                                            Portal hướng dẫn viên
                                        </Link>
                                    )}
                                    <Link to="/notifications" className={styles.mobileNavLink} onClick={closeMobile}>
                                        <Bell className="w-5 h-5" />
                                        Thông báo
                                        {unreadCount > 0 && (
                                            <span className={styles.mobileUnreadPill}>{unreadCount}</span>
                                        )}
                                    </Link>
                                    <Link to="/profile" className={styles.mobileAccountBtn} onClick={closeMobile}>
                                        <span className={styles.mobileAccountAvatar}>
                                            {avatarSrc ? (
                                                <img src={avatarSrc} alt={accountLabel} className={styles.accountAvatar} />
                                            ) : (
                                                <span className={styles.accountFallback}>{getInitials(accountLabel)}</span>
                                            )}
                                        </span>
                                        <span className={styles.accountName}>{accountLabel}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={styles.mobileSignInBtn} onClick={closeMobile}>
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className={styles.mobileJoinBtn} onClick={closeMobile}>
                                        Đăng ký ngay
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
