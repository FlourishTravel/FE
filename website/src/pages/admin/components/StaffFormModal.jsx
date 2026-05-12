import React, { useCallback, useEffect, useState } from 'react';
import styles from './StaffFormModal.module.css';
import {
    createStaff,
    getStaffDetail,
    updateStaff,
} from '../../../api/adminStaff';
import AdminImageField from './AdminImageField';

/** Backend có thể trả LocalDate dạng chuỗi hoặc mảng [y,m,d]. */
function normalizeDateField(v) {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    if (Array.isArray(v) && v.length >= 3) {
        const [y, m, d] = v;
        return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return '';
}

const emptyCreate = {
    email: '',
    password: '',
    fullName: '',
    phone: '',
    roleName: 'STAFF',
    jobTitle: '',
    department: 'SALES',
    employmentStatus: 'active',
};

/**
 * mode: 'create' | 'edit'
 * staffId: string | null (edit)
 * open: boolean
 * onClose()
 * onSaved(detail)
 */
const StaffFormModal = ({ open, mode, staffId, onClose, onSaved }) => {
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    const [createForm, setCreateForm] = useState(emptyCreate);

    const [editForm, setEditForm] = useState({
        fullName: '',
        phone: '',
        avatarUrl: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        jobTitle: '',
        department: '',
        roleName: '',
        employmentStatus: '',
        adminNote: '',
    });

    const loadEdit = useCallback(async () => {
        if (!staffId) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const d = await getStaffDetail(staffId);
            setEditForm({
                fullName: d.fullName || '',
                phone: d.phone || '',
                avatarUrl: d.avatarUrl || '',
                dateOfBirth: normalizeDateField(d.dateOfBirth),
                gender: d.gender || '',
                address: d.address || '',
                jobTitle: d.jobTitle || '',
                department: d.department || '',
                roleName: d.roleName || '',
                employmentStatus: d.employmentStatus || 'active',
                adminNote: d.adminNote || '',
            });
        } catch (err) {
            setErrorMsg(err.message || 'Không tải được nhân viên');
        } finally {
            setLoading(false);
        }
    }, [staffId]);

    useEffect(() => {
        if (!open) return;
        setErrorMsg('');
        if (mode === 'create') {
            setCreateForm(emptyCreate);
        } else if (mode === 'edit' && staffId) {
            loadEdit();
        }
    }, [open, mode, staffId, loadEdit]);

    const handleCreateChange = (field, value) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitCreate = async () => {
        const {
            email, password, fullName, phone, roleName, jobTitle, department, employmentStatus,
        } = createForm;
        if (!email.trim() || !password || !fullName.trim()) {
            setErrorMsg('Email, mật khẩu và họ tên là bắt buộc');
            return;
        }
        if (password.length < 8) {
            setErrorMsg('Mật khẩu tối thiểu 8 ký tự');
            return;
        }
        setSubmitting(true);
        setErrorMsg('');
        try {
            const body = {
                email: email.trim(),
                password,
                fullName: fullName.trim(),
                phone: phone.trim() || undefined,
                roleName,
                jobTitle: jobTitle.trim() || undefined,
                department: department.trim() || undefined,
                employmentStatus: employmentStatus || undefined,
            };
            const saved = await createStaff(body);
            if (onSaved) onSaved(saved);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Không tạo được nhân viên');
        } finally {
            setSubmitting(false);
        }
    };

    const submitEdit = async () => {
        if (!staffId) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const body = {};
            if (editForm.fullName.trim()) body.fullName = editForm.fullName.trim();
            body.phone = editForm.phone.trim();
            body.avatarUrl = editForm.avatarUrl.trim();
            if (editForm.dateOfBirth) body.dateOfBirth = editForm.dateOfBirth;
            if (editForm.gender) body.gender = editForm.gender;
            body.address = editForm.address.trim();
            body.jobTitle = editForm.jobTitle.trim();
            if (editForm.department) {
                body.department = editForm.department.trim().toUpperCase();
            }
            if (editForm.roleName) body.roleName = editForm.roleName.trim().toUpperCase();
            if (editForm.employmentStatus) body.employmentStatus = editForm.employmentStatus;
            body.adminNote = editForm.adminNote.trim();

            const saved = await updateStaff(staffId, body);
            if (onSaved) onSaved(saved);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Không cập nhật được');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={styles.title}>
                        {mode === 'create' ? 'Thêm nhân viên' : 'Chỉnh sửa nhân viên'}
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng">
                        <span className="material-icons-round" style={{ fontSize: '22px' }}>close</span>
                    </button>
                </div>

                <div className={styles.body}>
                    {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}

                    {mode === 'create' && (
                        <>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="st-email">Email *</label>
                                <input
                                    id="st-email"
                                    className={styles.input}
                                    value={createForm.email}
                                    onChange={(e) => handleCreateChange('email', e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="st-pw">Mật khẩu *</label>
                                <input
                                    id="st-pw"
                                    type="password"
                                    className={styles.input}
                                    value={createForm.password}
                                    onChange={(e) => handleCreateChange('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="st-name">Họ tên *</label>
                                <input
                                    id="st-name"
                                    className={styles.input}
                                    value={createForm.fullName}
                                    onChange={(e) => handleCreateChange('fullName', e.target.value)}
                                />
                            </div>
                            <div className={styles.gridTwo}>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="st-phone">SĐT</label>
                                    <input
                                        id="st-phone"
                                        className={styles.input}
                                        value={createForm.phone}
                                        onChange={(e) => handleCreateChange('phone', e.target.value)}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="st-role">Vai trò *</label>
                                    <select
                                        id="st-role"
                                        className={styles.select}
                                        value={createForm.roleName}
                                        onChange={(e) => handleCreateChange('roleName', e.target.value)}
                                    >
                                        <option value="STAFF">Nhân viên nội bộ (STAFF)</option>
                                        <option value="TOUR_GUIDE">Hướng dẫn viên</option>
                                        <option value="ADMIN">Quản trị</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.gridTwo}>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="st-dept">Bộ phận</label>
                                    <select
                                        id="st-dept"
                                        className={styles.select}
                                        value={createForm.department}
                                        onChange={(e) => handleCreateChange('department', e.target.value)}
                                    >
                                        <option value="SALES">Sales</option>
                                        <option value="OPERATIONS">Điều hành</option>
                                        <option value="FINANCE">Kế toán</option>
                                        <option value="ADMIN">Quản trị</option>
                                        <option value="GUIDE">HDV</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="st-emp">Trạng thái làm việc</label>
                                    <select
                                        id="st-emp"
                                        className={styles.select}
                                        value={createForm.employmentStatus}
                                        onChange={(e) => handleCreateChange('employmentStatus', e.target.value)}
                                    >
                                        <option value="active">Đang làm</option>
                                        <option value="on_leave">Nghỉ phép</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="st-job">Chức danh</label>
                                <input
                                    id="st-job"
                                    className={styles.input}
                                    value={createForm.jobTitle}
                                    onChange={(e) => handleCreateChange('jobTitle', e.target.value)}
                                    placeholder="VD: Sales Tour"
                                />
                            </div>
                        </>
                    )}

                    {mode === 'edit' && (
                        <>
                            {loading && <div style={{ color: '#9ca3af', padding: 16 }}>Đang tải...</div>}
                            {!loading && (
                                <>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="ed-name">Họ tên</label>
                                        <input
                                            id="ed-name"
                                            className={styles.input}
                                            value={editForm.fullName}
                                            onChange={(e) => handleEditChange('fullName', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.gridTwo}>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-phone">SĐT</label>
                                            <input
                                                id="ed-phone"
                                                className={styles.input}
                                                value={editForm.phone}
                                                onChange={(e) => handleEditChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-dob">Ngày sinh</label>
                                            <input
                                                id="ed-dob"
                                                type="date"
                                                className={styles.input}
                                                value={editForm.dateOfBirth || ''}
                                                onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.gridTwo}>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-gender">Giới tính</label>
                                            <select
                                                id="ed-gender"
                                                className={styles.select}
                                                value={editForm.gender || ''}
                                                onChange={(e) => handleEditChange('gender', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-role">Vai trò</label>
                                            <select
                                                id="ed-role"
                                                className={styles.select}
                                                value={editForm.roleName || ''}
                                                onChange={(e) => handleEditChange('roleName', e.target.value)}
                                            >
                                                <option value="STAFF">STAFF</option>
                                                <option value="TOUR_GUIDE">TOUR_GUIDE</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.gridTwo}>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-dept">Bộ phận</label>
                                            <select
                                                id="ed-dept"
                                                className={styles.select}
                                                value={editForm.department || ''}
                                                onChange={(e) => handleEditChange('department', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                <option value="SALES">SALES</option>
                                                <option value="OPERATIONS">OPERATIONS</option>
                                                <option value="FINANCE">FINANCE</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="GUIDE">GUIDE</option>
                                            </select>
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor="ed-emp">Trạng thái làm việc</label>
                                            <select
                                                id="ed-emp"
                                                className={styles.select}
                                                value={editForm.employmentStatus || ''}
                                                onChange={(e) => handleEditChange('employmentStatus', e.target.value)}
                                            >
                                                <option value="active">Đang làm</option>
                                                <option value="on_leave">Nghỉ phép</option>
                                                <option value="inactive">Đã nghỉ việc</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="ed-job">Chức danh</label>
                                        <input
                                            id="ed-job"
                                            className={styles.input}
                                            value={editForm.jobTitle}
                                            onChange={(e) => handleEditChange('jobTitle', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <AdminImageField
                                            label="Ảnh đại diện"
                                            value={editForm.avatarUrl}
                                            onChange={(v) => handleEditChange('avatarUrl', v)}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="ed-addr">Địa chỉ</label>
                                        <textarea
                                            id="ed-addr"
                                            className={styles.textarea}
                                            value={editForm.address}
                                            onChange={(e) => handleEditChange('address', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor="ed-note">Ghi chú nội bộ</label>
                                        <textarea
                                            id="ed-note"
                                            className={styles.textarea}
                                            value={editForm.adminNote}
                                            onChange={(e) => handleEditChange('adminNote', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.btn} onClick={onClose} disabled={submitting}>
                        Huỷ
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={mode === 'create' ? submitCreate : submitEdit}
                        disabled={submitting || (mode === 'edit' && loading)}
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffFormModal;
