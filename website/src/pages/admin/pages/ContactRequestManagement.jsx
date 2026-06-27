import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { listAdminContactRequests, updateAdminContactRequest } from '../../../api/adminContactRequests';
import styles from './PromotionManagement.module.css';

const ContactRequestManagement = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('IN_PROGRESS');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminContactRequests({ q: searchQuery, status: statusFilter, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the tai lien he');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === 'PENDING').length,
    done: items.filter((i) => i.status === 'DONE').length,
  }), [items]);

  const openUpdate = (row) => {
    setEditingRow(row);
    setStatus(row.status || 'IN_PROGRESS');
    setNote(row.note || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRow?.id) return;
    try {
      await updateAdminContactRequest(editingRow.id, { status, note });
      setSuccessMsg('Da cap nhat yeu cau lien he');
      setEditingRow(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the cap nhat yeu cau');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nguoi gui',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.name || row.fullName || 'Khach'}</div>
          <div className={styles.subText}>{row.email || 'Khong co email'}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Loai',
      render: (v) => (
        <span className={`${styles.statusBadge} ${v === 'NEWSLETTER' ? styles.badgeNeutral : styles.badgeWarning}`}>
          {v === 'NEWSLETTER' ? 'Newsletter' : 'Lien he'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trang thai',
      render: (v) => {
        const cls = v === 'DONE' ? styles.badgeSuccess : v === 'PENDING' ? styles.badgeWarning : styles.badgeNeutral;
        return <span className={`${styles.statusBadge} ${cls}`}>{v || 'MOI'}</span>;
      },
    },
    { key: 'note', label: 'Ghi chu', render: (v) => v || '—' },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openUpdate(row)} title="Cap nhat">
            <span className="material-icons-round" style={{ fontSize: 18 }}>edit_note</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Quan Ly Lien He</h1>
          <p className={styles.pageSubtitle}>Theo doi yeu cau lien he va dang ky nhan ban tin</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tai lai</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="mark_email_read" label="Tong yeu cau" value={String(stats.total)} color="blue" />
        <StatCard icon="schedule" label="Cho xu ly" value={String(stats.pending)} color="orange" />
        <StatCard icon="task_alt" label="Da hoan tat" value={String(stats.done)} color="green" />
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
          {['all', 'PENDING', 'IN_PROGRESS', 'DONE'].map((s) => (
            <button key={s} className={`${styles.filterTab} ${statusFilter === s ? styles.filterTabActive : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'Tat ca' : s}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input className={styles.filterInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tim theo ten, email..." />
        </div>
      </div>

      <DataTable columns={columns} data={items} totalLabel="yeu cau" emptyMessage={loading ? 'Dang tai...' : 'Chua co yeu cau nao'} />

      {editingRow && (
        <div className={styles.modalOverlay} onClick={() => setEditingRow(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cap nhat yeu cau</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setEditingRow(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trang thai</label>
                  <select className={styles.formSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chu noi bo</label>
                  <textarea className={styles.formTextarea} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingRow(null)}>Huy</button>
                <button type="submit" className={styles.submitBtn}>Luu cap nhat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequestManagement;
