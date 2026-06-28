import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import AdminImageField from '../components/AdminImageField';
import {
  createAdminCatalogTicket,
  deleteAdminCatalogTicket,
  listAdminCatalogTickets,
  updateAdminCatalogTicket,
} from '../../../api/adminCatalog';
import styles from './PromotionManagement.module.css';

const CATEGORIES = [
  { value: 'attraction', label: 'Điểm tham quan' },
  { value: 'show', label: 'Show & vui chơi' },
  { value: 'transport', label: 'Di chuyển' },
  { value: 'combo', label: 'Combo' },
];

const EMPTY_FORM = {
  slug: '',
  name: '',
  category: 'attraction',
  destinationCity: '',
  description: '',
  shortDescription: '',
  imageUrl: '',
  priceVnd: '',
  priceLabel: '',
  rating: '',
  showTimeLabel: '',
  locationLabel: '',
  routeLabel: '',
  eTicket: true,
  featured: false,
  published: true,
  sortOrder: '',
};

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CatalogTicketManagement = () => {
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
      const data = await listAdminCatalogTickets({ size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách vé');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.trim().toLowerCase();
    return items.filter(
      (i) =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.slug || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.published !== false).length,
    avgPrice: items.length
      ? Math.round(items.reduce((sum, i) => sum + Number(i.priceVnd || 0), 0) / items.length)
      : 0,
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
      category: row.category || 'attraction',
      destinationCity: row.destinationCity || '',
      description: row.description || '',
      shortDescription: row.shortDescription || '',
      imageUrl: row.imageUrl || '',
      priceVnd: row.priceVnd ?? '',
      priceLabel: row.priceLabel || '',
      rating: row.rating ?? '',
      showTimeLabel: row.showTimeLabel || '',
      locationLabel: row.locationLabel || '',
      routeLabel: row.routeLabel || '',
      eTicket: row.eTicket !== false,
      featured: !!row.featured,
      published: row.published !== false,
      sortOrder: row.sortOrder ?? '',
    });
  };

  const buildPayload = () => ({
    slug: (formData.slug || slugify(formData.name)).trim(),
    name: formData.name.trim(),
    category: formData.category,
    destinationCity: formData.destinationCity.trim() || null,
    description: formData.description.trim() || null,
    shortDescription: formData.shortDescription.trim() || null,
    imageUrl: formData.imageUrl.trim() || null,
    priceVnd: formData.priceVnd === '' ? null : Number(formData.priceVnd),
    priceLabel: formData.priceLabel.trim() || null,
    rating: formData.rating === '' ? null : Number(formData.rating),
    showTimeLabel: formData.showTimeLabel.trim() || null,
    locationLabel: formData.locationLabel.trim() || null,
    routeLabel: formData.routeLabel.trim() || null,
    eTicket: !!formData.eTicket,
    featured: !!formData.featured,
    published: !!formData.published,
    sortOrder: formData.sortOrder === '' ? null : Number(formData.sortOrder),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload();
    try {
      if (editing?.mode === 'edit' && editing?.row?.id) {
        await updateAdminCatalogTicket(editing.row.id, payload);
        setSuccessMsg('Đã cập nhật vé');
      } else {
        await createAdminCatalogTicket(payload);
        setSuccessMsg('Đã tạo vé mới');
      }
      setEditing(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể lưu vé');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Ẩn vé "${row.name}"?`)) return;
    try {
      await deleteAdminCatalogTicket(row.id);
      setSuccessMsg('Đã ẩn vé');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xóa vé');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Vé',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.name}</div>
          <div className={styles.subText}>{row.slug} · {row.category}</div>
        </div>
      ),
    },
    {
      key: 'priceVnd',
      label: 'Giá (VND)',
      render: (v, row) => row.priceLabel || Number(v || 0).toLocaleString('vi-VN'),
    },
    {
      key: 'published',
      label: 'Trạng thái',
      render: (v) => (
        <span className={`${styles.statusBadge} ${v !== false ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {v !== false ? 'Đang bán' : 'Ẩn'}
        </span>
      ),
    },
    { key: 'destinationCity', label: 'Thành phố', render: (v) => v || '—' },
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
          <h1 className={styles.pageTitle}>Quản lý Vé du lịch</h1>
          <p className={styles.pageSubtitle}>Danh mục vé hiển thị tại trang Vé & Hoạt động</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
          <button type="button" className={styles.addBtn} onClick={openCreate}>Thêm vé</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="confirmation_number" label="Tổng vé" value={String(stats.total)} color="blue" />
        <StatCard icon="storefront" label="Đang bán" value={String(stats.published)} color="green" />
        <StatCard icon="payments" label="Giá TB" value={stats.avgPrice.toLocaleString('vi-VN')} color="orange" />
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

      <DataTable columns={columns} data={filtered} totalLabel="vé" emptyMessage={loading ? 'Đang tải...' : 'Chưa có dữ liệu'} />

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className={styles.modalHeader}>
              <h2>{editing.mode === 'edit' ? 'Sửa vé' : 'Thêm vé mới'}</h2>
              <button type="button" className={styles.actionBtn} onClick={() => setEditing(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên vé *</label>
                    <input className={styles.formInput} value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Slug</label>
                    <input className={styles.formInput} value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} placeholder={slugify(formData.name)} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Danh mục</label>
                    <select className={styles.formSelect} value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Thành phố</label>
                    <input className={styles.formInput} value={formData.destinationCity} onChange={(e) => setFormData((p) => ({ ...p, destinationCity: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giá VND</label>
                    <input type="number" className={styles.formInput} value={formData.priceVnd} onChange={(e) => setFormData((p) => ({ ...p, priceVnd: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nhãn giá (hiển thị)</label>
                    <input className={styles.formInput} value={formData.priceLabel} onChange={(e) => setFormData((p) => ({ ...p, priceLabel: e.target.value }))} placeholder="Từ 350.000₫" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <AdminImageField label="Ảnh" value={formData.imageUrl} onChange={(v) => setFormData((p) => ({ ...p, imageUrl: v }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả ngắn</label>
                  <input className={styles.formInput} value={formData.shortDescription} onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả</label>
                  <textarea className={styles.formTextarea} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Địa điểm</label>
                    <input className={styles.formInput} value={formData.locationLabel} onChange={(e) => setFormData((p) => ({ ...p, locationLabel: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lộ trình</label>
                    <input className={styles.formInput} value={formData.routeLabel} onChange={(e) => setFormData((p) => ({ ...p, routeLabel: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Công khai</label>
                    <select className={styles.formSelect} value={formData.published ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, published: e.target.value === 'true' }))}>
                      <option value="true">Đang bán</option>
                      <option value="false">Ẩn</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vé điện tử</label>
                    <select className={styles.formSelect} value={formData.eTicket ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, eTicket: e.target.value === 'true' }))}>
                      <option value="true">Có</option>
                      <option value="false">Không</option>
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

export default CatalogTicketManagement;
