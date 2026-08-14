import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateTourModal.module.css';
import { listCategories } from '../../../api/categories';
import { createTour } from '../../../api/tours';
import AdminImageListField from './AdminImageListField';
import AdminVideoListField from './AdminVideoListField';

const EMPTY_DEPARTURE = { startDate: '', maxParticipants: '20' };

const EMPTY_FORM = {
    title: '',
    slug: '',
    description: '',
    basePrice: '',
    durationDays: '',
    durationNights: '',
    categoryId: '',
    thumbnailUrl: '',
    imageUrls: [],
    videos: [],
    departures: [{ ...EMPTY_DEPARTURE }],
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

    useEffect(() => {
        if (!isOpen) return;
        setFormData({ ...EMPTY_FORM, departures: [{ ...EMPTY_DEPARTURE }] });
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
            const imageUrls = (formData.imageUrls || [])
                .map((u) => String(u || '').trim())
                .filter(Boolean);
            const videos = (formData.videos || [])
                .filter((v) => v?.videoUrl?.trim())
                .map((v) => ({
                    videoUrl: v.videoUrl.trim(),
                    title: v.title?.trim() || null,
                    thumbnailUrl: v.thumbnailUrl?.trim() || null,
                    durationSeconds:
                        v.durationSeconds === '' || v.durationSeconds == null
                            ? null
                            : Number(v.durationSeconds),
                }));

            const departures = (formData.departures || [])
                .map((row) => ({
                    startDate: String(row.startDate || '').trim(),
                    maxParticipants: Number(row.maxParticipants),
                }))
                .filter((row) => row.startDate);

            if (!departures.length) {
                setErrorMsg('Cần ít nhất một đợt khởi hành.');
                setSubmitting(false);
                return;
            }

            const startDates = new Set();
            for (const row of departures) {
                if (startDates.has(row.startDate)) {
                    setErrorMsg(`Trùng ngày khởi hành: ${row.startDate}`);
                    setSubmitting(false);
                    return;
                }
                startDates.add(row.startDate);
            }

            const sessions = departures.map((row) => ({
                startDate: row.startDate,
                maxParticipants:
                    Number.isFinite(row.maxParticipants) && row.maxParticipants > 0
                        ? row.maxParticipants
                        : 20,
            }));

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
                thumbnailUrl: imageUrls[0] || formData.thumbnailUrl.trim() || null,
                imageUrls: imageUrls.length ? imageUrls : null,
                videos: videos.length ? videos : null,
                marketSegment: formData.marketSegment || null,
                destinationCity: formData.destinationCity.trim() || null,
                sessions,
            };
            const created = await createTour(payload);

            if (onCreated) onCreated(created);
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
                            <div className={styles.departureHeader}>
                                <label>Đợt khởi hành *</label>
                                <button
                                    type="button"
                                    className={styles.addDepartureBtn}
                                    onClick={() =>
                                        setFormData((prev) => {
                                            const last = prev.departures[prev.departures.length - 1];
                                            return {
                                                ...prev,
                                                departures: [
                                                    ...prev.departures,
                                                    {
                                                        startDate: '',
                                                        maxParticipants: last?.maxParticipants || '20',
                                                    },
                                                ],
                                            };
                                        })
                                    }
                                >
                                    <span className="material-icons-round">add</span>
                                    Thêm đợt
                                </button>
                            </div>
                            {(formData.departures || []).map((row, index) => (
                                <div key={`dep-${index}`} className={styles.departureRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor={`tour-departure-${index}`}>Ngày khởi hành</label>
                                        <input
                                            type="date"
                                            id={`tour-departure-${index}`}
                                            required
                                            value={row.startDate}
                                            onChange={(e) =>
                                                setFormData((prev) => {
                                                    const next = prev.departures.map((item, i) =>
                                                        i === index
                                                            ? { ...item, startDate: e.target.value }
                                                            : item
                                                    );
                                                    return { ...prev, departures: next };
                                                })
                                            }
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor={`tour-max-pax-${index}`}>Số khách tối đa</label>
                                        <input
                                            type="number"
                                            id={`tour-max-pax-${index}`}
                                            placeholder="VD: 20"
                                            value={row.maxParticipants}
                                            onChange={(e) =>
                                                setFormData((prev) => {
                                                    const next = prev.departures.map((item, i) =>
                                                        i === index
                                                            ? { ...item, maxParticipants: e.target.value }
                                                            : item
                                                    );
                                                    return { ...prev, departures: next };
                                                })
                                            }
                                            min="1"
                                            max="999"
                                        />
                                    </div>
                                    {formData.departures.length > 1 ? (
                                        <button
                                            type="button"
                                            className={styles.removeDepartureBtn}
                                            title="Xoá đợt này"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    departures: prev.departures.filter((_, i) => i !== index),
                                                }))
                                            }
                                        >
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    ) : (
                                        <span className={styles.removeDepartureSpacer} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.formGroup}>
                            <AdminImageListField
                                label="Ảnh tour (gallery)"
                                urls={formData.imageUrls}
                                onChange={(urls) =>
                                    setFormData((prev) => ({ ...prev, imageUrls: urls }))
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <AdminVideoListField
                                label="Video giới thiệu"
                                videos={formData.videos}
                                onChange={(videos) =>
                                    setFormData((prev) => ({ ...prev, videos }))
                                }
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
                                    Chọn ít nhất một ngày khởi hành. Có thể thêm nhiều đợt ngay lúc tạo tour;
                                    ngày kết thúc được tính từ số ngày của tour. Lịch trình chi tiết bổ sung sau.
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
