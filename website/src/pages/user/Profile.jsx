import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMe, updateMe } from '../../api/users';
import { clearAuthSession } from '../../api/http';
import { resolveMediaUrl } from '../../api/config';
import {
    Mail, Phone, Calendar, LogOut, MapPin, Camera,
    Edit3, Save, X, User, Shield, CheckCircle, Home, Users
} from 'lucide-react';
import styles from './Profile.module.css';

const mapGenderBeToUi = (gender) => {
    const normalized = String(gender || '').toLowerCase();
    if (normalized === 'male') return 'Nam';
    if (normalized === 'female') return 'Nữ';
    if (normalized === 'other') return 'Khác';
    return 'Khác';
};

const mapGenderUiToBe = (gender) => {
    if (gender === 'Nam') return 'male';
    if (gender === 'Nữ') return 'female';
    return 'other';
};

const extractUserPayload = (payload) => payload?.data || payload?.user || payload || {};

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: '',
        phone: '',
        address: '',
        gender: 'Nam',
        avatarUrl: '',
    });
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!user) return undefined;

        let alive = true;
        (async () => {
            setLoadingProfile(true);
            setLoadError('');
            try {
                const res = await getMe();
                if (!alive) return;
                const me = extractUserPayload(res);
                updateUser({
                    name: me.fullName || me.name || user.name,
                    fullName: me.fullName || me.name || user.fullName || '',
                    email: me.email || user.email,
                    phone: me.phone || '',
                    avatar: resolveMediaUrl(me.avatarUrl || me.avatar || ''),
                    avatarUrl: me.avatarUrl || me.avatar || '',
                    gender: mapGenderBeToUi(me.gender),
                    address: me.address || '',
                });
            } catch (e) {
                if (!alive) return;
                if (e?.status === 401) {
                    clearAuthSession();
                    window.dispatchEvent(new Event('flourish:session-expired'));
                    navigate('/login?return=/profile', { replace: true });
                    return;
                }
                setLoadError(e.message || 'Không tải được hồ sơ người dùng.');
            } finally {
                if (alive) setLoadingProfile(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [user?.id, updateUser]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const startEditing = () => {
        setEditData({
            fullName: user.fullName || user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || 'Nam',
            avatarUrl: user.avatarUrl || user.avatar || '',
        });
        setIsEditing(true);
        setSaveSuccess(false);
        setSaveError('');
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveSuccess(false);
        setSaveError('');
    };

    const handleSave = async () => {
        if (!editData.fullName.trim()) return;
        setSaveLoading(true);
        setSaveError('');
        try {
            const payload = {
                fullName: editData.fullName.trim(),
                phone: editData.phone.trim(),
                avatarUrl: editData.avatarUrl.trim(),
                gender: mapGenderUiToBe(editData.gender),
                address: editData.address.trim(),
            };
            const res = await updateMe(payload);
            const updated = extractUserPayload(res);
            updateUser({
                name: updated.fullName || payload.fullName,
                fullName: updated.fullName || payload.fullName,
                phone: updated.phone ?? payload.phone,
                address: updated.address ?? payload.address,
                gender: mapGenderBeToUi(updated.gender || payload.gender),
                avatarUrl: updated.avatarUrl ?? payload.avatarUrl,
                avatar: resolveMediaUrl(updated.avatarUrl ?? payload.avatarUrl),
            });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            setSaveError(e.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isEditing) return;
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
            const value = ev.target?.result || '';
            setEditData((prev) => ({ ...prev, avatarUrl: String(value) }));
        };
        reader.readAsDataURL(file);
    };

    const avatarSrc = resolveMediaUrl(
        (isEditing ? editData.avatarUrl : (user.avatarUrl || user.avatar)) || '',
    );

    if (loadingProfile) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.mainContent}>
                    <div className={styles.profileContainer} style={{ padding: 24 }}>
                        Đang tải thông tin hồ sơ...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                {/* Profile Container */}
                <div className={styles.profileContainer}>
                    {loadError ? (
                        <div className={styles.successBanner} style={{ background: '#fef2f2', color: '#b91c1c' }}>
                            {loadError}
                        </div>
                    ) : null}
                    {/* Avatar Section */}
                    <div className={styles.avatarArea}>
                        <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                            <img src={avatarSrc || user.avatar || ''} alt={user.name} className={styles.avatar} />
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
                        <h2 className={styles.userName}>{user.fullName || user.name}</h2>
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
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading}>
                                        <Save size={15} />
                                        {saveLoading ? 'Đang lưu...' : 'Lưu'}
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
                                            value={editData.fullName}
                                            onChange={(e) => setEditData(d => ({ ...d, fullName: e.target.value }))}
                                            placeholder="Nhập họ tên"
                                        />
                                    ) : (
                                        <span className={styles.infoValue}>{user.fullName || user.name}</span>
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

                        </div>
                        {saveError ? (
                            <p style={{ color: '#b91c1c', marginTop: 8 }}>{saveError}</p>
                        ) : null}
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
