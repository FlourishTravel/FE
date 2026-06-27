import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminCatalogTicket,
  deleteAdminCatalogTicket,
  listAdminCatalogTickets,
  updateAdminCatalogTicket,
} from '../../../api/adminCatalog';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = { name: '', code: '', price: '', description: '', active: true };

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
      const data = await listAdminCatalogTickets({ q: searchQuery, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Khong tai duoc danh sach ve');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => i.active !== false).length,
    avgPrice: items.length ? Math.round(items.reduce((sum, i) => sum + Number(i.price || 0), 0) / items.length) : 0,
  }), [items]);

  const openCreate = () => {
    setEditing({ mode: 'create' });
    setFormData(EMPTY_FORM);
  };

  const openEdit = (row) => {
    setEditing({ mode: 'edit', row });
    setFormData({
      name: row.name || '',
      code: row.code || '',
      price: row.price ?? '',
      description: row.description || '',
      active: row.active !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim() || null,
      price: Number(formData.price || 0),
      description: formData.description.trim() || null,
      active: !!formData.active,
    };
    try {
      if (editing?.mode === 'edit' && editing?.row?.id) {
        await updateAdminCatalogTicket(editing.row.id, payload);
        setSuccessMsg('Da cap nhat ve du lich');
      } else {
        await createAdminCatalogTicket(payload);
        setSuccessMsg('Da tao ve du lich moi');
      }
      setEditing(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the luu ve');
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Xoa ve "${row.name}"?`);
    if (!ok) return;
    try {
      await deleteAdminCatalogTicket(row.id);
      setSuccessMsg('Da xoa ve du lich');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the xoa ve');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Loai ve',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.name}</div>
          <div className={styles.subText}>{row.code || 'Chua gan ma'}</div>
        </div>
      ),
    },
    { key: 'price', label: 'Gia (VND)', render: (v) => Number(v || 0).toLocaleString('vi-VN') },
    {
      key: 'active',
      label: 'Trang thai',
      render: (v) => <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>{v ? 'Dang ban' : 'Ngung ban'}</span>,
    },
    { key: 'description', label: 'Mo ta', render: (v) => v || '—' },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openEdit(row)}><span className="material-icons-round" style={{ fontSize: 18 }}>edit</span></button>
          <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => handleDelete(row)}><span className="material-icons-round" style={{ fontSize: 18 }}>delete</span></button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quan Ly Ve Du Lich</h1>
          <p className={styles.pageSubtitle}>CRUD danh muc ve/co goi gia de su dung tren he thong dat tour</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tai lai</button>
          <button className={styles.addBtn} onClick={openCreate}>Them ve</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="confirmation_number" label="Tong loai ve" value={String(stats.total)} color="blue" />
        <StatCard icon="storefront" label="Dang ban" value={String(stats.active)} color="green" />
        <StatCard icon="payments" label="Gia TB" value={stats.avgPrice.toLocaleString('vi-VN')} color="orange" />
      </div>

      {(errorMsg || successMsg) && (
        <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
          <span className="material-icons-round">{errorMsg ? 'error_outline' : 'check_circle'}</span>
          <span>{errorMsg || successMsg}</span>
          <button className={styles.bannerClose} onClick={() => { setErrorMsg(''); setSuccessMsg(''); }} type="button"><span className="material-icons-round">close</span></button>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input className={styles.filterInput} placeholder="Tim theo ten ve..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <DataTable columns={columns} data={items} totalLabel="ve" emptyMessage={loading ? 'Dang tai...' : 'Chua co du lieu ve'} />

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing.mode === 'edit' ? 'Chinh sua ve' : 'Them ve moi'}</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setEditing(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ten ve</label>
                    <input className={styles.formInput} value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ma ve</label>
                    <input className={styles.formInput} value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gia</label>
                    <input type="number" className={styles.formInput} value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trang thai</label>
                    <select className={styles.formSelect} value={formData.active ? 'true' : 'false'} onChange={(e) => setFormData((p) => ({ ...p, active: e.target.value === 'true' }))}>
                      <option value="true">Dang ban</option>
                      <option value="false">Ngung ban</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mo ta</label>
                  <textarea className={styles.formTextarea} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)}>Huy</button>
                <button type="submit" className={styles.submitBtn}>Luu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogTicketManagement;
