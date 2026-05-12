import React, { useEffect, useState } from 'react';
import styles from './CreateTourModal.module.css';

const EMPTY_FORM = {
    name: '',
    slug: '',
    description: '',
    sortOrder: '',
};

const CategoryFormModal = ({ isOpen, mode = 'create', initialData = null, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (mode === 'edit' && initialData) {
            setFormData({
                name: initialData.name ?? '',
                slug: initialData.slug ?? '',
                description: initialData.description ?? '',
                sortOrder: initialData.sortOrder ?? initialData.sort_order ?? '',
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setErrorMsg('');
        setSubmitting(false);
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                slug: formData.slug.trim() || null,
                description: formData.description.trim() || null,
                sortOrder:
                    formData.sortOrder === '' || formData.sortOrder === null
                        ? null
                        : Number(formData.sortOrder),
            };
            await onSubmit(payload);
        } catch (err) {
            setErrorMsg(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const title = mode === 'edit' ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng" type="button">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="cat-name">Tên danh mục *</label>
                            <input
                                type="text"
                                id="cat-name"
                                name="name"
                                placeholder="VD: Tour biển"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="cat-slug">Slug</label>
                                <input
                                    type="text"
                                    id="cat-slug"
                                    name="slug"
                                    placeholder="tour-bien (tự sinh nếu để trống)"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    pattern="^$|^[a-z0-9]+(?:-[a-z0-9]+)*$"
                                    title="Chỉ chữ thường, số và dấu '-'"
                                    maxLength={100}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="cat-sortOrder">Thứ tự</label>
                                <input
                                    type="number"
                                    id="cat-sortOrder"
                                    name="sortOrder"
                                    placeholder="VD: 1"
                                    value={formData.sortOrder}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cat-description">Mô tả</label>
                            <textarea
                                id="cat-description"
                                name="description"
                                rows={3}
                                placeholder="Mô tả ngắn về danh mục"
                                value={formData.description}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 6,
                                    fontSize: '0.95rem',
                                    color: '#111827',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {errorMsg && (
                            <div
                                style={{
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <span className="material-icons-round" style={{ fontSize: 18 }}>
                                    error_outline
                                </span>
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
                            Hủy
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Đang lưu...' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo danh mục'}
                            {!submitting && (
                                <span className="material-icons-round">
                                    {mode === 'edit' ? 'check' : 'add'}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
