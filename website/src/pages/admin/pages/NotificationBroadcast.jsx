import React, { useCallback, useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { broadcastAdminNotification, listAdminNotifications } from '../../../api/adminNotifications';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  title: '',
  message: '',
  channel: 'IN_APP',
  audience: 'ALL_USERS',
  sendNow: true,
  scheduledAt: '',
};

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
      setErrorMsg(err?.message || 'Khong the tai lich su thong bao');
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
    try {
      await broadcastAdminNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        channel: formData.channel,
        audience: formData.audience,
        sendNow: formData.sendNow,
        scheduledAt: formData.sendNow ? null : formData.scheduledAt,
      });
      setSuccessMsg('Da gui thong bao thanh cong');
      setFormData(EMPTY_FORM);
      fetchHistory();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the gui thong bao');
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Tieu de' },
    { key: 'audience', label: 'Doi tuong' },
    { key: 'channel', label: 'Kenh' },
    {
      key: 'status',
      label: 'Trang thai',
      render: (v) => <span className={`${styles.statusBadge} ${v === 'SENT' ? styles.badgeSuccess : styles.badgeWarning}`}>{v || 'PENDING'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Thoi gian',
      render: (v) => (v ? new Date(v).toLocaleString('vi-VN') : '—'),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Gui Thong Bao Hang Loat</h1>
          <p className={styles.pageSubtitle}>Tao va phat thong bao den nguoi dung theo tung doi tuong</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchHistory} disabled={loading}>Tai lai lich su</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="campaign" label="Tong da tao" value={String(history.length)} color="blue" />
        <StatCard icon="send" label="Da gui" value={String(history.filter((h) => h.status === 'SENT').length)} color="green" />
        <StatCard icon="schedule_send" label="Cho gui" value={String(history.filter((h) => h.status !== 'SENT').length)} color="orange" />
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
          <h2>Thong tin thong bao</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tieu de</label>
              <input className={styles.formInput} required value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kenh gui</label>
              <select className={styles.formSelect} value={formData.channel} onChange={(e) => setFormData((p) => ({ ...p, channel: e.target.value }))}>
                <option value="IN_APP">In-app</option>
                <option value="EMAIL">Email</option>
                <option value="PUSH">Push</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Doi tuong</label>
              <select className={styles.formSelect} value={formData.audience} onChange={(e) => setFormData((p) => ({ ...p, audience: e.target.value }))}>
                <option value="ALL_USERS">Tat ca nguoi dung</option>
                <option value="TRAVELERS">Khach du lich</option>
                <option value="GUIDES">Huong dan vien</option>
                <option value="ADMINS">Quan tri vien</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Lich gui</label>
              <select className={styles.formSelect} value={formData.sendNow ? 'now' : 'scheduled'} onChange={(e) => setFormData((p) => ({ ...p, sendNow: e.target.value === 'now' }))}>
                <option value="now">Gui ngay</option>
                <option value="scheduled">Hen gio</option>
              </select>
            </div>
          </div>
          {!formData.sendNow && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Thoi diem gui</label>
              <input type="datetime-local" className={styles.formInput} value={formData.scheduledAt} onChange={(e) => setFormData((p) => ({ ...p, scheduledAt: e.target.value }))} required />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Noi dung</label>
            <textarea className={styles.formTextarea} required value={formData.message} onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))} />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="submit" className={styles.submitBtn} disabled={sending}>{sending ? 'Dang gui...' : 'Gui thong bao'}</button>
        </div>
      </form>

      <DataTable columns={columns} data={history} totalLabel="thong bao" emptyMessage={loading ? 'Dang tai...' : 'Chua co thong bao da gui'} />
    </div>
  );
};

export default NotificationBroadcast;
