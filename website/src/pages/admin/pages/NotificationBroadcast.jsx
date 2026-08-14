import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { broadcastAdminNotification, listAdminNotifications } from '../../../api/adminNotifications';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'general',
  audience: 'ALL_USERS',
};

const TYPE_LABELS = {
  general: 'Chung',
  promotion: 'Khuyến mãi',
  booking: 'Đặt tour',
  system: 'Hệ thống',
};

const AUDIENCE_LABELS = {
  ALL_USERS: 'Tất cả người dùng',
  TRAVELERS: 'Khách du lịch',
  GUIDES: 'Hướng dẫn viên',
  ADMINS: 'Quản trị viên',
};

function typeLabel(value) {
  const key = String(value || 'general').toLowerCase();
  return TYPE_LABELS[key] || value || 'Chung';
}

function truncate(text, max = 80) {
  const value = String(text || '').trim();
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

const NotificationBroadcast = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminNotifications({ size: 30 });
      setHistory(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được lịch sử thông báo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await broadcastAdminNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        audience: formData.audience,
      });
      const sent = result?.sentCount;
      setSuccessMsg(
        Number.isFinite(sent)
          ? `Đã gửi thông báo tới ${sent} người.`
          : 'Đã gửi thông báo thành công.',
      );
      setFormData(EMPTY_FORM);
      fetchHistory();
    } catch (err) {
      setErrorMsg(err?.message || 'Không gửi được thông báo.');
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(() => ({
    total: history.length,
    promotion: history.filter((h) => String(h.type || '').toLowerCase() === 'promotion').length,
    booking: history.filter((h) => String(h.type || '').toLowerCase().startsWith('booking')).length,
  }), [history]);

  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (v, row) => (
        <div>
          <div className={styles.nameTitle}>{v || 'Không có tiêu đề'}</div>
          <div className={styles.subText}>{truncate(row.message || row.body, 70)}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Loại',
      render: (v) => (
        <span className={`${styles.statusBadge} ${styles.badgeNeutral}`}>{typeLabel(v)}</span>
      ),
    },
    {
      key: 'audience',
      label: 'Người nhận',
      render: (v, row) => row.recipientEmail || v || '—',
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      render: (v) => (v ? new Date(v).toLocaleString('vi-VN') : '—'),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gửi thông báo hàng loạt</h1>
          <p className={styles.pageSubtitle}>
            Soạn và gửi thông báo trong ứng dụng tới khách, hướng dẫn viên hoặc quản trị viên.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchHistory} disabled={loading}>
          Tải lại lịch sử
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="campaign" label="Tổng bản ghi" value={String(stats.total)} color="blue" />
        <StatCard icon="sell" label="Khuyến mãi" value={String(stats.promotion)} color="green" />
        <StatCard icon="event" label="Đặt tour" value={String(stats.booking)} color="orange" />
      </div>

      {(errorMsg || successMsg) && (
        <div className={`${styles.banner} ${errorMsg ? styles.bannerError : styles.bannerSuccess}`}>
          <span className="material-icons-round">{errorMsg ? 'error_outline' : 'check_circle'}</span>
          <span>{errorMsg || successMsg}</span>
          <button className={styles.bannerClose} type="button" onClick={() => { setErrorMsg(''); setSuccessMsg(''); }}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
      )}

      <form className={styles.modalContent} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <h2>Thông tin thông báo</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tiêu đề</label>
              <input
                className={styles.formInput}
                required
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ví dụ: Ưu đãi Bangkok cuối tuần"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Loại</label>
              <select
                className={styles.formSelect}
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Đối tượng nhận</label>
            <select
              className={styles.formSelect}
              value={formData.audience}
              onChange={(e) => setFormData((p) => ({ ...p, audience: e.target.value }))}
            >
              {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <span className={styles.formHint}>Thông báo hiện trong chuông và trang Thông báo của tài khoản được chọn.</span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nội dung</label>
            <textarea
              className={styles.formTextarea}
              required
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              placeholder="Nhập nội dung thông báo bằng tiếng Việt…"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="submit" className={styles.submitBtn} disabled={sending}>
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>

      <DataTable
        columns={columns}
        data={history}
        totalLabel="thông báo"
        emptyMessage={loading ? 'Đang tải...' : 'Chưa có thông báo nào được gửi'}
      />
    </div>
  );
};

export default NotificationBroadcast;
