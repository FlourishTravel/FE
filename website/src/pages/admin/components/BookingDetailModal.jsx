import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './BookingDetailModal.module.css';
import {
    approveBookingRefund,
    getAdminBookingDetail,
    markBookingPaid,
    rejectBookingRefund,
    updateBookingStatus,
} from '../../../api/adminBookings';

/**
 * Modal xem & xử lý 1 booking từ admin.
 * Tab: Tổng quan | Khách & liên hệ | Tài chính (payments + refunds)
 *
 * Props:
 *  - bookingId: string | null  -> mở modal khi non-null
 *  - onClose(): đóng modal
 *  - onUpdated(updatedDetail): callback khi state thay đổi (sync ra list page)
 */

const STATUS_INFO = {
    pending: { label: 'Chờ thanh toán', cls: 'statusPending' },
    paid: { label: 'Đã thanh toán', cls: 'statusPaid' },
    confirmed: { label: 'Đã xác nhận', cls: 'statusConfirmed' },
    completed: { label: 'Đã hoàn thành', cls: 'statusCompleted' },
    cancelled: { label: 'Đã huỷ', cls: 'statusCancelled' },
};

const PAYMENT_CLASS_LABEL = {
    paid: 'Đã thanh toán đủ',
    partial: 'Đã cọc',
    unpaid: 'Chưa thanh toán',
    refunded: 'Đã hoàn tiền',
    refund_pending: 'Chờ hoàn tiền',
};

const formatVnd = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
};

const formatDateTime = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('vi-VN');
    } catch {
        return '—';
    }
};

