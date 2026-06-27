import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './GuideExpenses.module.css';
import { useGuideSessions } from '../hooks/useGuideSessions';
import {
  createSessionExpense,
  deleteSessionExpense,
  listSessionExpenses,
} from '../../../api/guideExpenses';

const STATUS_MAP = {
  approved: { label: 'Đã duyệt', class: 'statusApproved' },
  pending: { label: 'Chờ duyệt', class: 'statusPending' },
  rejected: { label: 'Từ chối', class: 'statusRejected' },
};

function storageKey(sessionId) {
  return `flourish_guide_expenses_${sessionId}`;
}

function loadLocalExpenses(sessionId) {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function clearLocalExpenses(sessionId) {
  localStorage.removeItem(storageKey(sessionId));
}

function formatVnd(n) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function formatExpenseDate(row) {
  if (row.expenseDate) {
    try {
      return new Date(row.expenseDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return row.expenseDate;
    }
  }
  if (row.date) return row.date;
  return '—';
}

const GuideExpenses = () => {
  const { sessions, loading, ongoing } = useGuideSessions();
  const tourSessions = useMemo(
    () => sessions.filter((s) => s.status === 'ongoing' || s.status === 'upcoming' || s.status === 'completed'),
    [sessions],
  );
  const [sessionId, setSessionId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Vận chuyển', desc: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const selected = tourSessions.find((s) => s.sessionId === sessionId) || ongoing || tourSessions[0];

  useEffect(() => {
    if (selected?.sessionId && !sessionId) {
      setSessionId(selected.sessionId);
    }
  }, [selected, sessionId]);

  const migrateLocalToServer = useCallback(async (sid, localRows) => {
    for (const row of localRows) {
      const amount = parseInt(String(row.amount).replace(/\D/g, ''), 10);
      if (!row.desc?.trim() || !amount) continue;
      try {
        await createSessionExpense(sid, {
          category: row.category || 'Khác',
          description: row.desc.trim(),
          amount,
        });
      } catch {
        /* giữ local nếu một dòng lỗi */
        return false;
      }
    }
    clearLocalExpenses(sid);
    return true;
  }, []);

  const loadExpenses = useCallback(async () => {
    if (!sessionId) return;
    setExpensesLoading(true);
    setError('');
    try {
      const localRows = loadLocalExpenses(sessionId);
      if (localRows.length > 0) {
        await migrateLocalToServer(sessionId, localRows);
      }
      const rows = await listSessionExpenses(sessionId);
      setExpenses(rows);
    } catch (e) {
      setError(e.message || 'Không tải được chi phí.');
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, [sessionId, migrateLocalToServer]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const totalBudget = 50_000_000;
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!sessionId || !form.desc.trim()) return;
    const amount = parseInt(String(form.amount).replace(/\D/g, ''), 10);
    if (!amount || amount < 1) {
      setError('Nhập số tiền hợp lệ.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createSessionExpense(sessionId, {
        category: form.category,
        description: form.desc.trim(),
        amount,
      });
      setForm({ category: 'Vận chuyển', desc: '', amount: '' });
      setShowForm(false);
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Không lưu được chi phí.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Xóa khoản chi này?')) return;
    setError('');
    try {
      await deleteSessionExpense(sessionId, expenseId);
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Không xóa được.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            Chi phí tour: {selected?.tourTitle || 'Chọn tour'}
          </h1>
          <p className={styles.pageSubtitle}>
            <span className="material-icons-round" style={{ fontSize: '16px' }}>account_balance_wallet</span>
            Đồng bộ với kế toán — admin duyệt tại mục Chi phí HDV.
          </p>
          {tourSessions.length > 0 && (
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', maxWidth: 400 }}
            >
              {tourSessions.map((s) => (
                <option key={s.sessionId} value={s.sessionId}>{s.tourTitle}</option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.btnPrimary} onClick={() => setShowForm(!showForm)} disabled={!sessionId}>
            <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
            Thêm chi phí
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p>}
      {loading && <p>Đang tải tour...</p>}
      {!loading && tourSessions.length === 0 && (
        <p style={{ color: '#6b7280' }}>Chưa có tour để ghi chi phí.</p>
      )}

      {sessionId && (
        <>
          <div className={styles.budgetGrid}>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
              <div>
                <span className={styles.budgetLabel}>Ngân sách tham chiếu</span>
                <span className={styles.budgetValue}>₫{(totalBudget / 1_000_000).toFixed(0)} Tr</span>
              </div>
            </div>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                <span className="material-icons-round">payments</span>
              </div>
              <div>
                <span className={styles.budgetLabel}>Đã ghi nhận</span>
                <span className={styles.budgetValue}>₫{(totalSpent / 1_000_000).toFixed(1)} Tr</span>
              </div>
            </div>
            <div className={styles.budgetCard}>
              <div className={styles.budgetIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                <span className="material-icons-round">savings</span>
              </div>
              <div>
                <span className={styles.budgetLabel}>Còn lại (ước tính)</span>
                <span className={styles.budgetValue}>₫{(remaining / 1_000_000).toFixed(1)} Tr</span>
              </div>
            </div>
            <div className={styles.budgetCard}>
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Đã dùng</span>
                  <span>{spentPercent}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${spentPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className={styles.expenseForm} style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12 }}>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option>Vận chuyển</option>
                  <option>Ăn uống</option>
                  <option>Vé tham quan</option>
                  <option>Lưu trú</option>
                  <option>Khác</option>
                </select>
                <input
                  placeholder="Mô tả chi phí"
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  required
                />
                <input
                  placeholder="Số tiền (VND)"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className={styles.btnPrimary} style={{ marginTop: 12 }} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </form>
          )}

          <div className={styles.tableCard}>
            {expensesLoading && <p style={{ padding: 16, color: '#6b7280' }}>Đang tải chi phí...</p>}
            <table className={styles.expenseTable}>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {!expensesLoading && expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>Chưa có khoản chi nào</td>
                  </tr>
                )}
                {expenses.map((exp) => {
                  const st = STATUS_MAP[exp.status] || STATUS_MAP.pending;
                  return (
                    <tr key={exp.id}>
                      <td>{formatExpenseDate(exp)}</td>
                      <td>{exp.category}</td>
                      <td>{exp.description}</td>
                      <td>₫{formatVnd(Number(exp.amount) || 0)}</td>
                      <td><span className={styles[st.class]}>{st.label}</span></td>
                      <td>
                        {exp.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id)}
                            style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default GuideExpenses;
