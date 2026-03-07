import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plane, MapPin, BookOpen, Compass, Search, Phone, User } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/LogoFlourish\'.jpg';
import { useAuth } from '../context/AuthContext';

const HOTLINE = '1900 1234'; // Thay bằng số hotline thật

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;
    const { user } = useAuth();

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
                        <a href="/" className={styles.logoText}>
                            <img src={logo} alt="Flourish Logo" className={styles.logoIcon} /> Flourish Tourism
                        </a>
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

                    {/* Search, Hotline & Auth */}
                    <div className={styles.authContainer}>
                        <Link to="/tours" className={styles.searchIcon} title="Tìm tour">
                            <Search className={styles.navIcon} />
                        </Link>
                        <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className={styles.hotline} title="Hotline">
                            <Phone className={styles.navIcon} />
                            <span className={styles.hotlineText}>{HOTLINE}</span>
                        </a>
                        {user ? (
                            <Link to="/profile" className={pathname === '/profile' ? `${styles.signInBtn} ${styles.navLinkActive}` : styles.signInBtn}>
                                <User className={styles.navIcon} />
                                Tài khoản
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
                        <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className={styles.mobileHotline} onClick={() => setIsOpen(false)}>
                            <Phone className="w-5 h-5" />
                            Hotline: {HOTLINE}
                        </a>
                        <div className={styles.mobileAuthContainer}>
                            {user ? (
                                <Link to="/profile" className={styles.mobileSignInBtn} onClick={() => setIsOpen(false)}>
                                    <User className="w-5 h-5" />
                                    Tài khoản
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
