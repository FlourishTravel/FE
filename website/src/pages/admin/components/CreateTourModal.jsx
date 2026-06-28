import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateTourModal.module.css';
import { listCategories } from '../../../api/categories';
import { createAdminSession, createTour } from '../../../api/tours';
import AdminImageField from './AdminImageField';

const EMPTY_FORM = {
    title: '',
    slug: '',
    description: '',
    basePrice: '',
    durationDays: '',
    durationNights: '',
    categoryId: '',
    thumbnailUrl: '',
    departureDate: '',
    marketSegment: '',
    destinationCity: '',
};

const MARKET_SEGMENTS = [
    { value: '', label: '— Không gắn —' },
    { value: 'domestic', label: 'Trong nước' },
    { value: 'international', label: 'Quốc tế' },
    { value: 'school', label: 'Trường học' },
    { value: 'corporate', label: 'Doanh nghiệp' },
];

const CreateTourModal = ({ isOpen, onClose, onCreated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const addDays = (isoDate, daysToAdd) => {
        const d = new Date(`${isoDate}T00:00:00`);
        if (Number.isNaN(d.getTime())) return isoDate;
        d.setDate(d.getDate() + daysToAdd);
        return d.toISOString().slice(0, 10);
    };

    useEffect(() => {
        if (!isOpen) return;
        setFormData(EMPTY_FORM);
        setErrorMsg('');
        setSubmitting(false);
        listCategories()
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));
    }, [isOpen]);

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
                title: formData.title.trim(),
                slug: formData.slug.trim() || null,
                description: formData.description.trim() || null,
                basePrice:
                    formData.basePrice === '' ? null : Number(formData.basePrice),
                durationDays:
                    formData.durationDays === '' ? null : Number(formData.durationDays),
                durationNights:
                    formData.durationNights === '' ? null : Number(formData.durationNights),
                categoryId: formData.categoryId || null,
                thumbnailUrl: formData.thumbnailUrl.trim() || null,
                marketSegment: formData.marketSegment || null,
                destinationCity: formData.destinationCity.trim() || null,
            };
            const created = await createTour(payload);

            let departureWarning = '';
            if (formData.departureDate && created?.id) {
                const tripDays = Number(formData.durationDays);
                const endDate = addDays(
                    formData.departureDate,
                    Number.isFinite(tripDays) && tripDays > 1 ? tripDays - 1 : 0
                );
                try {
                    await createAdminSession({
                        tourId: created.id,
                        startDate: formData.departureDate,
                        endDate,
                    });
                } catch (sessionErr) {
                    departureWarning = sessionErr?.message || 'Tạo lịch khởi hành đầu tiên thất bại';
                }
            }

            if (onCreated) onCreated(created, departureWarning);
            onClose();
            if (created?.id) {
                navigate(`/admin/tours/itinerary/${created.id}`);
            }
        } catch (err) {
            setErrorMsg(err?.message || 'Không tạo được tour. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Khởi tạo Tour Mới</h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng" type="button">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="tour-title">Tên Tour *</label>
                            <input
                                type="text"
                                id="tour-title"
                                name="title"
                                placeholder="VD: Khám phá Thái Lan 5N4Đ"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={255}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-slug">Slug</label>
                                <input
                                    type="text"
                                    id="tour-slug"
                                    name="slug"
                                    placeholder="tu-dong-sinh-neu-de-trong"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    pattern="^$|^[a-z0-9]+(?:-[a-z0-9]+)*$"
                                    title="Chỉ chữ thường, số và dấu '-'"
                                    maxLength={255}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-category">Danh mục</label>
                                <select
                                    id="tour-category"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                >
                                    <option value="">— Không gắn —</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-segment">Phân khúc</label>
                                <select
                                    id="tour-segment"
                                    name="marketSegment"
                                    value={formData.marketSegment}
                                    onChange={handleChange}
                                >
                                    {MARKET_SEGMENTS.map((s) => (
                                        <option key={s.value || 'none'} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-dest-city">Thành phố đích</label>
                                <input
                                    type="text"
                                    id="tour-dest-city"
                                    name="destinationCity"
                                    placeholder="VD: Bangkok, Đà Nẵng"
                                    value={formData.destinationCity}
                                    onChange={handleChange}
                                    maxLength={80}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-days">Số ngày</label>
                                <input
                                    type="number"
                                    id="tour-days"
                                    name="durationDays"
                                    placeholder="VD: 5"
                                    value={formData.durationDays}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="tour-nights">Số đêm</label>
                                <input
                                    type="number"
                                    id="tour-nights"
                                    name="durationNights"
                                    placeholder="VD: 4"
                                    value={formData.durationNights}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="tour-price">Giá cơ bản (VNĐ)</label>
                            <input
                                type="number"
                                id="tour-price"
                                name="basePrice"
                                placeholder="VD: 6990000"
                                value={formData.basePrice}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="tour-departure-date">Ngày khởi hành đầu tiên</label>
                            <input
                                type="date"
                                id="tour-departure-date"
                                name="departureDate"
                                value={formData.departureDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <AdminImageField
                                label="Hình ảnh thu nhỏ"
                                value={formData.thumbnailUrl}
                                onChange={(v) =>
                                    setFormData((prev) => ({ ...prev, thumbnailUrl: v }))
                                }
                                placeholder="https://... hoặc tải ảnh lên"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="tour-description">Mô tả</label>
                            <textarea
                                id="tour-description"
                                name="description"
                                rows={3}
                                placeholder="Mô tả ngắn về tour"
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

                        {errorMsg ? (
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
                        ) : (
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mt-4 flex items-start gap-2">
                                <span className="material-icons-round text-blue-500">info</span>
                                <p>
                                    Bạn có thể bổ sung lịch trình chi tiết và hình ảnh sau khi khởi tạo tour
                                    thành công.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Đang tạo...' : 'Tạo & Tiếp tục'}
                            {!submitting && (
                                <span className="material-icons-round">arrow_forward</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTourModal;
