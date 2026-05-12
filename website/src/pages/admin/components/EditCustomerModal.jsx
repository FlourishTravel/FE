import React, { useState } from 'react';
import styles from './EditCustomerModal.module.css';
import { updateAdminCustomer } from '../../../api/adminCustomers';

/**
 * Modal chỉnh sửa thông tin khách hàng (admin).
 *
 * Props:
 *  - customer: AdminCustomerDetailDto
 *  - onClose(): đóng modal
 *  - onSaved(updatedDetail): callback khi lưu thành công
 */
const EditCustomerModal = ({ customer, onClose, onSaved }) => {
    const [form, setForm] = useState({
        fullName: customer.fullName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        avatarUrl: customer.avatarUrl || '',
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || '',
        address: customer.address || '',
        nationality: customer.nationality || '',
        adminNote: customer.adminNote || '',
        marketingOptIn: !!customer.marketingOptIn,
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const setField = (key) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim()) {
            setErrorMsg('Họ tên không được để trống');
            return;
        }
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
            setErrorMsg('Email không hợp lệ');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        try {
            const payload = {
                fullName: form.fullName.trim(),
                email: form.email.trim() || null,
                phone: form.phone.trim() || null,
                avatarUrl: form.avatarUrl.trim() || null,
                dateOfBirth: form.dateOfBirth || null,
                gender: form.gender || null,
                address: form.address.trim() || null,
                nationality: form.nationality.trim() || null,
                adminNote: form.adminNote.trim() || null,
                marketingOptIn: form.marketingOptIn,
            };
            const updated = await updateAdminCustomer(customer.id, payload);
            onSaved(updated);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể lưu thay đổi');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chỉnh sửa khách hàng</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {errorMsg && <div className={styles.error}>{errorMsg}</div>}

                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label className={styles.label}>Họ và tên <span className={styles.required}>*</span></label>
                            <input
                                className={styles.input}
                                type="text"
                                value={form.fullName}
                                onChange={setField('fullName')}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={styles.input}
                                type="email"
                                value={form.email}
                                onChange={setField('email')}
                            />
                        </div>
                    </div>

                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label className={styles.label}>Số điện thoại</label>
                            <input
                                className={styles.input}
                                type="tel"
                                value={form.phone}
                                onChange={setField('phone')}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Avatar URL</label>
                            <input
                                className={styles.input}
                                type="url"
                                value={form.avatarUrl}
                                onChange={setField('avatarUrl')}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className={styles.row3}>
                        <div className={styles.field}>
                            <label className={styles.label}>Ngày sinh</label>
                            <input
                                className={styles.input}
                                type="date"
                                value={form.dateOfBirth}
                                onChange={setField('dateOfBirth')}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Giới tính</label>
                            <select className={styles.input} value={form.gender} onChange={setField('gender')}>
                                <option value="">— Chọn —</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Quốc tịch</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={form.nationality}
                                onChange={setField('nationality')}
                                placeholder="Việt Nam"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Địa chỉ</label>
                        <textarea
                            className={styles.textarea}
                            rows="2"
                            value={form.address}
                            onChange={setField('address')}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Ghi chú nội bộ (chỉ admin xem)</label>
                        <textarea
                            className={styles.textarea}
                            rows="3"
                            value={form.adminNote}
                            onChange={setField('adminNote')}
                            placeholder="VD: KH thân thiết, ưu tiên xếp ghế cửa sổ..."
                        />
                    </div>

                    <div className={styles.checkboxRow}>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={form.marketingOptIn}
                                onChange={setField('marketingOptIn')}
                            />
                            <span>Khách hàng đồng ý nhận email marketing / newsletter</span>
                        </label>
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            disabled={submitting}
                        >
                            <span className="material-icons-round" style={{ fontSize: '16px' }}>save</span>
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerModal;
