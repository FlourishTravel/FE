import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown, Shield, LayoutDashboard } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/LogoFlourish\'.jpg';
import FloraAvatar from './FloraAvatar';
import { useAuth } from '../context/AuthContext';
import NavDropdown from './nav/NavDropdown';
import ProfileDropdown from './nav/ProfileDropdown';
import NotificationDropdown from './nav/NotificationDropdown';
import { useTourCategoryMenu } from '../hooks/useTourCategoryMenu';
import {
    MAIN_NAV,
    EXPLORE_MENU,
    EXPERIENCE_MENU,
    isNavGroupActive,
    openFloraChat,
} from '../config/navConfig';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const location = useLocation();
    const pathname = location.pathname;
    const { user } = useAuth();
    const { items: tourMenuItems, loading: tourMenuLoading } = useTourCategoryMenu();

    const closeMobile = () => {
        setIsOpen(false);
        setMobileExpanded(null);
    };

    useEffect(() => {
        closeMobile();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- close drawer on route change
    }, [pathname]);

    const toggleMobileSection = (id) => {
        setMobileExpanded((prev) => (prev === id ? null : id));
    };

    const renderDesktopNavItem = (item) => {
        if (item.type === 'dropdown') {
            const items = item.dynamic === 'categories' ? tourMenuItems : item.items;
            const loading = item.dynamic === 'categories' ? tourMenuLoading : false;
            return (
                <NavDropdown
                    key={item.id}
                    label={item.label}
                    items={items}
                    loading={loading}
                    isActive={isNavGroupActive(pathname, item.id)}
                />
            );
        }
        if (item.type === 'flora') {
            return (
                <button
                    key={item.id}
                    type="button"
                    className={styles.navLink}
                    onClick={() => openFloraChat()}
                >
                    <FloraAvatar className={styles.navFlora} alt="" />
                    <span>{item.label}</span>
                </button>
            );
        }
        return (
            <Link
                key={item.id}
                to={item.href}
                className={
                    isNavGroupActive(pathname, item.id)
                        ? `${styles.navLink} ${styles.navLinkActive}`
                        : styles.navLink
                }
            >
                <MapPin className={styles.navIcon} aria-hidden />
                <span>{item.label}</span>
            </Link>
        );
    };

    const mobileSections = [
        { id: 'explore', label: 'Khám phá', items: EXPLORE_MENU },
        { id: 'tours', label: 'Tour', items: tourMenuItems, loading: tourMenuLoading },
        { id: 'experience', label: 'Trải nghiệm', items: EXPERIENCE_MENU },
    ];

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
                        {MAIN_NAV.map(renderDesktopNavItem)}
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
                                <NotificationDropdown enabled={Boolean(user)} onNavigate={closeMobile} />
                                <ProfileDropdown onNavigate={closeMobile} />
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
                        {user && <NotificationDropdown enabled={Boolean(user)} onNavigate={closeMobile} />}
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
                <>
                    <button
                        type="button"
                        className={styles.mobileBackdrop}
                        aria-label="Đóng menu"
                        onClick={closeMobile}
                    />
                    <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {mobileSections.map((section) => (
                            <div key={section.id} className={styles.mobileSection}>
                                <button
                                    type="button"
                                    className={`${styles.mobileSectionBtn} ${
                                        isNavGroupActive(pathname, section.id) ? styles.mobileSectionBtnActive : ''
                                    }`}
                                    onClick={() => toggleMobileSection(section.id)}
                                >
                                    {section.label}
                                    <ChevronDown
                                        className={`${styles.mobileChevron} ${
                                            mobileExpanded === section.id ? styles.mobileChevronOpen : ''
                                        }`}
                                    />
                                </button>
                                {mobileExpanded === section.id && (
                                    <div className={styles.mobileSubmenu}>
                                        {section.loading ? (
                                            <span className={styles.mobileSubLoading}>Đang tải danh mục...</span>
                                        ) : (
                                            section.items.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    to={item.href}
                                                    className={styles.mobileSubLink}
                                                    onClick={closeMobile}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link
                            to="/my-journey"
                            className={
                                isNavGroupActive(pathname, 'my-trips')
                                    ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}`
                                    : styles.mobileNavLink
                            }
                            onClick={closeMobile}
                        >
                            <MapPin className="w-5 h-5" aria-hidden />
                            Chuyến đi của tôi
                        </Link>

                        <button
                            type="button"
                            className={styles.mobileNavLink}
                            onClick={() => {
                                openFloraChat();
                                closeMobile();
                            }}
                        >
                            <FloraAvatar className={styles.mobileFlora} alt="" />
                            Flora AI
                        </button>

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
                                        <Link
                                            to="/guide/dashboard"
                                            className={styles.mobilePortalLink}
                                            onClick={closeMobile}
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Portal hướng dẫn viên
                                        </Link>
                                    )}
                                    <Link to="/profile" className={styles.mobileNavLink} onClick={closeMobile}>
                                        Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/notifications" className={styles.mobileNavLink} onClick={closeMobile}>
                                        Xem tất cả thông báo
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
                    </>
            )}
        </nav>
    );
};

export default Navbar;
