import React, { useState, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Mail, Phone, Calendar, LogOut, MapPin, Camera,
    Edit3, Save, X, User, Shield, CheckCircle, Home, Users, Settings, Activity, Lock, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('personal');

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: 'Nam',
        dob: '',
    });
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Password state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            dob: user.dob || '',
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
            dob: editData.dob,
        });
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handlePasswordSave = (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Vui lòng điền đầy đủ các trường.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        // Giả lập lưu thành công (Trong thực tế cần gọi API)
        setTimeout(() => {
            setPasswordSuccess(true);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSuccess(false), 3000);
        }, 500);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
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
            <div className={styles.containerCustom}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Hồ sơ của tôi</h1>
                    <p className={styles.pageSubtitle}>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
                </div>

                <div className={styles.profileLayout}>
                    {/* Left Column: Sidebar */}
                    <div className={styles.sidebar}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                                <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} alt={user.name} className={styles.avatar} />
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
                            <p className={styles.userEmail}>{user.email}</p>
                            <span className={styles.memberBadge}>
                                <CheckCircle size={14} />
                                Thành viên Flourish
                            </span>
                        </div>

                        <div className={styles.navMenu}>
                            <button
                                className={`${styles.navItem} ${activeTab === 'personal' ? styles.active : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                <User size={18} />
                                <span>Thông tin cá nhân</span>
                            </button>
                            <Link to="/my-journey" className={styles.navItem}>
                                <MapPin size={18} />
                                <span>Chuyến đi của tôi</span>
                            </Link>
                            <button
                                className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <Shield size={18} />
                                <span>Bảo mật & Mật khẩu</span>
                            </button>
             
                        </div>

                        <div className={styles.sidebarFooter}>
                            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                                <LogOut size={18} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className={styles.mainContent}>
                        {activeTab === 'personal' && (
                            <>
                                {saveSuccess && (
                                    <div className={styles.successBanner}>
                                        <CheckCircle size={18} />
                                        <span>Thông tin của bạn đã được cập nhật thành công!</span>
                                    </div>
                                )}

                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h3 className={styles.cardTitle}>Thông tin chi tiết</h3>
                                            <p className={styles.cardDesc}>Cập nhật thông tin cá nhân của bạn để nhận được trải nghiệm tốt nhất.</p>
                                        </div>
                                        {!isEditing ? (
                                            <button className={styles.editBtn} onClick={startEditing}>
                                                <Edit3 size={16} />
                                                Chỉnh sửa
                                            </button>
                                        ) : (
                                            <div className={styles.editActions}>
                                                <button className={styles.cancelBtn} onClick={cancelEditing}>
                                                    <X size={16} />
                                                    Hủy
                                                </button>
                                                <button className={styles.saveBtn} onClick={handleSave}>
                                                    <Save size={16} />
                                                    Lưu thay đổi
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.cardBody}>
                                        <div className={styles.formGrid}>
                                            {/* Name */}
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Họ và tên</label>
                                                <div className={styles.inputWrapper}>
                                                    <User className={styles.inputIcon} size={18} />
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className={styles.formInput}
                                                            value={editData.name}
                                                            onChange={(e) => setEditData(d => ({ ...d, name: e.target.value }))}
                                                            placeholder="Nhập họ tên"
                                                        />
                                                    ) : (
                                                        <div className={styles.readOnlyValue}>{user.name}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Địa chỉ Email</label>
                                                <div className={styles.inputWrapper}>
                                                    <Mail className={styles.inputIcon} size={18} />
                                                    <div className={`${styles.readOnlyValue} ${styles.disabled}`}>
                                                        {user.email}
                                                        <span className={styles.lockedBadge}>Không thể đổi</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Số điện thoại</label>
                                                <div className={styles.inputWrapper}>
                                                    <Phone className={styles.inputIcon} size={18} />
                                                    {isEditing ? (
                                                        <input
                                                            type="tel"
                                                            className={styles.formInput}
                                                            value={editData.phone}
                                                            onChange={(e) => setEditData(d => ({ ...d, phone: e.target.value }))}
                                                            placeholder="Nhập số điện thoại"
                                                        />
                                                    ) : (
                                                        <div className={styles.readOnlyValue}>{user.phone || 'Chưa cập nhật'}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gender */}
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Giới tính</label>
                                                <div className={styles.inputWrapper}>
                                                    <Users className={styles.inputIcon} size={18} />
                                                    {isEditing ? (
                                                        <select
                                                            className={styles.formSelect}
                                                            value={editData.gender}
                                                            onChange={(e) => setEditData(d => ({ ...d, gender: e.target.value }))}
                                                        >
                                                            <option value="Nam">Nam</option>
                                                            <option value="Nữ">Nữ</option>
                                                        </select>
                                                    ) : (
                                                        <div className={styles.readOnlyValue}>{user.gender || 'Chưa cập nhật'}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* DOB */}
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Ngày sinh</label>
                                                <div className={styles.inputWrapper}>
                                                    <Calendar className={styles.inputIcon} size={18} />
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            className={styles.formInput}
                                                            value={editData.dob}
                                                            onChange={(e) => setEditData(d => ({ ...d, dob: e.target.value }))}
                                                        />
                                                    ) : (
                                                        <div className={styles.readOnlyValue}>
                                                            {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                                <label className={styles.formLabel}>Địa chỉ liên hệ</label>
                                                <div className={styles.inputWrapper}>
                                                    <Home className={styles.inputIcon} size={18} />
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            className={styles.formInput}
                                                            value={editData.address}
                                                            onChange={(e) => setEditData(d => ({ ...d, address: e.target.value }))}
                                                            placeholder="Nhập địa chỉ của bạn"
                                                        />
                                                    ) : (
                                                        <div className={styles.readOnlyValue}>{user.address || 'Chưa cập nhật'}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional detail section for a rich feel */}
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
                                            <p className={styles.cardDesc}>Những tương tác và chuyến đi gần nhất của bạn</p>
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>
                                                <Activity size={32} />
                                            </div>
                                            <p className={styles.emptyText}>Chưa có hoạt động nào gần đây</p>
                                            <Link to="/tours" className={styles.exploreBtn}>Khám phá các tour ngay</Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                {passwordSuccess && (
                                    <div className={styles.successBanner}>
                                        <CheckCircle size={18} />
                                        <span>Mật khẩu đã được thay đổi thành công!</span>
                                    </div>
                                )}
                                {passwordError && (
                                    <div className={styles.errorBanner}>
                                        <AlertCircle size={18} />
                                        <span>{passwordError}</span>
                                    </div>
                                )}

                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h3 className={styles.cardTitle}>Đổi mật khẩu</h3>
                                            <p className={styles.cardDesc}>Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài và an toàn để bảo vệ thông tin.</p>
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <form className={styles.passwordForm} onSubmit={handlePasswordSave}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Mật khẩu hiện tại</label>
                                                <div className={styles.inputWrapper}>
                                                    <Lock className={styles.inputIcon} size={18} />
                                                    <input
                                                        type={showOldPassword ? 'text' : 'password'}
                                                        className={styles.formInput}
                                                        value={passwordData.oldPassword}
                                                        onChange={(e) => setPasswordData(d => ({ ...d, oldPassword: e.target.value }))}
                                                        placeholder="Nhập mật khẩu hiện tại"
                                                    />
                                                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className={styles.eyeButton}>
                                                        {showOldPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Mật khẩu mới</label>
                                                <div className={styles.inputWrapper}>
                                                    <Lock className={styles.inputIcon} size={18} />
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        className={styles.formInput}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                                                        placeholder="Nhập mật khẩu mới"
                                                    />
                                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={styles.eyeButton}>
                                                        {showNewPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
                                                <div className={styles.inputWrapper}>
                                                    <Lock className={styles.inputIcon} size={18} />
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        className={styles.formInput}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData(d => ({ ...d, confirmPassword: e.target.value }))}
                                                        placeholder="Nhập lại mật khẩu mới"
                                                    />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eyeButton}>
                                                        {showConfirmPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.formActions}>
                                                <button type="submit" className={styles.saveBtn}>
                                                    <Save size={16} />
                                                    Cập nhật mật khẩu
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
