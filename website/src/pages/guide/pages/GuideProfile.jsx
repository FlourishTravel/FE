import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMe, updateMe } from '../../../api/users';
import { uploadMedia } from '../../../api/upload';
import { clearAuthSession } from '../../../api/http';
import { resolveMediaUrl } from '../../../api/config';
import styles from './GuideProfile.module.css';

const mapGenderBeToUi = (gender) => {
    const normalized = String(gender || '').toLowerCase();
    if (normalized === 'male') return 'Nam';
    if (normalized === 'female') return 'Nữ';
    if (normalized === 'other') return 'Khác';
    return 'Nam';
};

const mapGenderUiToBe = (gender) => {
    if (gender === 'Nam') return 'male';
    if (gender === 'Nữ') return 'female';
    return 'other';
};

const extractUserPayload = (payload) => payload?.data || payload?.user || payload || {};

const GuideProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        gender: 'Nam',
        avatarUrl: '',
        email: '',
        jobTitle: '',
    });

    useEffect(() => {
        if (!user) return undefined;
        let alive = true;
        (async () => {
            setLoading(true);
            setErrorMsg('');
            try {
                const res = await getMe();
                if (!alive) return;
                const me = extractUserPayload(res);
                const next = {
                    fullName: me.fullName || me.name || user.name || '',
                    phone: me.phone || '',
                    address: me.address || '',
                    gender: mapGenderBeToUi(me.gender),
                    avatarUrl: me.avatarUrl || me.avatar || '',
                    email: me.email || user.email || '',
                    jobTitle: me.jobTitle || '',
                };
                setForm(next);
                updateUser({
                    name: next.fullName,
                    fullName: next.fullName,
                    phone: next.phone,
                    address: next.address,
                    gender: next.gender,
                    avatar: resolveMediaUrl(next.avatarUrl),
                    avatarUrl: next.avatarUrl,
                });
            } catch (e) {
                if (!alive) return;
                if (e?.status === 401) {
                    clearAuthSession();
                    window.dispatchEvent(new Event('flourish:session-expired'));
                    navigate('/login', { replace: true });
                    return;
                }
                setErrorMsg(e.message || 'Không tải được hồ sơ.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrorMsg('Chỉ chọn file ảnh.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg('Ảnh tối đa 2MB.');
            return;
        }
        if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
        setPendingAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setErrorMsg('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim()) {
            setErrorMsg('Tên không được để trống.');
            return;
        }
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                gender: mapGenderUiToBe(form.gender),
                address: form.address.trim(),
            };
            if (pendingAvatarFile) {
                payload.avatarUrl = await uploadMedia(pendingAvatarFile);
            }
            const res = await updateMe(payload);
            const updated = extractUserPayload(res);
            const avatarUrl = updated.avatarUrl ?? payload.avatarUrl ?? form.avatarUrl;
            setForm((prev) => ({
                ...prev,
                fullName: updated.fullName || payload.fullName,
                phone: updated.phone ?? payload.phone,
                address: updated.address ?? payload.address,
                gender: mapGenderBeToUi(updated.gender || payload.gender),
                avatarUrl,
                jobTitle: updated.jobTitle || prev.jobTitle,
            }));
            updateUser({
                name: updated.fullName || payload.fullName,
                fullName: updated.fullName || payload.fullName,
                phone: updated.phone ?? payload.phone,
                address: updated.address ?? payload.address,
                gender: mapGenderBeToUi(updated.gender || payload.gender),
                avatarUrl,
                avatar: resolveMediaUrl(avatarUrl),
            });
            if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
            setPendingAvatarFile(null);
            setAvatarPreview('');
            setSuccessMsg('Đã lưu hồ sơ.');
        } catch (err) {
            setErrorMsg(err.message || 'Không lưu được hồ sơ.');
        } finally {
            setSaving(false);
        }
    };

    const avatarSrc = avatarPreview || resolveMediaUrl(form.avatarUrl);

    if (loading) {
        return <p className={styles.muted}>Đang tải hồ sơ...</p>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Hồ sơ HDV</h1>
                    <p className={styles.subtitle}>Thông tin hiển thị trên portal và trang Đội ngũ HDV.</p>
                </div>
            </div>

            {errorMsg ? <div className={styles.bannerError}>{errorMsg}</div> : null}
            {successMsg ? <div className={styles.bannerSuccess}>{successMsg}</div> : null}

            <form className={styles.card} onSubmit={handleSave}>
                <div className={styles.avatarRow}>
                    <button
                        type="button"
                        className={styles.avatarBtn}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={form.fullName} className={styles.avatar} />
                        ) : (
                            <span className={styles.avatarFallback}>HDV</span>
                        )}
                        <span className={styles.avatarHint}>Đổi ảnh</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                    />
                    <div>
                        <div className={styles.namePreview}>{form.fullName || 'Hướng dẫn viên'}</div>
                        <div className={styles.muted}>{form.jobTitle || 'Hướng dẫn viên'} · {form.email}</div>
                    </div>
                </div>

                <div className={styles.grid}>
                    <label className={styles.field}>
                        Họ và tên
                        <input name="fullName" value={form.fullName} onChange={handleChange} required maxLength={255} />
                    </label>
                    <label className={styles.field}>
                        Số điện thoại
                        <input name="phone" value={form.phone} onChange={handleChange} maxLength={20} />
                    </label>
                    <label className={styles.field}>
                        Giới tính
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            <option>Nam</option>
                            <option>Nữ</option>
                            <option>Khác</option>
                        </select>
                    </label>
                    <label className={styles.field}>
                        Email
                        <input value={form.email} disabled />
                    </label>
                    <label className={`${styles.field} ${styles.full}`}>
                        Địa chỉ
                        <input name="address" value={form.address} onChange={handleChange} />
                    </label>
                </div>

                <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                    </button>
                    <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                    >
                        Đăng xuất
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GuideProfile;
