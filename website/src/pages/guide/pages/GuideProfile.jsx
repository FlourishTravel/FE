import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMe, updateMe } from '../../../api/users';
import { uploadMedia } from '../../../api/upload';
import { clearAuthSession } from '../../../api/http';
import { resolveMediaUrl } from '../../../api/config';
import { GUIDE_LANGUAGE_OPTIONS, GUIDE_SPECIALTY_OPTIONS, toggleChip } from '../../../config/guideProfile';
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
    const coverInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
    const [pendingCoverFile, setPendingCoverFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        gender: 'Nam',
        avatarUrl: '',
        email: '',
        jobTitle: '',
        guideShortBio: '',
        guideBio: '',
        guideLanguages: ['Tiếng Việt'],
        guideSpecialties: [],
        guideCoverUrl: '',
        guideExperienceYears: 1,
        guideBaseLocation: '',
        guidePublicApproved: false,
        guidePendingReview: false,
        guideVerified: false,
        guideBadges: [],
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
                    guideShortBio: me.guideShortBio || '',
                    guideBio: me.guideBio || '',
                    guideLanguages: Array.isArray(me.guideLanguages) && me.guideLanguages.length ? me.guideLanguages : ['Tiếng Việt'],
                    guideSpecialties: Array.isArray(me.guideSpecialties) ? me.guideSpecialties : [],
                    guideCoverUrl: me.guideCoverUrl || '',
                    guideExperienceYears: me.guideExperienceYears ?? 1,
                    guideBaseLocation: me.guideBaseLocation || '',
                    guidePublicApproved: Boolean(me.guidePublicApproved),
                    guidePendingReview: Boolean(me.guidePendingReview),
                    guideVerified: Boolean(me.guideVerified),
                    guideBadges: Array.isArray(me.guideBadges) ? me.guideBadges : [],
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

    const pickImage = (file, kind) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrorMsg('Chỉ chọn file ảnh.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg('Ảnh tối đa 2MB.');
            return;
        }
        const url = URL.createObjectURL(file);
        if (kind === 'avatar') {
            if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
            setPendingAvatarFile(file);
            setAvatarPreview(url);
        } else {
            if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
            setPendingCoverFile(file);
            setCoverPreview(url);
        }
        setErrorMsg('');
    };

    const statusNote = useMemo(() => {
        if (form.guidePublicApproved && form.guidePendingReview) {
            return 'Hồ sơ đang hiện trên Đội ngũ HDV. Bản sửa vừa lưu chờ admin xem lại.';
        }
        if (form.guidePublicApproved) {
            return 'Hồ sơ đã được duyệt và đang hiện trên Khám phá → Đội ngũ HDV.';
        }
        if (form.guidePendingReview) {
            return 'Đã gửi admin. Chưa duyệt nên trang khách chưa hiện hồ sơ này.';
        }
        return 'Điền bio, ngôn ngữ, chuyên môn rồi Lưu. Admin duyệt xong mới hiện trên trang khách.';
    }, [form.guidePublicApproved, form.guidePendingReview]);

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
                guideShortBio: form.guideShortBio.trim(),
                guideBio: form.guideBio.trim(),
                guideLanguages: form.guideLanguages,
                guideSpecialties: form.guideSpecialties,
                guideExperienceYears: Number(form.guideExperienceYears) || 0,
                guideBaseLocation: form.guideBaseLocation.trim(),
            };
            if (pendingAvatarFile) {
                payload.avatarUrl = await uploadMedia(pendingAvatarFile);
            }
            if (pendingCoverFile) {
                payload.guideCoverUrl = await uploadMedia(pendingCoverFile);
            }
            const res = await updateMe(payload);
            const updated = extractUserPayload(res);
            const avatarUrl = updated.avatarUrl ?? payload.avatarUrl ?? form.avatarUrl;
            const coverUrl = updated.guideCoverUrl ?? payload.guideCoverUrl ?? form.guideCoverUrl;
            setForm((prev) => ({
                ...prev,
                fullName: updated.fullName || payload.fullName,
                phone: updated.phone ?? payload.phone,
                address: updated.address ?? payload.address,
                gender: mapGenderUiToBe(updated.gender || payload.gender),
                avatarUrl,
                jobTitle: updated.jobTitle || prev.jobTitle,
                guideShortBio: updated.guideShortBio ?? payload.guideShortBio,
                guideBio: updated.guideBio ?? payload.guideBio,
                guideLanguages: updated.guideLanguages || payload.guideLanguages,
                guideSpecialties: updated.guideSpecialties || payload.guideSpecialties,
                guideCoverUrl: coverUrl,
                guideExperienceYears: updated.guideExperienceYears ?? payload.guideExperienceYears,
                guideBaseLocation: updated.guideBaseLocation ?? payload.guideBaseLocation,
                guidePublicApproved: Boolean(updated.guidePublicApproved),
                guidePendingReview: Boolean(updated.guidePendingReview),
                guideVerified: Boolean(updated.guideVerified),
                guideBadges: Array.isArray(updated.guideBadges) ? updated.guideBadges : prev.guideBadges,
            }));
            updateUser({
                name: updated.fullName || payload.fullName,
                fullName: updated.fullName || payload.fullName,
                phone: updated.phone ?? payload.phone,
                address: updated.address ?? payload.address,
                gender: mapGenderUiToBe(updated.gender || payload.gender),
                avatarUrl,
                avatar: resolveMediaUrl(avatarUrl),
            });
            if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
            if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
            setPendingAvatarFile(null);
            setPendingCoverFile(null);
            setAvatarPreview('');
            setCoverPreview('');
            setSuccessMsg('Đã lưu hồ sơ. Admin sẽ duyệt phần công khai trước khi hiện trên trang khách.');
        } catch (err) {
            setErrorMsg(err.message || 'Không lưu được hồ sơ.');
        } finally {
            setSaving(false);
        }
    };

    const avatarSrc = avatarPreview || resolveMediaUrl(form.avatarUrl);
    const coverSrc = coverPreview || resolveMediaUrl(form.guideCoverUrl);

    if (loading) {
        return <p className={styles.muted}>Đang tải hồ sơ...</p>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Hồ sơ HDV</h1>
                    <p className={styles.subtitle}>Phần công khai hiện trên Khám phá → Đội ngũ HDV sau khi admin duyệt.</p>
                </div>
            </div>

            {errorMsg ? <div className={styles.bannerError}>{errorMsg}</div> : null}
            {successMsg ? <div className={styles.bannerSuccess}>{successMsg}</div> : null}
            <div className={form.guidePublicApproved ? styles.bannerSuccess : styles.bannerWarn}>{statusNote}</div>

            <form className={styles.card} onSubmit={handleSave}>
                <div className={styles.avatarRow}>
                    <button type="button" className={styles.avatarBtn} onClick={() => fileInputRef.current?.click()}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={form.fullName} className={styles.avatar} />
                        ) : (
                            <span className={styles.avatarFallback}>HDV</span>
                        )}
                        <span className={styles.avatarHint}>Đổi ảnh</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0], 'avatar')} />
                    <div>
                        <div className={styles.namePreview}>{form.fullName || 'Hướng dẫn viên'}</div>
                        <div className={styles.muted}>{form.jobTitle || 'Hướng dẫn viên'} · {form.email}</div>
                        {form.guideVerified ? <div className={styles.verified}>Đã xác minh</div> : null}
                        {form.guideBadges?.length ? <div className={styles.muted}>{form.guideBadges.join(' · ')}</div> : null}
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
                        Địa chỉ liên hệ (nội bộ)
                        <input name="address" value={form.address} onChange={handleChange} />
                    </label>
                </div>

                <h2 className={styles.sectionTitle}>Hồ sơ công khai</h2>
                <p className={styles.muted}>Chức danh và huy hiệu do admin gán. Bạn tự viết bio, ngôn ngữ, chuyên môn, tuyến phụ trách.</p>

                <label className={`${styles.field} ${styles.full}`}>
                    Ảnh bìa trang chi tiết
                    <button type="button" className={styles.coverBtn} onClick={() => coverInputRef.current?.click()}>
                        {coverSrc ? <img src={coverSrc} alt="" className={styles.coverPreview} /> : 'Tải ảnh bìa'}
                    </button>
                    <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0], 'cover')} />
                </label>

                <div className={styles.grid}>
                    <label className={styles.field}>
                        Tuyến / vùng phụ trách
                        <input name="guideBaseLocation" value={form.guideBaseLocation} onChange={handleChange} placeholder="Bangkok – Pattaya, Thái Lan" maxLength={160} />
                    </label>
                    <label className={styles.field}>
                        Số năm kinh nghiệm
                        <input name="guideExperienceYears" type="number" min="0" max="50" value={form.guideExperienceYears} onChange={handleChange} />
                    </label>
                    <label className={`${styles.field} ${styles.full}`}>
                        Bio ngắn (card danh sách)
                        <textarea name="guideShortBio" value={form.guideShortBio} onChange={handleChange} rows={2} maxLength={280} placeholder="Một câu mô tả phong cách dẫn tour..." />
                    </label>
                    <label className={`${styles.field} ${styles.full}`}>
                        Giới thiệu đầy đủ
                        <textarea name="guideBio" value={form.guideBio} onChange={handleChange} rows={5} maxLength={4000} placeholder="Kể cách bạn dẫn đoàn, tuyến mạnh, điều khách nên biết..." />
                    </label>
                </div>

                <div className={styles.field}>
                    Ngôn ngữ
                    <div className={styles.chips}>
                        {GUIDE_LANGUAGE_OPTIONS.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`${styles.chip} ${form.guideLanguages.includes(item) ? styles.chipOn : ''}`}
                                onClick={() => setForm((prev) => ({ ...prev, guideLanguages: toggleChip(prev.guideLanguages, item) }))}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.field}>
                    Chuyên môn (dùng để lọc trên Đội ngũ HDV)
                    <div className={styles.chips}>
                        {GUIDE_SPECIALTY_OPTIONS.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`${styles.chip} ${form.guideSpecialties.includes(item) ? styles.chipOn : ''}`}
                                onClick={() => setForm((prev) => ({ ...prev, guideSpecialties: toggleChip(prev.guideSpecialties, item) }))}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
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
