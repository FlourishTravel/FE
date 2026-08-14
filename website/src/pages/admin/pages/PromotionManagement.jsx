import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import {
  createAdminPromotion,
  listAdminPromotions,
  toggleAdminPromotionActive,
  updateAdminPromotion,
} from '../../../api/adminPromotions';
import GiftPromotionModal from './GiftPromotionModal';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  code: '',
  title: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  startAt: '',
  endAt: '',
  active: true,
  isPublic: true,
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isPercentType(type) {
  return String(type || 'percent').toLowerCase() === 'percent';
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `${n.toLocaleString('vi-VN')} ₫`;
}

function formatDiscount(row) {
  const n = Number(row.discountValue ?? row.discountPercent ?? 0);
  if (isPercentType(row.discountType)) return `${n}%`;
  return formatMoney(n);
}

function optionalNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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
  const [giftingItem, setGiftingItem] = useState(null);

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
      discountType: isPercentType(item.discountType) ? 'percent' : 'amount',
      discountValue: item.discountValue ?? item.discountPercent ?? '',
      minOrderAmount: item.minOrderAmount ?? '',
      maxDiscountAmount: item.maxDiscountAmount ?? '',
      usageLimit: item.usageLimit ?? '',
      startAt: toDatetimeLocal(startAt),
      endAt: toDatetimeLocal(endAt),
      active: item.isActive !== false && item.active !== false,
      isPublic: item.isPublic !== false,
    });
    setModalOpen(true);
  };

  const toInstant = (value) => (value ? new Date(value).toISOString() : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discountType = isPercentType(formData.discountType) ? 'percent' : 'amount';
    const discountValue = Number(formData.discountValue || 0);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setErrorMsg('Giá trị giảm phải lớn hơn 0.');
      return;
    }
    if (discountType === 'percent' && discountValue > 100) {
      setErrorMsg('Phần trăm giảm tối đa 100%.');
      return;
    }
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.title.trim(),
        discountType,
        discountValue,
        minOrderAmount: optionalNumber(formData.minOrderAmount),
        maxDiscountAmount: discountType === 'percent' ? optionalNumber(formData.maxDiscountAmount) : null,
        usageLimit: optionalNumber(formData.usageLimit),
        validFrom: toInstant(formData.startAt) || new Date().toISOString(),
        validTo: toInstant(formData.endAt) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: !!formData.active,
        isPublic: !!formData.isPublic,
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
    {
      key: 'discountValue',
      label: 'Giảm',
      render: (_, row) => formatDiscount(row),
    },
    {
      key: 'minOrderAmount',
      label: 'Đơn tối thiểu',
      render: (v) => (v ? formatMoney(v) : 'Không'),
    },
    {
      key: 'usageLimit',
      label: 'Lượt dùng',
      render: (v, row) => {
        const used = row.usedCount ?? 0;
        return v == null ? `${used} / không giới hạn` : `${used} / ${v}`;
      },
    },
    {
      key: 'isPublic',
      label: 'Hiển thị',
      render: (_, row) => {
        const pub = row.isPublic !== false;
        const gifted = row.assignedCount ?? 0;
        return (
          <div>
            <span className={`${styles.statusBadge} ${pub ? styles.badgeSuccess : styles.badgeWarning}`}>
              {pub ? 'Công khai' : 'Tặng riêng'}
            </span>
            {gifted > 0 && <div className={styles.subText}>Đã tặng {gifted}</div>}
          </div>
        );
      },
    },
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
          <button className={styles.actionBtn} onClick={() => setGiftingItem(row)} title="Tặng cho khách">
            <span className="material-icons-round" style={{ fontSize: 18 }}>card_giftcard</span>
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

  const percentMode = isPercentType(formData.discountType);

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
                    <input
                      className={styles.formInput}
                      value={formData.code}
                      onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="VD: FLOURISH10"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tiêu đề</label>
                    <input
                      className={styles.formInput}
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="VD: Giảm 10% tour Thái Lan"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Loại giảm</label>
                    <select
                      className={styles.formSelect}
                      value={formData.discountType}
                      onChange={(e) => setFormData((p) => ({ ...p, discountType: e.target.value }))}
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="amount">Số tiền cố định (VNĐ)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{percentMode ? 'Phần trăm giảm' : 'Số tiền giảm (VNĐ)'}</label>
                    <input
                      type="number"
                      min="0"
                      max={percentMode ? 100 : undefined}
                      step={percentMode ? 1 : 1000}
                      className={styles.formInput}
                      value={formData.discountValue}
                      onChange={(e) => setFormData((p) => ({ ...p, discountValue: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đơn tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={styles.formInput}
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData((p) => ({ ...p, minOrderAmount: e.target.value }))}
                      placeholder="Để trống = không bắt buộc"
                    />
                    <span className={styles.formHint}>Đơn nhỏ hơn mức này thì không dùng được mã.</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Giới hạn lượt dùng</label>
                    <input
                      type="number"
                      min="1"
                      className={styles.formInput}
                      value={formData.usageLimit}
                      onChange={(e) => setFormData((p) => ({ ...p, usageLimit: e.target.value }))}
                      placeholder="Để trống = không giới hạn"
                    />
                    {editingItem ? (
                      <span className={styles.formHint}>Đã dùng {editingItem.usedCount ?? 0} lượt.</span>
                    ) : (
                      <span className={styles.formHint}>Hết lượt thì mã tự khóa.</span>
                    )}
                  </div>
                </div>

                {percentMode ? (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Trần giảm (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={styles.formInput}
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData((p) => ({ ...p, maxDiscountAmount: e.target.value }))}
                      placeholder="Để trống = không trần"
                    />
                    <span className={styles.formHint}>Ví dụ giảm 10% nhưng tối đa 500.000đ.</span>
                  </div>
                ) : null}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      className={styles.formInput}
                      value={formData.startAt}
                      onChange={(e) => setFormData((p) => ({ ...p, startAt: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kết thúc</label>
                    <input
                      type="datetime-local"
                      className={styles.formInput}
                      value={formData.endAt}
                      onChange={(e) => setFormData((p) => ({ ...p, endAt: e.target.value }))}
                    />
                  </div>
                </div>

                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={!!formData.active}
                    onChange={(e) => setFormData((p) => ({ ...p, active: e.target.checked }))}
                  />
                  Kích hoạt — mã còn dùng được khi thanh toán
                </label>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isPublic !== false}
                    onChange={(e) => setFormData((p) => ({ ...p, isPublic: e.target.checked }))}
                  />
                  Công khai — hiện trên trang Voucher của mọi khách
                </label>
                <span className={styles.formHint}>
                  Tắt Công khai nếu đây là voucher tặng VIP. Sau khi lưu, bấm biểu tượng quà trên danh sách để chọn khách.
                </span>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>{editingItem ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {giftingItem && (
        <GiftPromotionModal
          promotion={giftingItem}
          onClose={() => setGiftingItem(null)}
          onChanged={fetchData}
        />
      )}
    </div>
  );
};

export default PromotionManagement;
