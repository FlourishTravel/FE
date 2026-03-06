import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Plane, Home, GraduationCap, Compass } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/LogoFlourish\'.jpg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Chỗ đã đặt', icon: Home, href: '#chỗ đẫ đặt' },
        { name: 'Khám Phá', icon: Plane, href: '#khám phá' },
        { name: 'Ưu đãi', icon: GraduationCap, href: '#ưu đãi' },
        { name: 'Tour', icon: Compass, href: '/tours' },
    ];

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
                            <a
                                key={link.name}
                                href={link.href}
                                className={styles.navLink}
                            >
                                <link.icon className={styles.navIcon} />
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className={styles.authContainer}>
                        <Link to="/login" className={styles.signInBtn}>
                            Sign In
                        </Link>
                        <Link to="/register" className={styles.joinBtn}>
                            Sign up
                        </Link>
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
                            <a
                                key={link.name}
                                href={link.href}
                                className={styles.mobileNavLink}
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.name}
                            </a>
                        ))}
                        <div className={styles.mobileAuthContainer}>
                            <Link to="/login" className={styles.mobileSignInBtn} onClick={() => setIsOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/signup" className={styles.mobileJoinBtn} onClick={() => setIsOpen(false)}>
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
