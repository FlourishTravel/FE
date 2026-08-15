import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { broadcastAdminNotification, listAdminNotifications } from '../../../api/adminNotifications';
import { listAdminPromotions } from '../../../api/adminPromotions';
import { listPublicTours } from '../../../api/tours';
import styles from './PromotionManagement.module.css';

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'general',
  audience: 'TRAVELERS',
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

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${n.toLocaleString('vi-VN')}đ`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString('vi-VN');
}

function formatDiscount(promo) {
  const n = Number(promo.discountValue ?? 0);
  if (String(promo.discountType || '').toLowerCase() === 'percent') {
    return `giảm ${n}%`;
  }
  return `giảm ${formatMoney(n)}`;
}

function buildPromoTemplate(promo) {
  const code = promo.code || '';
  const name = promo.name || promo.title || code;
  const until = formatDate(promo.validTo);
  const min = promo.minOrderAmount ? `, đơn từ ${formatMoney(promo.minOrderAmount)}` : '';
  return {
    id: `promo-${promo.id || code}`,
    kind: 'Khuyến mãi',
    title: `${name} — mã ${code}`,
    message:
      `Flourish gửi bạn mã ${code} (${formatDiscount(promo)}) cho chương trình ${name}${min}. `
      + `Nhập mã khi thanh toán tour${until ? `, hạn dùng đến ${until}` : ''}. `
      + 'Xem lại mã trong mục Voucher của tôi.',
    type: 'promotion',
    audience: 'TRAVELERS',
  };
}

function buildTourTemplate(tour) {
  const title = tour.title || 'Tour Flourish';
  const price = formatMoney(tour.basePrice);
  const city = tour.destinationCity ? ` tại ${tour.destinationCity}` : '';
  const session = tour.earliestSession;
  const start = session?.startDate ? formatDate(session.startDate) : '';
  const end = session?.endDate && session.endDate !== session.startDate ? `–${formatDate(session.endDate)}` : '';
  const duration = tour.durationDays
    ? `${tour.durationDays} ngày${tour.durationNights ? ` ${tour.durationNights} đêm` : ''}`
    : '';
  return {
    id: `tour-${tour.id || tour.slug}`,
    kind: 'Tour',
    title: start ? `${title} — khởi hành ${start}` : `Mở đặt: ${title}`,
    message:
      `Tour ${title}${city}${duration ? `, ${duration}` : ''}`
      + `${price ? `, giá ${price}/khách` : ''}`
      + `${start ? `. Lịch gần nhất ${start}${end}` : ''}. `
      + 'Đặt trên website Flourish, nhập mã khuyến mãi (nếu có) lúc thanh toán để giữ giá tốt.',
    type: 'booking',
    audience: 'TRAVELERS',
  };
}

function buildMaintenanceTemplates() {
  return [
    {
      id: 'maint-scheduled',
      kind: 'Bảo trì',
      title: 'Bảo trì hệ thống [NGÀY] — [GIỜ BẮT ĐẦU] đến [GIỜ KẾT THÚC]',
      message:
        'Flourish Travel sẽ bảo trì hệ thống vào [NGÀY], từ [GIỜ BẮT ĐẦU] đến [GIỜ KẾT THÚC] (giờ Việt Nam).\n\n'
        + 'Trong khoảng thời gian này, website, ứng dụng và thanh toán có thể gián đoạn hoặc chậm hơn bình thường. '
        + 'Vui lòng hoàn tất đặt tour / thanh toán trước [GIỜ BẮT ĐẦU], hoặc quay lại sau [GIỜ KẾT THÚC].\n\n'
        + 'Lý do: [NÂNG CẤP / SỬA LỖI / BẢO TRÌ ĐỊNH KỲ].\n'
        + 'Nếu cần hỗ trợ gấp, liên hệ hotline [SỐ ĐIỆN THOẠI] hoặc email [EMAIL HỖ TRỢ].\n\n'
        + 'Xin lỗi vì sự bất tiện và cảm ơn bạn đã thông cảm.',
      type: 'system',
      audience: 'ALL_USERS',
    },
    {
      id: 'maint-ongoing',
      kind: 'Bảo trì',
      title: 'Hệ thống đang bảo trì — dự kiến xong [GIỜ KẾT THÚC]',
      message:
        'Flourish Travel đang bảo trì hệ thống. Một số tính năng (đăng nhập, đặt tour, thanh toán, chat) có thể tạm không dùng được.\n\n'
        + 'Thời gian dự kiến hoàn tất: [GIỜ KẾT THÚC] ngày [NGÀY] (giờ Việt Nam).\n'
        + 'Chúng tôi sẽ gửi thông báo khi hệ thống hoạt động trở lại.\n\n'
        + 'Hỗ trợ khẩn: [SỐ ĐIỆN THOẠI] / [EMAIL HỖ TRỢ].',
      type: 'system',
      audience: 'ALL_USERS',
    },
    {
      id: 'maint-done',
      kind: 'Bảo trì',
      title: 'Bảo trì hoàn tất — hệ thống đã hoạt động trở lại',
      message:
        'Flourish Travel đã hoàn tất bảo trì lúc [GIỜ XONG] ngày [NGÀY]. Website và ứng dụng đã hoạt động trở lại bình thường.\n\n'
        + 'Nếu bạn gặp lỗi khi đăng nhập, đặt tour hoặc thanh toán, hãy tải lại trang / mở lại app. '
        + 'Giao dịch đang chờ trong lúc bảo trì sẽ được xử lý tự động; liên hệ [SỐ ĐIỆN THOẠI] nếu cần đối soát.\n\n'
        + 'Cảm ơn bạn đã kiên nhẫn.',
      type: 'system',
      audience: 'ALL_USERS',
    },
  ];
}

function buildComboTemplates(promos, tours) {
  const bangkokPromo = promos.find((p) => String(p.code || '').toUpperCase() === 'BANGKOK500');
  const saigonPromo = promos.find((p) => String(p.code || '').toUpperCase() === 'SAIGON50K');
  const bangkokTour = tours.find((t) => String(t.slug || '').includes('bangkok'));
  const saigonTour = tours.find((t) => String(t.slug || '').includes('sai-gon') || String(t.slug || '').includes('cho-lon'));
  const combos = [];
  if (bangkokPromo && bangkokTour) {
    combos.push({
      id: 'combo-bangkok',
      kind: 'Combo',
      title: 'Bangkok 4N3Đ + mã giảm 500.000đ',
      message:
        `Tour ${bangkokTour.title} khởi hành ${formatDate(bangkokTour.earliestSession?.startDate) || '30/08'}, `
        + `giá ${formatMoney(bangkokTour.basePrice)}/khách. Nhập mã ${bangkokPromo.code} để ${formatDiscount(bangkokPromo)} `
        + `(đơn từ ${formatMoney(bangkokPromo.minOrderAmount)}), hạn ${formatDate(bangkokPromo.validTo)}. `
        + 'Vào trang tour hoặc Voucher của tôi để đặt ngay.',
      type: 'promotion',
      audience: 'TRAVELERS',
    });
  }
  if (saigonPromo && saigonTour) {
    combos.push({
      id: 'combo-saigon',
      kind: 'Combo',
      title: 'Chợ Lớn 1 ngày + mã giảm 50.000đ',
      message:
        `Tour ${saigonTour.title} giá ${formatMoney(saigonTour.basePrice)}, `
        + `khởi hành ${formatDate(saigonTour.earliestSession?.startDate) || '16/08'}. `
        + `Áp dụng mã ${saigonPromo.code} ${formatDiscount(saigonPromo)}, hạn ${formatDate(saigonPromo.validTo)}. `
        + 'Chỗ có hạn — đặt sớm trên Flourish Travel.',
      type: 'promotion',
      audience: 'TRAVELERS',
    });
  }
  combos.push({
    id: 'voucher-reminder',
    kind: 'Nhắc mã',
    title: 'Bạn có mã giảm giá đang chờ dùng',
    message:
      'Vào Voucher của tôi để xem mã công khai và voucher được tặng riêng. '
      + 'Sao chép mã rồi nhập khi thanh toán tour. Một số mã chỉ hiện với tài khoản được tặng.',
    type: 'promotion',
    audience: 'TRAVELERS',
  });
  return combos;
}

const NotificationBroadcast = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
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

  const fetchTemplates = useCallback(async () => {
    try {
      const [promoRes, tourRes] = await Promise.all([
        listAdminPromotions({ size: 50 }),
        listPublicTours({ size: 20 }),
      ]);
      const promos = (promoRes.content || []).filter((p) => p.isActive !== false && p.active !== false);
      const tours = tourRes.content || [];
      const promoTpls = promos.filter((p) => p.isPublic !== false).map(buildPromoTemplate);
      const tourTpls = tours.map(buildTourTemplate);
      setTemplates([...buildMaintenanceTemplates(), ...buildComboTemplates(promos, tours), ...promoTpls, ...tourTpls]);
    } catch {
      setTemplates([...buildMaintenanceTemplates(), ...buildComboTemplates([], [])]);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchTemplates();
  }, [fetchHistory, fetchTemplates]);

  const applyTemplate = (tpl) => {
    setActiveTemplateId(tpl.id);
    setFormData({
      title: tpl.title,
      message: tpl.message,
      type: tpl.type,
      audience: tpl.audience,
    });
  };

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
      setActiveTemplateId('');
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
            Chọn mẫu bảo trì / khuyến mãi / tour, điền chỗ [TRONG NGOẶC] rồi gửi.
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

      {templates.length > 0 && (
        <div>
          <h2 className={styles.sectionTitle}>Mẫu sẵn — bảo trì, khuyến mãi và tour</h2>
          <p className={styles.formHint} style={{ marginBottom: 10 }}>
            Bấm mẫu bảo trì để điền form, thay các chỗ [TRONG NGOẶC] rồi bấm Gửi thông báo.
          </p>
          <div className={styles.templateGrid}>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`${styles.templateCard} ${activeTemplateId === tpl.id ? styles.templateCardActive : ''}`}
                onClick={() => applyTemplate(tpl)}
              >
                <span className={styles.templateKind}>{tpl.kind}</span>
                <span className={styles.templateTitle}>{tpl.title}</span>
                <span className={styles.templateBody}>{truncate(tpl.message, 110)}</span>
              </button>
            ))}
          </div>
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
                placeholder="Ví dụ: Bảo trì hệ thống 16/08 — 01:00 đến 03:00"
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
            <span className={styles.formHint}>Mặc định gửi khách du lịch. Thông báo hiện trong chuông và trang Thông báo.</span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nội dung</label>
            <textarea
              className={styles.formTextarea}
              required
              rows={8}
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              placeholder="Nhập nội dung thông báo bằng tiếng Việt. Với mẫu bảo trì, thay các chỗ [TRONG NGOẶC]."
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
