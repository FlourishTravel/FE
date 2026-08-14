import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import AdminImageField from '../components/AdminImageField';
import {
    createAdminDestination,
    deleteAdminDestination,
    listAdminDestinations,
    updateAdminDestination,
} from '../../../api/adminDestinations';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
    slug: '',
    name: '',
    summary: '',
    description: '',
    heroImageUrl: '',
    types: '',
    locationLabel: '',
    bestTimeLabel: '',
    idealDaysMin: '',
    idealDaysMax: '',
    avgCostMinMillion: '',
    avgCostMaxMillion: '',
    rating: '',
    sortOrder: '',
    featured: false,
    published: true,
};

function slugify(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const DestinationManagement = () => {
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const rows = await listAdminDestinations();
            setItems(Array.isArray(rows) ? rows : []);
        } catch (err) {
            setErrorMsg(err?.message || 'Không tải được điểm đến');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.trim().toLowerCase();
        return items.filter(
            (d) => (d.name || '').toLowerCase().includes(q) || (d.slug || '').toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    const stats = useMemo(() => ({
        total: items.length,
        published: items.filter((i) => i.published !== false).length,
        featured: items.filter((i) => i.featured).length,
    }), [items]);

    const openCreate = () => {
        setEditing({ mode: 'create' });
        setFormData(EMPTY_FORM);
    };

    const openEdit = (row) => {
        setEditing({ mode: 'edit', row });
        setFormData({
            slug: row.slug || '',
            name: row.name || '',
            summary: row.summary || '',
            description: row.description || '',
            heroImageUrl: row.heroImageUrl || '',
            types: Array.isArray(row.types) ? row.types.join(',') : (row.types || ''),
            locationLabel: row.locationLabel || '',
            bestTimeLabel: row.bestTimeLabel || '',
            idealDaysMin: row.idealDaysMin ?? '',
            idealDaysMax: row.idealDaysMax ?? '',
            avgCostMinMillion: row.avgCostMinMillion ?? '',
            avgCostMaxMillion: row.avgCostMaxMillion ?? '',
            rating: row.rating ?? '',
            sortOrder: row.sortOrder ?? '',
            featured: !!row.featured,
            published: row.published !== false,
        });
    };

    const buildPayload = () => ({
        slug: (formData.slug || slugify(formData.name)).trim(),
        name: formData.name.trim(),
        summary: formData.summary.trim() || null,
        description: formData.description.trim() || null,
        heroImageUrl: formData.heroImageUrl.trim() || null,
        types: formData.types.trim() || null,
        locationLabel: formData.locationLabel.trim() || null,
        bestTimeLabel: formData.bestTimeLabel.trim() || null,
        idealDaysMin: formData.idealDaysMin === '' ? null : Number(formData.idealDaysMin),
        idealDaysMax: formData.idealDaysMax === '' ? null : Number(formData.idealDaysMax),
        avgCostMinMillion: formData.avgCostMinMillion === '' ? null : Number(formData.avgCostMinMillion),
        avgCostMaxMillion: formData.avgCostMaxMillion === '' ? null : Number(formData.avgCostMaxMillion),
        rating: formData.rating === '' ? null : Number(formData.rating),
        sortOrder: formData.sortOrder === '' ? null : Number(formData.sortOrder),
        featured: !!formData.featured,
        published: !!formData.published,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = buildPayload();
        try {
            if (editing?.mode === 'edit' && editing?.row?.id) {
                await updateAdminDestination(editing.row.id, payload);
                setSuccessMsg('Đã cập nhật điểm đến');
            } else {
                await createAdminDestination(payload);
                setSuccessMsg('Đã tạo điểm đến mới');
            }
            setEditing(null);
            fetchData();
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể lưu điểm đến');
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Ẩn điểm đến "${row.name}"?`)) return;
        try {
            await deleteAdminDestination(row.id);
            setSuccessMsg('Đã ẩn điểm đến');
            fetchData();
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể xóa');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Điểm đến',
            render: (_, row) => (
                <div>
                    <div className={styles.nameTitle}>{row.name}</div>
                    <div className={styles.subText}>/{row.slug}</div>
                </div>
            ),
        },
        { key: 'locationLabel', label: 'Vị trí', render: (v) => v || '—' },
        {
            key: 'published',
            label: 'Trạng thái',
            render: (v, row) => (
                <span className={`${styles.statusBadge} ${v !== false ? styles.badgeSuccess : styles.badgeNeutral}`}>
                    {v !== false ? 'Công khai' : 'Ẩn'}
                    {row.featured ? ' · Nổi bật' : ''}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => openEdit(row)}>
                        <span className="material-icons-round" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    <button type="button" className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDelete(row)}>
                        <span className="material-icons-round" style={{ fontSize: 18 }}>delete</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản lý Điểm đến</h1>
                    <p className={styles.pageSubtitle}>CRUD điểm đến hiển thị trên trang Khám phá</p>
                </div>
                <div className={styles.headerActions}>
                    <button type="button" className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
                    <button type="button" className={styles.addBtn} onClick={openCreate}>Thêm điểm đến</button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="place" label="Tổng" value={String(stats.total)} color="blue" />
                <StatCard icon="public" label="Công khai" value={String(stats.published)} color="green" />
                <StatCard icon="star" label="Nổi bật" value={String(stats.featured)} color="orange" />
            </div>

            {(errorMsg || successMsg) && (
                <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
                    <span>{errorMsg || successMsg}</span>
                    <button type="button" className={styles.bannerClose} onClick={() => { setErrorMsg(''); setSuccessMsg(''); }}>
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
                    <input className={styles.filterInput} placeholder="Tìm theo tên, slug..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            <DataTable columns={columns} data={filtered} totalLabel="điểm đến" emptyMessage={loading ? 'Đang tải...' : 'Chưa có dữ liệu'} />

            {editing && (
                <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        <div className={styles.modalHeader}>
                            <h2>{editing.mode === 'edit' ? 'Sửa điểm đến' : 'Thêm điểm đến'}</h2>
                            <button type="button" className={styles.actionBtn} onClick={() => setEditing(null)}>
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Tên *</label>
                                        <input className={styles.formInput} value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Slug *</label>
                                        <input className={styles.formInput} value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} placeholder={slugify(formData.name) || 'bangkok'} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <AdminImageField label="Ảnh hero" value={formData.heroImageUrl} onChange={(v) => setFormData((p) => ({ ...p, heroImageUrl: v }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tóm tắt</label>
                                    <input className={styles.formInput} value={formData.summary} onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Mô tả</label>
                                    <textarea
                                        className={styles.formTextarea}
                                        rows={8}
                                        value={formData.description}
                                        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Loại (CSV)</label>
                                        <input className={styles.formInput} value={formData.types} onChange={(e) => setFormData((p) => ({ ...p, types: e.target.value }))} placeholder="beach,city" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Vị trí</label>
                                        <input className={styles.formInput} value={formData.locationLabel} onChange={(e) => setFormData((p) => ({ ...p, locationLabel: e.target.value }))} />
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Thời gian lý tưởng</label>
                                        <input className={styles.formInput} value={formData.bestTimeLabel} onChange={(e) => setFormData((p) => ({ ...p, bestTimeLabel: e.target.value }))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Số ngày (min–max)</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input type="number" className={styles.formInput} value={formData.idealDaysMin} onChange={(e) => setFormData((p) => ({ ...p, idealDaysMin: e.target.value }))} placeholder="Min" />
                                            <input type="number" className={styles.formInput} value={formData.idealDaysMax} onChange={(e) => setFormData((p) => ({ ...p, idealDaysMax: e.target.value }))} placeholder="Max" />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Công khai</label>
                                        <select className={styles.formSelect} value={formData.published ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, published: e.target.value === 'true' }))}>
                                            <option value="true">Có</option>
                                            <option value="false">Ẩn</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Nổi bật</label>
                                        <select className={styles.formSelect} value={formData.featured ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.value === 'true' }))}>
                                            <option value="false">Không</option>
                                            <option value="true">Có</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)}>Hủy</button>
                                <button type="submit" className={styles.submitBtn}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DestinationManagement;
