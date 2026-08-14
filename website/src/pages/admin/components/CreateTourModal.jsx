import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateTourModal.module.css';
import { listCategories } from '../../../api/categories';
import { createTour, getAdminTourDetail, updateTour } from '../../../api/tours';
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

function tourToForm(detail) {
    const imageUrls = (detail?.images || []).map((img) => img?.imageUrl).filter(Boolean);
    const videos = (detail?.videos || []).map((v) => ({
        videoUrl: v?.videoUrl || '',
        title: v?.title || '',
        thumbnailUrl: v?.thumbnailUrl || '',
        durationSeconds: v?.durationSeconds ?? '',
    }));
    return {
        title: detail?.title || '',
        slug: detail?.slug || '',
        description: detail?.description || '',
        basePrice: detail?.basePrice ?? '',
        durationDays: detail?.durationDays ?? '',
        durationNights: detail?.durationNights ?? '',
        categoryId: detail?.category?.id || '',
        thumbnailUrl: detail?.thumbnailUrl || '',
        imageUrls,
        videos,
        departures: [{ ...EMPTY_DEPARTURE }],
        marketSegment: detail?.marketSegment || '',
        destinationCity: detail?.destinationCity || '',
    };
}

const CreateTourModal = ({ isOpen, onClose, onCreated, onUpdated, tourId }) => {
    const navigate = useNavigate();
    const isEdit = Boolean(tourId);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setErrorMsg('');
        setSubmitting(false);
        listCategories()
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]));

        if (!tourId) {
            setFormData({ ...EMPTY_FORM, departures: [{ ...EMPTY_DEPARTURE }] });
            setLoadingDetail(false);
            return undefined;
        }

        let cancelled = false;
        setLoadingDetail(true);
        getAdminTourDetail(tourId)
            .then((detail) => {
                if (!cancelled) setFormData(tourToForm(detail));
            })
            .catch((err) => {
                if (!cancelled) {
                    setFormData({ ...EMPTY_FORM, departures: [{ ...EMPTY_DEPARTURE }] });
                    setErrorMsg(err?.message || 'Không tải được thông tin tour để chỉnh sửa.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoadingDetail(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isOpen, tourId]);

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
                imageUrls,
                videos,
                marketSegment: formData.marketSegment || null,
                destinationCity: formData.destinationCity.trim() || null,
            };

            if (isEdit) {
                const updated = await updateTour(tourId, payload);
                if (onUpdated) onUpdated(updated);
                onClose();
                return;
            }

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

            payload.sessions = departures.map((row) => ({
                startDate: row.startDate,
                maxParticipants:
                    Number.isFinite(row.maxParticipants) && row.maxParticipants > 0
                        ? row.maxParticipants
                        : 20,
            }));
            const created = await createTour(payload);

            if (onCreated) onCreated(created);
            onClose();
            if (created?.id) {
                navigate(`/admin/tours/itinerary/${created.id}`);
            }
        } catch (err) {
            setErrorMsg(
                err?.message ||
                    (isEdit
                        ? 'Không lưu được tour. Vui lòng thử lại.'
                        : 'Không tạo được tour. Vui lòng thử lại.')
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEdit ? 'Chỉnh sửa Tour' : 'Khởi tạo Tour Mới'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng" type="button">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        {loadingDetail ? (
                            <p style={{ color: '#6b7280', margin: '8px 0 16px' }}>
                                Đang tải thông tin tour...
                            </p>
                        ) : null}
                        <fieldset disabled={loadingDetail} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
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

                        {!isEdit ? (
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
                        ) : (
                            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>
                                Đợt khởi hành chỉnh trong chi tiết tour hoặc trang lịch trình.
                            </p>
                        )}

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
                                    {isEdit
                                        ? 'Lưu để cập nhật tên, giá, mô tả, ảnh. Đợt khởi hành và lịch trình chỉnh riêng.'
                                        : 'Chọn ít nhất một ngày khởi hành. Có thể thêm nhiều đợt ngay lúc tạo tour; ngày kết thúc được tính từ số ngày của tour. Lịch trình chi tiết bổ sung sau.'}
                                </p>
                            </div>
                        )}
                        </fieldset>
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
                        {isEdit && tourId ? (
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                disabled={submitting || loadingDetail}
                                onClick={() => {
                                    onClose();
                                    navigate(`/admin/tours/itinerary/${tourId}`);
                                }}
                            >
                                Lịch trình
                            </button>
                        ) : null}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting || loadingDetail}
                        >
                            {submitting
                                ? isEdit
                                    ? 'Đang lưu...'
                                    : 'Đang tạo...'
                                : isEdit
                                  ? 'Lưu thay đổi'
                                  : 'Tạo & Tiếp tục'}
                            {!submitting && (
                                <span className="material-icons-round">
                                    {isEdit ? 'save' : 'arrow_forward'}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTourModal;
