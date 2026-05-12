import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
    { path: '/admin/tours', icon: 'explore', label: 'Quản Lý Tour' },
    { path: '/admin/categories', icon: 'category', label: 'Danh Mục' },
    { path: '/admin/dispatch', icon: 'calendar_month', label: 'Điều Hành Tour' },
    { path: '/admin/bookings', icon: 'book_online', label: 'Quản Lý Đặt Chỗ' },
    { path: '/admin/customers', icon: 'group', label: 'Khách Hàng' },
    { path: '/admin/financials', icon: 'payments', label: 'Tài Chính' },
    { path: '/admin/staff', icon: 'manage_accounts', label: 'Nhân Viên' },
    { path: '/admin/settings', icon: 'settings', label: 'Cài Đặt' },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.adminRoot}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}>
                            <span className="material-icons-round">spa</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className={styles.logoText}>
                                <span className={styles.logoTitle}>Flourish Travel</span>
                                <span className={styles.logoSub}>Admin Panel</span>
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

                <div className={styles.sidebarFooter}>
                    <div className={styles.userCard}>
                        <img
                            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                            alt="Avatar"
                            className={styles.userAvatar}
                        />
                        {!sidebarCollapsed && (
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.name || 'Admin'}</span>
                                <span className={styles.userRole}>Super Admin</span>
                            </div>
                        )}
                    </div>
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
                            placeholder="Tìm kiếm tour, booking, khách hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.headerBtn} title="Thông báo">
                            <span className="material-icons-round">notifications</span>
                            <span className={styles.notifBadge}>3</span>
                        </button>
                        <button className={styles.headerBtn} title="Tin nhắn">
                            <span className="material-icons-round">mail</span>
                        </button>
                        <div className={styles.headerDivider}></div>
                        <div className={styles.headerUser}>
                            <img
                                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                                alt="Avatar"
                                className={styles.headerAvatar}
                            />
                            <span className={styles.headerUserName}>{user?.name || 'Admin'}</span>
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

export default AdminLayout;
