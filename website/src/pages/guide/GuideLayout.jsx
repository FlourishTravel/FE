import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './GuideLayout.module.css';
import logoImg from '../../assets/LogoFlourish\'.jpg';

const NAV_ITEMS = [
    { path: '/guide', icon: 'dashboard', label: 'Bảng điều khiển', end: true },
    { path: '/guide/tours', icon: 'map', label: 'Quản lý Tour' },
    { path: '/guide/guests', icon: 'groups', label: 'Quản lý Khách' },
    { path: '/guide/communication', icon: 'forum', label: 'Giao tiếp' },
    { path: '/guide/operations', icon: 'settings', label: 'Vận hành' },
    { path: '/guide/expenses', icon: 'account_balance_wallet', label: 'Chi phí' },
];

const GuideLayout = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className={styles.guideRoot}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIconContainer}>
                            <img src={logoImg} alt="Flourish HDV Logo" className={styles.guideLogoImage} />
                        </div>
                        {!sidebarCollapsed && (
                            <div className={styles.logoText}>
                                <span className={styles.logoTitle}>Flourish HDV</span>
                                <span className={styles.logoSub}>Hướng dẫn viên chuyên nghiệp</span>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.collapseBtn}
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <span className="material-icons-round">
                            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navActive : ''}`
                            }
                        >
                            <span className="material-icons-round">{item.icon}</span>
                            {!sidebarCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* SOS Button */}
                <div className={styles.sosSection}>
                    <button className={styles.sosBtn}>
                        <span className={styles.sosText}>SOS</span>
                        {!sidebarCollapsed && <span>Báo cáo sự cố (SOS)</span>}
                    </button>
                </div>

                <div className={styles.sidebarFooter}>
                    <NavLink to="/guide/settings" className={styles.footerLink}>
                        <span className="material-icons-round">settings</span>
                        {!sidebarCollapsed && <span>Cài đặt</span>}
                    </NavLink>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
                        <span className="material-icons-round">logout</span>
                        {!sidebarCollapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className={`${styles.mainArea} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>
                {/* Top Header */}
                <header className={styles.topHeader}>
                    <div className={styles.searchBox}>
                        <span className="material-icons-round" style={{ fontSize: '20px', color: '#9ca3af' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách, tour..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.headerBtn} title="Thông báo">
                            <span className="material-icons-round">notifications</span>
                            <span className={styles.notifBadge}>2</span>
                        </button>
                        <button className={styles.headerBtn} title="Hỗ trợ">
                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#2ecc71' }}>✻</span>
                        </button>
                        <button className={styles.headerBtn} title="Tin nhắn">
                            <span className="material-icons-round">chat_bubble_outline</span>
                        </button>
                        <div className={styles.headerDivider}></div>
                        <div className={styles.headerUser}>
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                                alt="Avatar"
                                className={styles.headerAvatar}
                            />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GuideLayout;