const BookingDetailModal = ({ bookingId, onClose, onUpdated }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [submitting, setSubmitting] = useState(false);

    // Refund / mark-paid form state
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [manualNote, setManualNote] = useState('');

    const fetchDetail = useCallback(async () => {
        if (!bookingId) return;
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await getAdminBookingDetail(bookingId);
            setDetail(data);
            setRefundAmount('');
            setRefundReason('');
            setManualAmount('');
            setManualNote('');
        } catch (err) {
            setErrorMsg(err?.message || 'Không tải được chi tiết booking.');
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        if (bookingId) {
            setActiveTab('overview');
            fetchDetail();
        }
    }, [bookingId, fetchDetail]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const pendingRefund = useMemo(() => {
        if (!detail?.refunds) return null;
        return [...detail.refunds].reverse().find((r) => r.status === 'pending') || null;
    }, [detail]);

    const handleStatusChange = async (status) => {
        if (!detail) return;
        if (!window.confirm(`Xác nhận chuyển trạng thái sang "${STATUS_INFO[status]?.label || status}"?`)) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const updated = await updateBookingStatus(detail.id, status);
            setDetail(updated);
            setSuccessMsg(`Đã cập nhật trạng thái: ${STATUS_INFO[status]?.label || status}`);
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể cập nhật trạng thái.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkPaid = async (e) => {
        e?.preventDefault();
        if (!detail) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const amount = manualAmount ? Number(manualAmount) : undefined;
            const updated = await markBookingPaid(detail.id, { amount, note: manualNote.trim() || undefined });
            setDetail(updated);
            setManualAmount('');
            setManualNote('');
            setSuccessMsg('Đã ghi nhận thanh toán thủ công.');
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể ghi nhận thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveRefund = async () => {
        if (!detail || !pendingRefund) return;
        if (!window.confirm('Xác nhận duyệt yêu cầu hoàn tiền?')) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            const amount = refundAmount ? Number(refundAmount) : undefined;
            const updated = await approveBookingRefund(detail.id, {
                refundId: pendingRefund.id,
                amount,
                reason: refundReason.trim() || undefined,
            });
            setDetail(updated);
            setSuccessMsg('Đã duyệt yêu cầu hoàn tiền.');
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể duyệt hoàn tiền.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectRefund = async () => {
        if (!detail || !pendingRefund) return;
        if (!refundReason.trim()) {
            setErrorMsg('Vui lòng nhập lý do từ chối.');
            return;
        }
        setSubmitting(true);
        setErrorMsg('');
        try {
            const updated = await rejectBookingRefund(detail.id, {
                refundId: pendingRefund.id,
                reason: refundReason.trim(),
            });
            setDetail(updated);
            setSuccessMsg('Đã từ chối yêu cầu hoàn tiền.');
            onUpdated?.(updated);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể từ chối hoàn tiền.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!bookingId) return null;

    const statusInfo = detail?.status ? STATUS_INFO[detail.status] : null;
    const paymentLabel = detail?.paymentClass ? PAYMENT_CLASS_LABEL[detail.paymentClass] : null;
    const allowedStatusButtons = (() => {
        if (!detail) return [];
        switch (detail.status) {
            case 'pending': return ['paid', 'cancelled'];
            case 'paid': return ['confirmed', 'completed', 'cancelled'];
            case 'confirmed': return ['completed', 'cancelled'];
            default: return [];
        }
    })();

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <div className={styles.bookingCode}>{detail?.bookingCode || `Booking ${bookingId.slice(0, 8)}`}</div>
                        <h2 className={styles.modalTitle}>
                            {detail?.tour?.title || 'Đang tải...'}
                        </h2>
                        <div className={styles.subTitle}>
                            Khách: <strong>{detail?.customer?.fullName || '—'}</strong>
                            {detail?.session?.startDate && (
                                <span className={styles.dot}>•</span>
                            )}
                            {detail?.session?.startDate && (
                                <span>Khởi hành {formatDate(detail.session.startDate)}</span>
                            )}
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        {statusInfo && (
                            <span className={`${styles.statusBadge} ${styles[statusInfo.cls]}`}>
                                {statusInfo.label}
                            </span>
                        )}
                        {detail?.hasRefundPending && (
                            <span className={`${styles.statusBadge} ${styles.statusRefundReq}`}>
                                Yêu cầu hoàn tiền
                            </span>
                        )}
                        <button className={styles.closeBtn} onClick={onClose} title="Đóng">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                </div>

                <div className={styles.tabs}>
                    {[
                        { key: 'overview', label: 'Tổng quan', icon: 'dashboard' },
                        { key: 'contact', label: 'Khách & liên hệ', icon: 'group' },
                        { key: 'finance', label: 'Tài chính', icon: 'account_balance_wallet' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="material-icons-round" style={{ fontSize: 18 }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.body}>
                    {loading && <div className={styles.loadingNote}>Đang tải dữ liệu...</div>}
                    {errorMsg && (
                        <div className={`${styles.banner} ${styles.bannerError}`}>
                            <span className="material-icons-round">error_outline</span>
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                            <span className="material-icons-round">check_circle</span>
                            {successMsg}
                        </div>
                    )}

                    {!loading && detail && activeTab === 'overview' && (
                        <div className={styles.section}>
                            <div className={styles.infoGrid}>
                                <InfoBlock label="Tour" value={detail.tour?.title || '—'} hint={detail.tour?.tourCode}>
                                    {detail.tour?.thumbnailUrl && (
                                        <img src={detail.tour.thumbnailUrl} alt="" className={styles.thumb} />
                                    )}
                                </InfoBlock>
                                <InfoBlock
                                    label="Lịch khởi hành"
                                    value={detail.session ? `${formatDate(detail.session.startDate)} → ${formatDate(detail.session.endDate)}` : '—'}
                                    hint={detail.session && `Đã đặt ${detail.session.currentParticipants}/${detail.session.maxParticipants} chỗ`}
                                />
                                <InfoBlock label="Số khách" value={`${detail.guestCount || 0} người`} />
                                <InfoBlock label="Trạng thái thanh toán" value={paymentLabel || '—'} />
                            </div>

                            <div className={styles.priceCard}>
                                <div className={styles.priceRow}>
                                    <span>Tổng tiền</span>
                                    <strong>{formatVnd(detail.totalAmount)}</strong>
                                </div>
                                {detail.discountAmount && Number(detail.discountAmount) > 0 && (
                                    <div className={styles.priceRow}>
                                        <span>Giảm giá {detail.promotion?.code && `(${detail.promotion.code})`}</span>
                                        <span className={styles.discount}>- {formatVnd(detail.discountAmount)}</span>
                                    </div>
                                )}
                                <div className={styles.priceRow}>
                                    <span>Đã thanh toán</span>
                                    <span className={styles.paidText}>{formatVnd(detail.paidAmount)}</span>
                                </div>
                                {Number(detail.refundedAmount || 0) > 0 && (
                                    <div className={styles.priceRow}>
                                        <span>Đã hoàn tiền</span>
                                        <span className={styles.refundText}>{formatVnd(detail.refundedAmount)}</span>
                                    </div>
                                )}
                                <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                                    <span>Còn lại</span>
                                    <strong className={Number(detail.balanceAmount) > 0 ? styles.balanceDue : styles.balanceOk}>
                                        {formatVnd(detail.balanceAmount)}
                                    </strong>
                                </div>
                            </div>

                            {allowedStatusButtons.length > 0 && (
                                <div className={styles.statusActions}>
                                    <span className={styles.actionLabel}>Cập nhật trạng thái:</span>
                                    <div className={styles.actionBtnRow}>
                                        {allowedStatusButtons.map((s) => (
                                            <button
                                                key={s}
                                                className={`${styles.actionBtn} ${styles[`btn_${s}`] || ''}`}
                                                onClick={() => handleStatusChange(s)}
                                                disabled={submitting}
                                            >
                                                {STATUS_INFO[s]?.label || s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.subHeader}>Ghi chú khách</div>
                            <div className={styles.noteBox}>
                                {detail.specialRequests || 'Khách không có yêu cầu đặc biệt.'}
                            </div>
                        </div>
                    )}

                    {!loading && detail && activeTab === 'contact' && (
                        <div className={styles.section}>
                            <div className={styles.infoGrid}>
                                <InfoBlock label="Họ tên KH" value={detail.customer?.fullName || '—'} />
                                <InfoBlock label="Email" value={detail.customer?.email || '—'} />
                                <InfoBlock label="SĐT khách hàng" value={detail.customer?.phone || '—'} />
                                <InfoBlock label="SĐT chuyến đi" value={detail.contactPhone || '—'} />
                                <InfoBlock label="Người thân (khẩn cấp)" value={detail.emergencyContactName || '—'} />
                                <InfoBlock label="SĐT người thân" value={detail.emergencyContactPhone || '—'} />
                                <InfoBlock label="Điểm đón" value={detail.pickupAddress || '—'} fullWidth />
                            </div>

                            <div className={styles.subHeader}>Danh sách khách đi tour ({detail.guests?.length || 0})</div>
                            {(detail.guests || []).length === 0 ? (
                                <div className={styles.noteBox}>Chưa có thông tin chi tiết từng khách.</div>
                            ) : (
                                <table className={styles.guestTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Họ tên</th>
                                            <th>CCCD/CMND</th>
                                            <th>Ngày sinh</th>
                                            <th>Tuổi khi khởi hành</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.guests.map((g, idx) => (
                                            <tr key={g.id || idx}>
                                                <td>{idx + 1}</td>
                                                <td>{g.fullName}</td>
                                                <td>{g.maskedIdNumber || '—'}</td>
                                                <td>{formatDate(g.dateOfBirth)}</td>
                                                <td>{g.ageAtDeparture != null ? `${g.ageAtDeparture} tuổi` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {!loading && detail && activeTab === 'finance' && (
                        <div className={styles.section}>
                            <div className={styles.subHeader}>Lịch sử thanh toán ({detail.payments?.length || 0})</div>
                            {(detail.payments || []).length === 0 ? (
                                <div className={styles.noteBox}>Chưa có thanh toán nào.</div>
                            ) : (
                                <table className={styles.guestTable}>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Cổng</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.payments.map((p) => (
                                            <tr key={p.id}>
                                                <td className={styles.mono}>{p.orderId}</td>
                                                <td>{p.provider}</td>
                                                <td>{formatVnd(p.amount)}</td>
                                                <td>
                                                    <span className={`${styles.payStatus} ${styles[`pay_${p.status}`] || ''}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td>{formatDateTime(p.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {Number(detail.balanceAmount) > 0 && detail.status !== 'cancelled' && (
                                <form className={styles.manualPayBox} onSubmit={handleMarkPaid}>
                                    <div className={styles.subHeader} style={{ marginTop: 0 }}>
                                        Ghi nhận thanh toán thủ công
                                    </div>
                                    <p className={styles.muted}>
                                        Dùng khi nhận chuyển khoản / thu tiền mặt. Để trống "Số tiền" để ghi nhận đủ số dư còn lại ({formatVnd(detail.balanceAmount)}).
                                    </p>
                                    <div className={styles.manualRow}>
                                        <input
                                            type="number"
                                            placeholder={`Số tiền (mặc định ${detail.balanceAmount})`}
                                            value={manualAmount}
                                            onChange={(e) => setManualAmount(e.target.value)}
                                            className={styles.formInput}
                                            min={0}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ghi chú (số biên lai, mã GD...)"
                                            value={manualNote}
                                            onChange={(e) => setManualNote(e.target.value)}
                                            className={styles.formInput}
                                        />
                                        <button
                                            type="submit"
                                            className={`${styles.actionBtn} ${styles.btn_paid}`}
                                            disabled={submitting}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: 18 }}>account_balance_wallet</span>
                                            Ghi nhận
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.subHeader}>Yêu cầu hoàn tiền ({detail.refunds?.length || 0})</div>
                            {(detail.refunds || []).length === 0 ? (
                                <div className={styles.noteBox}>Chưa có yêu cầu hoàn tiền.</div>
                            ) : (
                                <table className={styles.guestTable}>
                                    <thead>
                                        <tr>
                                            <th>Số tiền</th>
                                            <th>Lý do</th>
                                            <th>Trạng thái</th>
                                            <th>Người xử lý</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.refunds.map((r) => (
                                            <tr key={r.id}>
                                                <td>{formatVnd(r.amount)}</td>
                                                <td className={styles.reasonCell} title={r.reason}>{r.reason || '—'}</td>
                                                <td>
                                                    <span className={`${styles.refundStatus} ${styles[`refund_${r.status}`] || ''}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td>{r.processedByName || '—'}</td>
                                                <td>{formatDateTime(r.processedAt || r.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {pendingRefund && (
                                <div className={styles.refundActionBox}>
                                    <div className={styles.subHeader} style={{ marginTop: 0 }}>
                                        Xử lý yêu cầu hoàn tiền
                                    </div>
                                    <p className={styles.muted}>
                                        Số tiền KH yêu cầu hoàn: <strong>{formatVnd(pendingRefund.amount)}</strong>.
                                        Để trống "Số tiền duyệt" để duyệt nguyên số trên.
                                    </p>
                                    <div className={styles.manualRow}>
                                        <input
                                            type="number"
                                            placeholder={`Số tiền duyệt (mặc định ${pendingRefund.amount})`}
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                            className={styles.formInput}
                                            min={0}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ghi chú admin (bắt buộc khi từ chối)"
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            className={styles.formInput}
                                        />
                                    </div>
                                    <div className={styles.refundActionRow}>
                                        <button
                                            type="button"
                                            className={`${styles.actionBtn} ${styles.btn_cancelled}`}
                                            disabled={submitting}
                                            onClick={handleRejectRefund}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
                                            Từ chối
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.actionBtn} ${styles.btn_paid}`}
                                            disabled={submitting}
                                            onClick={handleApproveRefund}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: 18 }}>verified</span>
                                            Duyệt hoàn tiền
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <span className={styles.footerMeta}>
                        Tạo: {formatDateTime(detail?.createdAt)}
                        {detail?.updatedAt && (
                            <>
                                <span className={styles.dot}>•</span>
                                Cập nhật: {formatDateTime(detail.updatedAt)}
                            </>
                        )}
                    </span>
                    <button className={styles.closeFooterBtn} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

const InfoBlock = ({ label, value, hint, fullWidth, children }) => (
    <div className={`${styles.infoBlock} ${fullWidth ? styles.infoBlockFull : ''}`}>
        <div className={styles.infoLabel}>{label}</div>
        <div className={styles.infoValue}>
            {children}
            <span>{value}</span>
        </div>
        {hint && <div className={styles.infoHint}>{hint}</div>}
    </div>
);

export default BookingDetailModal;
