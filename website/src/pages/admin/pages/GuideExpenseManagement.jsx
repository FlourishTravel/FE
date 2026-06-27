import React, { useCallback, useEffect, useState } from 'react';
import styles from './GuideExpenseManagement.module.css';
import { listGuideExpensesAdmin, updateGuideExpenseStatus } from '../../../api/adminGuideExpenses';

const STATUS_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'rejected', label: 'Từ chối' },
];

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

function formatVnd(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function formatDate(v) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleDateString('vi-VN');
  } catch {
    return v;
  }
}

const GuideExpenseManagement = () => {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listGuideExpensesAdmin(status);
      setRows(list);
    } catch (e) {
      setError(e.message || 'Không tải được danh sách.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id, nextStatus) => {
    const note = nextStatus === 'rejected'
      ? window.prompt('Lý do từ chối (tuỳ chọn):') || ''
      : '';
    setBusyId(id);
    try {
      await updateGuideExpenseStatus(id, { status: nextStatus, adminNote: note || undefined });
      await load();
    } catch (e) {
      window.alert(e.message || 'Cập nhật thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chi phí HDV</h1>
          <p className={styles.subtitle}>Duyệt chi phí tour do hướng dẫn viên gửi từ portal.</p>
        </div>
        <div className={styles.filters}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={status === opt.id ? styles.filterActive : styles.filterBtn}
              onClick={() => setStatus(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.muted}>Đang tải...</p>}

      {!loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tour</th>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>Không có bản ghi</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.tourTitle || '—'}</strong>
                    {row.tourCode && <div className={styles.mutedSmall}>{row.tourCode}</div>}
                  </td>
                  <td>{formatDate(row.expenseDate)}</td>
                  <td>{row.category}</td>
                  <td>{row.description}</td>
                  <td>{formatVnd(row.amount)}</td>
                  <td>
                    <span className={styles[`status_${row.status}`] || styles.status_pending}>
                      {STATUS_LABEL[row.status] || row.status}
                    </span>
                  </td>
                  <td>
                    {row.status === 'pending' ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.approveBtn}
                          disabled={busyId === row.id}
                          onClick={() => handleStatus(row.id, 'approved')}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className={styles.rejectBtn}
                          disabled={busyId === row.id}
                          onClick={() => handleStatus(row.id, 'rejected')}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className={styles.mutedSmall}>{row.adminNote || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GuideExpenseManagement;
