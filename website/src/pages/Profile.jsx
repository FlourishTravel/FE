import React, { useState, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail, Phone, Calendar, LogOut, MapPin, Camera,
    Edit3, Save, X, User, Shield, CheckCircle, Home, Users
} from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: 'Nam',
    });
    const [saveSuccess, setSaveSuccess] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const startEditing = () => {
        setEditData({
            name: user.name,
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || 'Nam',
        });
        setIsEditing(true);
        setSaveSuccess(false);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveSuccess(false);
    };

    const handleSave = () => {
        if (!editData.name.trim()) return;
        updateUser({
            name: editData.name.trim(),
            phone: editData.phone.trim(),
            address: editData.address.trim(),
            gender: editData.gender,
        });
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        // Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert('Ảnh tối đa 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateUser({ avatar: ev.target.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                {/* Profile Container */}
                <div className={styles.profileContainer}>
                    {/* Avatar Section */}
                    <div className={styles.avatarArea}>
                        <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                            <img src={user.avatar} alt={user.name} className={styles.avatar} />
                            <div className={styles.avatarOverlay}>
                                <Camera className={styles.cameraIcon} />
                                <span className={styles.avatarOverlayText}>Đổi ảnh</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <h2 className={styles.userName}>{user.name}</h2>
                        <span className={styles.memberBadge}>
                            <CheckCircle size={14} />
                            Thành viên Flourish
                        </span>
                    </div>

                    {/* Success banner */}
                    {saveSuccess && (
                        <div className={styles.successBanner}>
                            <CheckCircle size={16} />
                            Thông tin đã được cập nhật thành công!
                        </div>
                    )}

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoHeader}>
                            <h3 className={styles.infoTitle}>Thông tin cá nhân</h3>
                            {!isEditing ? (
                                <button className={styles.editBtn} onClick={startEditing}>
                                    <Edit3 size={15} />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className={styles.editActions}>
                                    <button className={styles.cancelBtn} onClick={cancelEditing}>
                                        <X size={15} />
                                        Hủy
                                    </button>
                                    <button className={styles.saveBtn} onClick={handleSave}>
                                        <Save size={15} />
                                        Lưu
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.infoGrid}>
                            {/* Name */}
                            <div className={styles.infoRow}>
                                <div className={styles.infoIconBox}>
                                    <User size={18} />
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Họ và tên</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className={styles.infoInput}
                                            value={editData.name}
                                            onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))}
                                            placeholder="Nhập họ tên"
                                        />
                                    ) : (
                                        <span className={styles.infoValue}>{user.name}</span>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.infoRow}>
                                <div className={styles.infoIconBox}>
                                    <Mail size={18} />
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>{user.email}</span>
                                    <span className={styles.readonlyBadge}>Không thể thay đổi</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className={styles.infoRow}>
                                <div className={styles.infoIconBox}>
                                    <Phone size={18} />
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Số điện thoại</span>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className={styles.infoInput}
                                            value={editData.phone}
                                            onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <span className={styles.infoValue}>{user.phone || '—'}</span>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className={styles.infoRow}>
                                <div className={styles.infoIconBox}>
                                    <Home size={18} />
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Địa chỉ</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className={styles.infoInput}
                                            value={editData.address}
                                            onChange={(e) => setEditData(d => ({ ...d, address: e.target.value }))}
                                            placeholder="Nhập địa chỉ"
                                        />
                                    ) : (
                                        <span className={styles.infoValue}>{user.address || '—'}</span>
                                    )}
                                </div>
                            </div>

                            {/* Gender */}
                            <div className={styles.infoRow}>
                                <div className={styles.infoIconBox}>
                                    <Users size={18} />
                                </div>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Giới tính</span>
                                    {isEditing ? (
                                        <select
                                            className={styles.infoInput}
                                            value={editData.gender}
                                            onChange={(e) => setEditData(d => ({ ...d, gender: e.target.value }))}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    ) : (
                                        <span className={styles.infoValue}>{user.gender || '—'}</span>
                                    )}
                                </div>
                            </div>

                            {/* Joined */}
                            {user.joinedDate && (
                                <div className={styles.infoRow}>
                                    <div className={styles.infoIconBox}>
                                        <Calendar size={18} />
                                    </div>
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>Ngày tham gia</span>
                                        <span className={styles.infoValue}>{user.joinedDate}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actionsSection}>
                        <Link to="/my-journey" className={styles.primaryBtn}>
                            <MapPin size={18} />
                            Chuyến đi của tôi
                        </Link>
                        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
