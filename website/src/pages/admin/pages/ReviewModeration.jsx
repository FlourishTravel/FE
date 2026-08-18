import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { featureAdminReview, listAdminReviews, publishAdminReview } from '../../../api/adminReviews';
import styles from './PromotionManagement.module.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'published', label: 'Đã đăng' },
  { key: 'hidden', label: 'Đang ẩn' },
  { key: 'featured', label: 'Nổi bật' },
];

function truncate(text, max = 90) {
  const value = String(text || '').trim();
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

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
      const data = await listAdminReviews({ size: 100 });
      setItems(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    let rows = items;
    if (statusFilter === 'published') rows = rows.filter((i) => i.published);
    else if (statusFilter === 'hidden') rows = rows.filter((i) => !i.published);
    else if (statusFilter === 'featured') rows = rows.filter((i) => i.featured);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = `${row.authorName || ''} ${row.tourTitle || ''} ${row.content || ''} ${row.guideName || ''} ${row.bookingCode || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter((i) => i.published === true).length,
    featured: items.filter((i) => i.featured === true).length,
  }), [items]);

  const togglePublish = async (row) => {
    try {
      await publishAdminReview(row.id, !row.published);
      setSuccessMsg(row.published ? 'Đã ẩn đánh giá khỏi trang khách.' : 'Đã đăng đánh giá công khai.');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không cập nhật được trạng thái đăng.');
    }
  };

  const toggleFeature = async (row) => {
    try {
      await featureAdminReview(row.id, !row.featured);
      setSuccessMsg(row.featured ? 'Đã bỏ đánh giá nổi bật.' : 'Đã gán đánh giá nổi bật.');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không cập nhật được trạng thái nổi bật.');
    }
  };

  const columns = [
    {
      key: 'authorName',
      label: 'Người đánh giá',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.authorName || row.customerName || 'Khách hàng'}</div>
          <div className={styles.subText}>Tour: {row.tourTitle || row.tourName || 'Không rõ'}</div>
          {row.bookingCode ? (
            <div className={styles.subText}>Mã đơn: {row.bookingCode}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Điểm',
      render: (v) => `${v || 0}/5`,
    },
    {
      key: 'guideRating',
      label: 'HDV',
      render: (v, row) => (v ? `${row.guideName || 'HDV'}: ${v}/5` : '—'),
    },
    {
      key: 'content',
      label: 'Nội dung',
      render: (v) => truncate(v, 100),
    },
    {
      key: 'published',
      label: 'Công khai',
      render: (v) => (
        <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {v ? 'Đã đăng' : 'Đang ẩn'}
        </span>
      ),
    },
    {
      key: 'featured',
      label: 'Nổi bật',
      render: (v) => (
        <span className={`${styles.statusBadge} ${v ? styles.badgeWarning : styles.badgeNeutral}`}>
          {v ? 'Nổi bật' : 'Thường'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${row.published ? styles.actionDanger : styles.actionSuccess}`}
            onClick={() => togglePublish(row)}
            title={row.published ? 'Ẩn đánh giá' : 'Đăng công khai'}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {row.published ? 'visibility_off' : 'visibility'}
            </span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionSuccess}`}
            onClick={() => toggleFeature(row)}
            title={row.featured ? 'Bỏ nổi bật' : 'Gán nổi bật'}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {row.featured ? 'star' : 'star_outline'}
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
          <h1 className={styles.pageTitle}>Kiểm duyệt đánh giá</h1>
          <p className={styles.pageSubtitle}>
            Đăng công khai, ẩn hoặc gán nổi bật các đánh giá của khách sau tour.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="reviews" label="Tổng đánh giá" value={String(stats.total)} color="blue" />
        <StatCard icon="visibility" label="Đã đăng" value={String(stats.published)} color="green" />
        <StatCard icon="star" label="Nổi bật" value={String(stats.featured)} color="orange" />
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
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${statusFilter === tab.key ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            className={styles.filterInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, tour hoặc nội dung..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        totalLabel="đánh giá"
        emptyMessage={loading ? 'Đang tải...' : 'Chưa có đánh giá nào'}
      />
    </div>
  );
};

export default ReviewModeration;
