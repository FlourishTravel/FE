import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { featureAdminReview, listAdminReviews, publishAdminReview } from '../../../api/adminReviews';
import styles from './PromotionManagement.module.css';

const ReviewModeration = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminReviews({ q: searchQuery, status: statusFilter, size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the tai danh sach danh gia');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.published === true).length,
    featured: items.filter((i) => i.featured === true).length,
  }), [items]);

  const togglePublish = async (row) => {
    try {
      await publishAdminReview(row.id, !row.published);
      setSuccessMsg(row.published ? 'Da an danh gia' : 'Da dang danh gia');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the cap nhat trang thai');
    }
  };

  const toggleFeature = async (row) => {
    try {
      await featureAdminReview(row.id, !row.featured);
      setSuccessMsg(row.featured ? 'Da bo noi bat danh gia' : 'Da gan danh gia noi bat');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Khong the cap nhat noi bat');
    }
  };

  const columns = [
    {
      key: 'authorName',
      label: 'Nguoi danh gia',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.authorName || row.customerName || 'Khach hang'}</div>
          <div className={styles.subText}>Tour: {row.tourTitle || row.tourName || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Diem',
      render: (v) => `${v || 0}/5`,
    },
    { key: 'content', label: 'Noi dung', render: (v) => v || '—' },
    {
      key: 'published',
      label: 'Cong khai',
      render: (v) => <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>{v ? 'Da dang' : 'Ban nhap'}</span>,
    },
    {
      key: 'featured',
      label: 'Noi bat',
      render: (v) => <span className={`${styles.statusBadge} ${v ? styles.badgeWarning : styles.badgeNeutral}`}>{v ? 'Noi bat' : 'Thuong'}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${row.published ? styles.actionDanger : styles.actionSuccess}`} onClick={() => togglePublish(row)} title="Dang/An">
            <span className="material-icons-round" style={{ fontSize: 18 }}>{row.published ? 'visibility_off' : 'visibility'}</span>
          </button>
          <button className={`${styles.actionBtn} ${styles.actionSuccess}`} onClick={() => toggleFeature(row)} title="Noi bat">
            <span className="material-icons-round" style={{ fontSize: 18 }}>{row.featured ? 'star' : 'star_outline'}</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Kiem Duyet Danh Gia</h1>
          <p className={styles.pageSubtitle}>Cong khai, an hoac gan noi bat cac danh gia cua khach hang</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tai lai</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="reviews" label="Tong danh gia" value={String(stats.total)} color="blue" />
        <StatCard icon="visibility" label="Da dang" value={String(stats.published)} color="green" />
        <StatCard icon="star" label="Noi bat" value={String(stats.featured)} color="orange" />
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

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {['all', 'PUBLISHED', 'DRAFT'].map((tab) => (
            <button key={tab} className={`${styles.filterTab} ${statusFilter === tab ? styles.filterTabActive : ''}`} onClick={() => setStatusFilter(tab)}>
              {tab === 'all' ? 'Tat ca' : tab}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input className={styles.filterInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tim theo ten hoac noi dung..." />
        </div>
      </div>

      <DataTable columns={columns} data={items} totalLabel="danh gia" emptyMessage={loading ? 'Dang tai...' : 'Chua co danh gia'} />
    </div>
  );
};

export default ReviewModeration;
