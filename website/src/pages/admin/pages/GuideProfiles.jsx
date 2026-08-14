import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { getStaffDetail, listStaff, updateStaff } from '../../../api/adminStaff';
import { GUIDE_SPECIALTY_OPTIONS } from '../../../config/guideProfile';
import styles from './PromotionManagement.module.css';

const FILTERS = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'public', label: 'Đang hiện' },
  { key: 'hidden', label: 'Chưa hiện' },
  { key: 'all', label: 'Tất cả HDV' },
];

function unwrapList(page) {
  return Array.isArray(page?.content) ? page.content : [];
}

const GuideProfiles = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    jobTitle: '',
    guideBaseLocation: '',
    guideBadges: '',
    guideVerified: false,
    guideSpecialties: [],
  });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const page = await listStaff({ roleName: 'TOUR_GUIDE', size: 100 });
      setItems(unwrapList(page));
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách HDV.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    let rows = items;
    if (statusFilter === 'pending') rows = rows.filter((i) => i.guidePendingReview);
    else if (statusFilter === 'public') rows = rows.filter((i) => i.guidePublicApproved);
    else if (statusFilter === 'hidden') rows = rows.filter((i) => !i.guidePublicApproved);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = `${row.fullName || ''} ${row.email || ''} ${row.jobTitle || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.guidePendingReview).length,
    visible: items.filter((i) => i.guidePublicApproved).length,
  }), [items]);

  const setStatus = async (row, approved) => {
    try {
      await updateStaff(row.id, {
        guidePublicApproved: approved,
        guidePendingReview: approved ? false : row.guidePendingReview,
        guideVerified: approved ? true : row.guideVerified,
      });
      setSuccessMsg(approved ? `Đã duyệt hồ sơ ${row.fullName}.` : `Đã ẩn ${row.fullName} khỏi trang khách.`);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không cập nhật được trạng thái duyệt.');
    }
  };

  const openEdit = async (row) => {
    setErrorMsg('');
    try {
      const d = await getStaffDetail(row.id);
      setEditing(d);
      setEditForm({
        jobTitle: d.jobTitle || '',
        guideBaseLocation: d.guideBaseLocation || '',
        guideBadges: (d.guideBadges || []).join(', '),
        guideVerified: Boolean(d.guideVerified),
        guideSpecialties: d.guideSpecialties || [],
      });
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được hồ sơ HDV.');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await updateStaff(editing.id, {
        jobTitle: editForm.jobTitle.trim(),
        guideBaseLocation: editForm.guideBaseLocation.trim(),
        guideBadges: editForm.guideBadges.split(',').map((s) => s.trim()).filter(Boolean),
        guideVerified: editForm.guideVerified,
        guideSpecialties: editForm.guideSpecialties,
      });
      setSuccessMsg('Đã lưu chỉnh sửa admin.');
      setEditing(null);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không lưu được.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'HDV',
      render: (_, row) => (
        <div>
          <div className={styles.nameTitle}>{row.fullName}</div>
          <div className={styles.subText}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      label: 'Chức danh',
      render: (v) => v || 'Hướng dẫn viên',
    },
    {
      key: 'guidePublicApproved',
      label: 'Trang khách',
      render: (v, row) => (
        <span className={`${styles.statusBadge} ${v ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {v ? 'Đang hiện' : 'Chưa hiện'}
          {row.guidePendingReview ? ' · chờ xem' : ''}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          {!row.guidePublicApproved || row.guidePendingReview ? (
            <button className={`${styles.actionBtn} ${styles.actionSuccess}`} onClick={() => setStatus(row, true)} title="Duyệt hiện trên Đội ngũ HDV">
              <span className="material-icons-round" style={{ fontSize: 18 }}>check_circle</span>
            </button>
          ) : null}
          {row.guidePublicApproved ? (
            <button className={`${styles.actionBtn} ${styles.actionDanger}`} onClick={() => setStatus(row, false)} title="Ẩn khỏi trang khách">
              <span className="material-icons-round" style={{ fontSize: 18 }}>visibility_off</span>
            </button>
          ) : null}
          <button className={styles.actionBtn} onClick={() => openEdit(row)} title="Sửa chức danh, tuyến, huy hiệu">
            <span className="material-icons-round" style={{ fontSize: 18 }}>edit</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Hồ sơ Đội ngũ HDV</h1>
          <p className={styles.pageSubtitle}>
            HDV tự viết bio trên portal. Admin duyệt mới hiện ở Khám phá → Đội ngũ HDV. Chức danh, huy hiệu, tick xác minh do admin gán.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="groups" label="Tổng HDV" value={String(stats.total)} color="blue" />
        <StatCard icon="hourglass_top" label="Chờ duyệt" value={String(stats.pending)} color="orange" />
        <StatCard icon="visibility" label="Đang hiện" value={String(stats.visible)} color="green" />
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
            placeholder="Tìm tên hoặc email HDV..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        totalLabel="hướng dẫn viên"
        emptyMessage={loading ? 'Đang tải...' : 'Không có HDV trong bộ lọc này'}
      />

      {editing ? (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <form className={styles.modalContent} onClick={(e) => e.stopPropagation()} onSubmit={saveEdit}>
            <div className={styles.modalHeader}>
              <h2>{editing.fullName}</h2>
              <button type="button" className={styles.bannerClose} onClick={() => setEditing(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className={styles.modalBody}>
            <p className={styles.formHint}>{editing.guideShortBio || 'Chưa có bio ngắn.'}</p>
            <label className={styles.formLabel}>
              Chức danh
              <input className={styles.formInput} value={editForm.jobTitle} onChange={(e) => setEditForm((p) => ({ ...p, jobTitle: e.target.value }))} />
            </label>
            <label className={styles.formLabel}>
              Tuyến / vùng phụ trách
              <input className={styles.formInput} value={editForm.guideBaseLocation} onChange={(e) => setEditForm((p) => ({ ...p, guideBaseLocation: e.target.value }))} />
            </label>
            <label className={styles.formLabel}>
              Huy hiệu (phẩy)
              <input className={styles.formInput} value={editForm.guideBadges} onChange={(e) => setEditForm((p) => ({ ...p, guideBadges: e.target.value }))} placeholder="Top Guide 2025, Local Expert" />
            </label>
            <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={editForm.guideVerified} onChange={(e) => setEditForm((p) => ({ ...p, guideVerified: e.target.checked }))} />
              Đã xác minh
            </label>
            <div className={styles.formLabel}>
              Chuyên môn
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {GUIDE_SPECIALTY_OPTIONS.map((item) => {
                  const on = editForm.guideSpecialties.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.filterTab} ${on ? styles.filterTabActive : ''}`}
                      onClick={() => setEditForm((p) => ({
                        ...p,
                        guideSpecialties: on ? p.guideSpecialties.filter((s) => s !== item) : [...p.guideSpecialties, item],
                      }))}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)}>Huỷ</button>
              <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default GuideProfiles;
