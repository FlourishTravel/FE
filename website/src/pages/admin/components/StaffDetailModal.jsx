import React, { useCallback, useEffect, useState } from 'react';
import styles from './StaffDetailModal.module.css';
import {
    activateStaff,
    deactivateStaff,
    getStaffDetail,
    resetStaffPassword,
} from '../../../api/adminStaff';

const formatDateTime = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('vi-VN');
    } catch {
        return '—';
    }
};

const formatGender = (g) => {
    if (!g) return '—';
    const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return map[g] || g;
};

const initialsOf = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const empLabel = (s) => {
    if (!s) return '—';
    if (s === 'active') return 'Đang làm';
    if (s === 'on_leave') return 'Nghỉ phép';
    if (s === 'inactive') return 'Đã nghỉ việc';
    return s;
};

/**
 * staffId: string | null
 * onClose()
 * onUpdated(detail)
 * onEditClick(id) — mở form chỉnh sửa ở trang cha
 */
const StaffDetailModal = ({ staffId, onClose, onUpdated, onEditClick }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [busy, setBusy] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const fetchDetail = useCallback(async () => {
        if (!staffId) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await getStaffDetail(staffId);
            setDetail(data);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải nhân viên');
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [staffId]);

    useEffect(() => {
        if (staffId) {
            setSuccessMsg('');
            setNewPassword('');
            fetchDetail();
        }
    }, [staffId, fetchDetail]);

    const refreshAndNotify = async (updated) => {
        setDetail(updated);
        if (onUpdated) onUpdated(updated);
        setSuccessMsg('Đã cập nhật');
        setTimeout(() => setSuccessMsg(''), 2200);
    };

    const handleToggleActive = async () => {
        if (!staffId || !detail) return;
        setBusy(true);
        setErrorMsg('');
        try {
            const next = detail.active ? await deactivateStaff(staffId) : await activateStaff(staffId);
            await refreshAndNotify(next);
        } catch (err) {
            setErrorMsg(err.message || 'Thao tác thất bại');
        } finally {
            setBusy(false);
        }
    };

    const handleResetPassword = async () => {
        if (!staffId || !newPassword || newPassword.length < 8) {
            setErrorMsg('Mật khẩu mới tối thiểu 8 ký tự');
            return;
        }
        setBusy(true);
        setErrorMsg('');
        try {
            const updated = await resetStaffPassword(staffId, newPassword);
            setNewPassword('');
            await refreshAndNotify(updated);
        } catch (err) {
            setErrorMsg(err.message || 'Đặt lại mật khẩu thất bại');
        } finally {
            setBusy(false);
        }
    };

    if (!staffId) return null;

    const isGuide = detail?.roleName === 'TOUR_GUIDE';

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        {detail?.avatarUrl ? (
                            <img src={detail.avatarUrl} alt="" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>{initialsOf(detail?.fullName)}</div>
                        )}
                        <div>
                            <div className={styles.title}>{detail?.fullName || '—'}</div>
                            <div className={styles.subRow}>
                                <span className={styles.email}>{detail?.email}</span>
                                {detail?.employeeCode && (
                                    <span className={styles.badge}>{detail.employeeCode}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng">
                        <span className="material-icons-round" style={{ fontSize: '22px' }}>close</span>
                    </button>
                </div>

                <div className={styles.body}>
                    {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}
                    {successMsg && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{successMsg}</div>}

                    {loading && <div className={styles.loading}>Đang tải...</div>}
                    {!loading && detail && (
                        <>
                            {isGuide && (
                                <div className={styles.statsRow}>
                                    <div className={styles.statBox}>
                                        <div className={styles.statLabel}>Tour sắp tới</div>
                                        <div className={styles.statValue}>
                                            {detail.upcomingSessionsCount ?? 0}
                                        </div>
                                    </div>
                                    <div className={styles.statBox}>
                                        <div className={styles.statLabel}>Session 90 ngày</div>
                                        <div className={styles.statValue}>
                                            {detail.scheduledSessionsNext90Days ?? 0}
                                        </div>
                                    </div>
                                    <div className={styles.statBox}>
                                        <div className={styles.statLabel}>Trạng thái làm việc</div>
                                        <div className={styles.statValue}>{empLabel(detail.employmentStatus)}</div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.gridTwo}>
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Hệ thống & HR</div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Vai trò</span>
                                        <span>{detail.roleLabel || detail.roleName}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Bộ phận</span>
                                        <span>{detail.departmentLabel || '—'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Chức danh</span>
                                        <span>{detail.jobTitle || '—'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Làm việc</span>
                                        <span>{empLabel(detail.employmentStatus)}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Đăng nhập</span>
                                        <span>{detail.active ? 'Được phép' : 'Đã khóa'}</span>
                                    </div>
                                </div>
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Liên hệ & cá nhân</div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>SĐT</span>
                                        <span>{detail.phone || '—'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Giới tính</span>
                                        <span>{formatGender(detail.gender)}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Ngày sinh</span>
                                        <span>
                                            {detail.dateOfBirth
                                                ? new Date(detail.dateOfBirth).toLocaleDateString('vi-VN')
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Địa chỉ</span>
                                        <span>{detail.address || '—'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Đăng nhập cuối</span>
                                        <span>{formatDateTime(detail.lastLoginAt)}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Tham gia</span>
                                        <span>{formatDateTime(detail.joinedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {detail.adminNote && (
                                <div className={styles.noteArea}>
                                    <div className={styles.noteLabel}>Ghi chú nội bộ</div>
                                    <div className={styles.noteText}>{detail.adminNote}</div>
                                </div>
                            )}

                            <div className={styles.section} style={{ marginTop: 12 }}>
                                <div className={styles.sectionTitle}>Đặt lại mật khẩu</div>
                                <div className={styles.pwdRow}>
                                    <input
                                        type="password"
                                        className={styles.pwdInput}
                                        placeholder="Mật khẩu mới (≥ 8 ký tự)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        onClick={handleResetPassword}
                                        disabled={busy}
                                    >
                                        Lưu mật khẩu
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.btn} onClick={onClose}>
                        Đóng
                    </button>
                    {onEditClick && (
                        <button
                            type="button"
                            className={styles.btn}
                            onClick={() => onEditClick(staffId)}
                            disabled={!detail || busy}
                        >
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                            Chỉnh sửa
                        </button>
                    )}
                    <button
                        type="button"
                        className={`${styles.btn} ${detail?.active ? styles.btnDanger : styles.btnPrimary}`}
                        onClick={handleToggleActive}
                        disabled={busy || !detail}
                    >
                        {detail?.active ? 'Vô hiệu hoá' : 'Kích hoạt'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffDetailModal;
