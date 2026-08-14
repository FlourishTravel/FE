import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { listAdminContactRequests, updateAdminContactRequest } from '../../../api/adminContactRequests';
import styles from './PromotionManagement.module.css';

const STATUS_LABELS = {
  all: 'Tất cả',
  new: 'Mới',
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang xử lý',
  DONE: 'Hoàn tất',
  REJECTED: 'Từ chối',
};

const FILTER_STATUSES = ['all', 'new', 'PENDING', 'IN_PROGRESS', 'DONE'];

function statusLabel(value) {
  return STATUS_LABELS[value] || value || 'Mới';
}

function statusClass(value) {
  if (value === 'DONE') return styles.badgeSuccess;
  if (value === 'PENDING' || value === 'new') return styles.badgeWarning;
  if (value === 'REJECTED') return styles.badgeError || styles.badgeNeutral;
  return styles.badgeNeutral;
}

function isNewsletter(row) {
  return row?.type === 'NEWSLETTER' || row?.name === 'Newsletter';
}

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
      const data = await listAdminContactRequests({ status: statusFilter, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách liên hệ.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => {
      const hay = `${row.name || ''} ${row.fullName || ''} ${row.email || ''} ${row.phone || ''} ${row.message || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchQuery]);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === 'PENDING' || i.status === 'new').length,
    done: items.filter((i) => i.status === 'DONE').length,
  }), [items]);

  const openUpdate = (row) => {
    setEditingRow(row);
    setStatus(row.status === 'new' ? 'PENDING' : (row.status || 'IN_PROGRESS'));
    setNote(row.note || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRow?.id) return;
    try {
      await updateAdminContactRequest(editingRow.id, { status, note });
      setSuccessMsg('Đã cập nhật yêu cầu liên hệ.');
      setEditingRow(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không cập nhật được yêu cầu.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Người gửi',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.name || row.fullName || 'Khách'}</div>
          <div className={styles.subText}>{row.email || 'Không có email'}</div>
          {row.phone ? <div className={styles.subText}>{row.phone}</div> : null}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Loại',
      render: (_, row) => (
        <span className={`${styles.statusBadge} ${isNewsletter(row) ? styles.badgeNeutral : styles.badgeWarning}`}>
          {isNewsletter(row) ? 'Đăng ký nhận tin' : 'Liên hệ'}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Nội dung',
      render: (v) => v || '—',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (v) => (
        <span className={`${styles.statusBadge} ${statusClass(v)}`}>
          {statusLabel(v)}
        </span>
      ),
    },
    { key: 'note', label: 'Ghi chú', render: (v) => v || '—' },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openUpdate(row)} title="Cập nhật">
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
          <h1 className={styles.pageTitle}>Quản lý liên hệ</h1>
          <p className={styles.pageSubtitle}>Theo dõi yêu cầu liên hệ và đăng ký nhận bản tin từ website</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="mark_email_read" label="Tổng yêu cầu" value={String(stats.total)} color="blue" />
        <StatCard icon="schedule" label="Chờ xử lý" value={String(stats.pending)} color="orange" />
        <StatCard icon="task_alt" label="Đã hoàn tất" value={String(stats.done)} color="green" />
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
          {FILTER_STATUSES.map((s) => (
            <button
              key={s}
              className={`${styles.filterTab} ${statusFilter === s ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            className={styles.filterInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, nội dung..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        totalLabel="yêu cầu"
        emptyMessage={loading ? 'Đang tải...' : 'Chưa có yêu cầu nào'}
      />

      {editingRow && (
        <div className={styles.modalOverlay} onClick={() => setEditingRow(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cập nhật yêu cầu</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setEditingRow(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className={styles.modalBody}>
                <p className={styles.subText} style={{ marginBottom: 12 }}>
                  {editingRow.name || 'Khách'} · {editingRow.email || 'Không có email'}
                </p>
                {editingRow.message ? (
                  <p style={{ marginBottom: 16, color: '#374151', whiteSpace: 'pre-wrap' }}>{editingRow.message}</p>
                ) : null}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trạng thái</label>
                  <select className={styles.formSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="DONE">Hoàn tất</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú nội bộ</label>
                  <textarea
                    className={styles.formTextarea}
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Đã gọi điện, đã gửi email..."
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingRow(null)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>Lưu cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequestManagement;
