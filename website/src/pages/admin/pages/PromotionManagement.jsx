import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminPromotion,
  listAdminPromotions,
  toggleAdminPromotionActive,
  updateAdminPromotion,
} from '../../../api/adminPromotions';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  code: '',
  title: '',
  description: '',
  discountPercent: '',
  maxDiscountAmount: '',
  startAt: '',
  endAt: '',
  active: true,
};

const PromotionManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminPromotions({ size: 100 });
      let rows = Array.isArray(data?.content) ? data.content : [];
      if (activeFilter === 'true') {
        rows = rows.filter((i) => i.active !== false);
      } else if (activeFilter === 'false') {
        rows = rows.filter((i) => i.active === false);
      }
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        rows = rows.filter((i) =>
          (i.title || i.name || '').toLowerCase().includes(q)
          || (i.code || '').toLowerCase().includes(q));
      }
      setItems(rows);
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the tai danh sach khuyen mai');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const startAt = item.validFrom ?? item.startAt;
    const endAt = item.validTo ?? item.endAt;
    setFormData({
      code: item.code || '',
      title: item.name || item.title || '',
      description: item.description || '',
      discountPercent: item.discountPercent ?? item.discountValue ?? '',
      maxDiscountAmount: item.maxDiscountAmount ?? '',
      startAt: startAt ? String(startAt).slice(0, 16) : '',
      endAt: endAt ? String(endAt).slice(0, 16) : '',
      active: item.isActive !== false && item.active !== false,
    });
    setModalOpen(true);
  };

  const toInstant = (value) => (value ? new Date(value).toISOString() : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.title.trim(),
        discountType: 'percent',
        discountValue: Number(formData.discountPercent || 0),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        validFrom: toInstant(formData.startAt) || new Date().toISOString(),
        validTo: toInstant(formData.endAt) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: !!formData.active,
      };
      if (editingItem?.id) {
        await updateAdminPromotion(editingItem.id, payload);
        setSuccessMsg('Da cap nhat chuong trinh khuyen mai');
      } else {
        await createAdminPromotion(payload);
        setSuccessMsg('Da tao chuong trinh khuyen mai moi');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the luu khuyen mai');
    }
  };

  const handleToggle = async (row) => {
    const isActive = row.isActive !== false && row.active !== false;
    try {
      await toggleAdminPromotionActive(row.id, !isActive);
      setSuccessMsg(isActive ? 'Da tam dung khuyen mai' : 'Da kich hoat khuyen mai');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the cap nhat trang thai');
    }
  };

  const stats = useMemo(() => {
    const active = items.filter((i) => i.isActive !== false && i.active !== false).length;
    const upcoming = items.filter((i) => {
      const start = i.validFrom ?? i.startAt;
      return start && new Date(start).getTime() > Date.now();
    }).length;
    return { total: items.length, active, upcoming };
  }, [items]);

  const columns = [
    {
      key: 'title',
      label: 'Khuyen mai',
      render: (_, row) => (
        <div className={styles.nameCell}>
          <div className={styles.nameIcon}>
            <span className="material-icons-round">sell</span>
          </div>
          <div>
            <div className={styles.nameTitle}>{row.name || row.title || row.code}</div>
            <div className={styles.subText}>{row.code || 'Khong co ma'}</div>
          </div>
        </div>
      ),
    },
    { key: 'discountPercent', label: 'Giam (%)', render: (v) => `${v ?? 0}%` },
    { key: 'maxDiscountAmount', label: 'Tran giam', render: (v) => (v ? v.toLocaleString('vi-VN') : 'Khong gioi han') },
    {
      key: 'active',
      label: 'Trang thai',
      render: (v, row) => {
        const active = row.isActive !== false && row.active !== false;
        return (
        <span className={`${styles.statusBadge} ${active ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {active ? 'Dang hoat dong' : 'Tam dung'}
        </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openEdit(row)} title="Chinh sua">
            <span className="material-icons-round" style={{ fontSize: 18 }}>edit</span>
          </button>
          <button
            className={`${styles.actionBtn} ${(row.isActive !== false && row.active !== false) ? styles.actionDanger : styles.actionSuccess}`}
            onClick={() => handleToggle(row)}
            title={(row.isActive !== false && row.active !== false) ? 'Tam dung' : 'Kich hoat'}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {(row.isActive !== false && row.active !== false) ? 'toggle_off' : 'toggle_on'}
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quan Ly Khuyen Mai</h1>
          <p className={styles.pageSubtitle}>Quan ly ma giam gia, ngay hieu luc va trang thai su dung</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tai lai</button>
          <button className={styles.addBtn} onClick={openCreate}>Them khuyen mai</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="sell" label="Tong chuong trinh" value={String(stats.total)} color="green" />
        <StatCard icon="bolt" label="Dang hoat dong" value={String(stats.active)} color="blue" />
        <StatCard icon="schedule" label="Sap dien ra" value={String(stats.upcoming)} color="orange" />
      </div>

      {(errorMsg || successMsg) && (
        <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
          <span className="material-icons-round">{errorMsg ? 'error_outline' : 'check_circle'}</span>
          <span>{errorMsg || successMsg}</span>
          <button className={styles.bannerClose} onClick={() => { setErrorMsg(''); setSuccessMsg(''); }} type="button">
            <span className="material-icons-round" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {[
            { key: 'all', label: 'Tat ca' },
            { key: 'true', label: 'Dang bat' },
            { key: 'false', label: 'Tam dung' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            className={styles.filterInput}
            placeholder="Tim theo ten, ma khuyen mai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        totalLabel="khuyen mai"
        emptyMessage={loading ? 'Dang tai...' : 'Chua co khuyen mai nao'}
      />

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? 'Chinh sua khuyen mai' : 'Tao khuyen mai moi'}</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setModalOpen(false)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ma khuyen mai</label>
                    <input className={styles.formInput} value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tieu de</label>
                    <input className={styles.formInput} value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mo ta</label>
                  <textarea className={styles.formTextarea} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phan tram giam</label>
                    <input type="number" min="0" max="100" className={styles.formInput} value={formData.discountPercent} onChange={(e) => setFormData((p) => ({ ...p, discountPercent: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tran giam (VND)</label>
                    <input type="number" min="0" className={styles.formInput} value={formData.maxDiscountAmount} onChange={(e) => setFormData((p) => ({ ...p, maxDiscountAmount: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bat dau</label>
                    <input type="datetime-local" className={styles.formInput} value={formData.startAt} onChange={(e) => setFormData((p) => ({ ...p, startAt: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ket thuc</label>
                    <input type="datetime-local" className={styles.formInput} value={formData.endAt} onChange={(e) => setFormData((p) => ({ ...p, endAt: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Huy</button>
                <button type="submit" className={styles.submitBtn}>{editingItem ? 'Luu thay doi' : 'Tao khuyen mai'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
