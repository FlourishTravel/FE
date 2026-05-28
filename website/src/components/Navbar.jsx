import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plane, MapPin, BookOpen, Compass } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/LogoFlourish\'.jpg';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;
    const { user } = useAuth();

    const accountLabel = user?.name || user?.email || 'User';

    const getInitials = (label) => {
        const safeLabel = (label || '').trim();
        if (!safeLabel) return 'U';
        const parts = safeLabel.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    };

    const navLinks = [
        { name: 'Chuyến đi của tôi', icon: MapPin, href: '/my-journey' },
        { name: 'Điểm đến', icon: Plane, href: '/destinations' },
        { name: 'Cẩm nang', icon: BookOpen, href: '/guide' },
        { name: 'Tour trải nghiệm', icon: Compass, href: '/tours' },
    ];

    const isActive = (href) => {
        if (href === '/tours') return pathname === '/tours' || pathname.startsWith('/tours/');
        return pathname === href;
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.inner}>
                    {/* Logo */}
                    <div className={styles.logoContainer}>
                        <Link to="/" className={styles.logoText}>
                            <img src={logo} alt="Flourish Logo" className={styles.logoIcon} /> Flourish Tourism
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className={styles.desktopMenu}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={isActive(link.href) ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
                            >
                                <link.icon className={styles.navIcon} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth */}
                    <div className={styles.authContainer}>
                        {user ? (
                            <Link
                                to="/profile"
                                className={styles.accountBtn}
                                title="Tai khoan"
                                aria-label="Tai khoan"
                            >
                                <span className={styles.accountAvatarWrap}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={accountLabel} className={styles.accountAvatar} />
                                    ) : (
                                        <span className={styles.accountFallback}>{getInitials(accountLabel)}</span>
                                    )}
                                </span>
                                <span className={styles.accountName}>{accountLabel}</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className={styles.signInBtn}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className={styles.joinBtn}>
                                    Đăng ký ngay
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className={styles.mobileMenuBtnContainer}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={styles.mobileMenuBtn}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={isActive(link.href) ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink}
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </Link>
                        ))}
                        <div className={styles.mobileAuthContainer}>
                            {user ? (
                                <Link to="/profile" className={styles.mobileAccountBtn} onClick={() => setIsOpen(false)}>
                                    <span className={styles.mobileAccountAvatar}>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={accountLabel} className={styles.accountAvatar} />
                                        ) : (
                                            <span className={styles.accountFallback}>{getInitials(accountLabel)}</span>
                                        )}
                                    </span>
                                    <span className={styles.accountName}>{accountLabel}</span>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className={styles.mobileSignInBtn} onClick={() => setIsOpen(false)}>
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className={styles.mobileJoinBtn} onClick={() => setIsOpen(false)}>
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
