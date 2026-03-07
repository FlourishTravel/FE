import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, Calendar, LogOut, MapPin } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Tài khoản của tôi</h1>
                    <p className={styles.subtitle}>Thông tin cá nhân và chuyến đi đã đặt</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.avatarSection}>
                        <img src={user.avatar} alt="" className={styles.avatar} />
                        <h2 className={styles.name}>{user.name}</h2>
                        <p className={styles.email}>
                            <Mail className={styles.icon} />
                            {user.email}
                        </p>
                        {user.phone && (
                            <p className={styles.phone}>
                                <Phone className={styles.icon} />
                                {user.phone}
                            </p>
                        )}
                        {user.joinedDate && (
                            <p className={styles.joined}>
                                <Calendar className={styles.icon} />
                                Tham gia từ {user.joinedDate}
                            </p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Link to="/my-journey" className={styles.primaryBtn}>
                            <MapPin className={styles.btnIcon} />
                            Chuyến đi của tôi
                        </Link>
                        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut className={styles.btnIcon} />
                            Đăng xuất
                        </button>
                    </div>
                </div>

                <p className={styles.hint}>
                    Đăng nhập bằng tài khoản demo: <strong>demo@flourish.com</strong> / <strong>flourish123</strong>
                </p>
            </div>
        </div>
    );
};

export default Profile;
