import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Luggage, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openFloraChat } from '../config/navConfig';
import FloraAvatar from './FloraAvatar';
import styles from './UserBottomNav.module.css';

const HIDDEN_PREFIXES = ['/admin', '/guide', '/chat/', '/login', '/register', '/checkout'];

export default function UserBottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    const path = location.pathname;

    if (HIDDEN_PREFIXES.some((p) => (p.endsWith('/') ? path.startsWith(p) : path === p || path.startsWith(`${p}/`)))) {
        return null;
    }

    const accountHref = user ? '/profile' : '/login';
    const tripsHref = user ? '/my-journey' : '/login?return=/my-journey';

    return (
        <nav className={styles.bar} aria-label="Điều hướng nhanh">
            <Link to="/" className={`${styles.item} ${path === '/' ? styles.active : ''}`}>
                <Home className={styles.icon} />
                <span>Trang chủ</span>
            </Link>
            <Link to="/tours" className={`${styles.item} ${path.startsWith('/tours') ? styles.active : ''}`}>
                <Map className={styles.icon} />
                <span>Tour</span>
            </Link>
            <Link to={tripsHref} className={`${styles.item} ${path.startsWith('/my-journey') ? styles.active : ''}`}>
                <Luggage className={styles.icon} />
                <span>Chuyến đi</span>
            </Link>
            <button type="button" className={styles.item} onClick={() => openFloraChat()}>
                <FloraAvatar className={styles.flora} alt="" />
                <span>Flora</span>
            </button>
            <Link to={accountHref} className={`${styles.item} ${path.startsWith('/profile') ? styles.active : ''}`}>
                <UserRound className={styles.icon} />
                <span>Tài khoản</span>
            </Link>
        </nav>
    );
}
