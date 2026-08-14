import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminPromotion,
  listAdminPromotions,
  toggleAdminPromotionActive,
  updateAdminPromotion,
} from '../../../api/adminPromotions';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  code: '',
  title: '',
  description: '',
  discountPercent: '',
  maxDiscountAmount: '',
  startAt: '',
  endAt: '',
  active: true,
};

const PromotionManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listAdminPromotions({ size: 100 });
      let rows = Array.isArray(data?.content) ? data.content : [];
      if (activeFilter === 'true') {
        rows = rows.filter((i) => i.active !== false);
      } else if (activeFilter === 'false') {
        rows = rows.filter((i) => i.active === false);
      }
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        rows = rows.filter((i) =>
          (i.title || i.name || '').toLowerCase().includes(q)
          || (i.code || '').toLowerCase().includes(q));
      }
      setItems(rows);
    } catch (err) {
      setErrorMsg(err?.message || 'Không tải được danh sách khuyến mãi.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const startAt = item.validFrom ?? item.startAt;
    const endAt = item.validTo ?? item.endAt;
    setFormData({
      code: item.code || '',
      title: item.name || item.title || '',
      description: item.description || '',
      discountPercent: item.discountPercent ?? item.discountValue ?? '',
      maxDiscountAmount: item.maxDiscountAmount ?? '',
      startAt: startAt ? String(startAt).slice(0, 16) : '',
      endAt: endAt ? String(endAt).slice(0, 16) : '',
      active: item.isActive !== false && item.active !== false,
    });
    setModalOpen(true);
  };

  const toInstant = (value) => (value ? new Date(value).toISOString() : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.title.trim(),
        discountType: 'percent',
        discountValue: Number(formData.discountPercent || 0),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        validFrom: toInstant(formData.startAt) || new Date().toISOString(),
        validTo: toInstant(formData.endAt) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: !!formData.active,
      };
      if (editingItem?.id) {
        await updateAdminPromotion(editingItem.id, payload);
        setSuccessMsg('Đã cập nhật chương trình khuyến mãi.');
      } else {
        await createAdminPromotion(payload);
        setSuccessMsg('Đã tạo chương trình khuyến mãi mới.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không lưu được khuyến mãi.');
    }
  };

  const handleToggle = async (row) => {
    const isActive = row.isActive !== false && row.active !== false;
    try {
      await toggleAdminPromotionActive(row.id, !isActive);
      setSuccessMsg(isActive ? 'Đã tạm dừng khuyến mãi.' : 'Đã kích hoạt khuyến mãi.');
      fetchData();
    } catch (err) {
      setErrorMsg(err?.message || 'Không cập nhật được trạng thái.');
    }
  };

  const stats = useMemo(() => {
    const active = items.filter((i) => i.isActive !== false && i.active !== false).length;
    const upcoming = items.filter((i) => {
      const start = i.validFrom ?? i.startAt;
      return start && new Date(start).getTime() > Date.now();
    }).length;
    return { total: items.length, active, upcoming };
  }, [items]);

  const columns = [
    {
      key: 'title',
      label: 'Khuyến mãi',
      render: (_, row) => (
        <div className={styles.nameCell}>
          <div className={styles.nameIcon}>
            <span className="material-icons-round">sell</span>
          </div>
          <div>
            <div className={styles.nameTitle}>{row.name || row.title || row.code}</div>
            <div className={styles.subText}>{row.code || 'Không có mã'}</div>
          </div>
        </div>
      ),
    },
    { key: 'discountPercent', label: 'Giảm (%)', render: (v) => `${v ?? 0}%` },
    { key: 'maxDiscountAmount', label: 'Trần giảm', render: (v) => (v ? v.toLocaleString('vi-VN') : 'Không giới hạn') },
    {
      key: 'active',
      label: 'Trạng thái',
      render: (v, row) => {
        const active = row.isActive !== false && row.active !== false;
        return (
        <span className={`${styles.statusBadge} ${active ? styles.badgeSuccess : styles.badgeNeutral}`}>
          {active ? 'Đang hoạt động' : 'Tạm dừng'}
        </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => openEdit(row)} title="Chỉnh sửa">
            <span className="material-icons-round" style={{ fontSize: 18 }}>edit</span>
          </button>
          <button
            className={`${styles.actionBtn} ${(row.isActive !== false && row.active !== false) ? styles.actionDanger : styles.actionSuccess}`}
            onClick={() => handleToggle(row)}
            title={(row.isActive !== false && row.active !== false) ? 'Tạm dừng' : 'Kích hoạt'}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              {(row.isActive !== false && row.active !== false) ? 'toggle_off' : 'toggle_on'}
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
          <h1 className={styles.pageTitle}>Quản lý khuyến mãi</h1>
          <p className={styles.pageSubtitle}>Quản lý mã giảm giá, ngày hiệu lực và trạng thái sử dụng</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>Tải lại</button>
          <button className={styles.addBtn} onClick={openCreate}>Thêm khuyến mãi</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="sell" label="Tổng chương trình" value={String(stats.total)} color="green" />
        <StatCard icon="bolt" label="Đang hoạt động" value={String(stats.active)} color="blue" />
        <StatCard icon="schedule" label="Sắp diễn ra" value={String(stats.upcoming)} color="orange" />
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
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'true', label: 'Đang bật' },
            { key: 'false', label: 'Tạm dừng' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.filterSearch}>
          <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            className={styles.filterInput}
            placeholder="Tìm theo tên, mã khuyến mãi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        totalLabel="khuyến mãi"
        emptyMessage={loading ? 'Đang tải...' : 'Chưa có khuyến mãi nào'}
      />

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}</h2>
              <button className={styles.actionBtn} type="button" onClick={() => setModalOpen(false)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mã khuyến mãi</label>
                    <input className={styles.formInput} value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tiêu đề</label>
                    <input className={styles.formInput} value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mô tả</label>
                  <textarea className={styles.formTextarea} rows={4} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phần trăm giảm</label>
                    <input type="number" min="0" max="100" className={styles.formInput} value={formData.discountPercent} onChange={(e) => setFormData((p) => ({ ...p, discountPercent: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trần giảm (VNĐ)</label>
                    <input type="number" min="0" className={styles.formInput} value={formData.maxDiscountAmount} onChange={(e) => setFormData((p) => ({ ...p, maxDiscountAmount: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bắt đầu</label>
                    <input type="datetime-local" className={styles.formInput} value={formData.startAt} onChange={(e) => setFormData((p) => ({ ...p, startAt: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kết thúc</label>
                    <input type="datetime-local" className={styles.formInput} value={formData.endAt} onChange={(e) => setFormData((p) => ({ ...p, endAt: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>{editingItem ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;
