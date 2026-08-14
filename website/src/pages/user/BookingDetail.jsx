import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Calendar, Users, Luggage, MessageCircle,
    CreditCard, Phone, MapPinned, AlertCircle, FileText,
} from 'lucide-react';
import styles from './BookingDetail.module.css';
import bangkokImg from '../../assets/di-chuyen-di-lai-thai-lan-2.webp';
import {
    getMyBookingDetail,
    cancelMyBooking,
    requestBookingRefund,
} from '../../api/bookings';
import { getAccessToken } from '../../api/auth';
import { resolveMediaUrl } from '../../api/config';
import FloraCompanion from '../../components/FloraCompanion';
import FloraPostTourFeedback from '../../components/FloraPostTourFeedback';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatInstantVi(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatIsoDateVi(s) {
    if (!s) return '';
    const parts = String(s).split('-');
    if (parts.length < 3) return s;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
}

function formatSessionRange(start, end) {
    if (!start) return '—';
    const a = formatIsoDateVi(start);
    if (!end || end === start) return a;
    return `${a} – ${formatIsoDateVi(end)}`;
}

function formatMoney(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '—';
    return `${v.toLocaleString('de-DE')} VND`;
}

function bookingStatusUi(row) {
    const st = (row?.bookingStatus || '').toLowerCase();
    if (st === 'cancelled') {
        return { label: 'Đã hủy', className: styles.statusCancelled };
    }
    if (st === 'paid') {
        if (row?.refundPending) {
            return { label: 'Hoàn tiền đang xử lý', className: styles.statusPending };
        }
        return { label: 'Đã thanh toán', className: styles.statusPaid };
    }
    if (st === 'pending') {
        return { label: 'Chờ thanh toán', className: styles.statusPending };
    }
    if (st === 'confirmed') {
        return { label: 'Đã xác nhận', className: styles.statusConfirmed };
    }
    if (st === 'completed') {
        return { label: 'Hoàn thành', className: styles.statusPaid };
    }
    return { label: row?.bookingStatus || '—', className: styles.statusConfirmed };
}

function paymentStatusLabel(s) {
    const x = (s || '').toLowerCase();
    if (x === 'pending') return 'Chờ thanh toán';
    if (x === 'paid' || x === 'success') return 'Đã thanh toán';
    if (x === 'failed') return 'Thất bại';
    if (x === 'refunded') return 'Đã hoàn tiền';
    return s || '—';
}

function refundStatusLabel(s) {
    const x = (s || '').toLowerCase();
    if (x === 'pending') return 'Đang xử lý';
    if (x === 'approved' || x === 'completed') return 'Đã duyệt';
    if (x === 'rejected') return 'Từ chối';
    return s || '—';
}

function todayIsoLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function canRequestRefund(row) {
    if (row?.refundEligible === false) return false;
    if (row?.refundEligible === true) return true;
    const st = (row?.bookingStatus || '').toLowerCase();
    if (st !== 'paid' || row?.refundPending) return false;
    const start = row?.sessionStartDate;
    if (!start) return false;
    return todayIsoLocal() < start;
}

function canOpenTourChat(row) {
    const st = (row?.bookingStatus || '').toLowerCase();
    return ['paid', 'confirmed', 'completed'].includes(st);
}

const BookingDetail = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        if (!bookingId || !UUID_RE.test(bookingId)) {
            setError('Mã đặt chỗ không hợp lệ.');
            setDetail(null);
            setLoading(false);
            return;
        }
        if (!getAccessToken()) {
            navigate(`/login?return=${encodeURIComponent(`/my-journey/booking/${bookingId}`)}`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const d = await getMyBookingDetail(bookingId);
            setDetail(d);
        } catch (e) {
            if (e.status === 401) {
                navigate(`/login?return=${encodeURIComponent(`/my-journey/booking/${bookingId}`)}`);
                return;
            }
            setDetail(null);
            setError(e.message || 'Không tải được chi tiết đơn.');
        } finally {
            setLoading(false);
        }
    }, [bookingId, navigate]);

    useEffect(() => {
        load();
    }, [load]);

    const handleCancel = async () => {
        if (!bookingId || busy) return;
        if (!window.confirm('Hủy đơn này? Chỉ áp dụng khi đơn đang chờ thanh toán.')) return;
        setBusy(true);
        setActionMsg('');
        try {
            await cancelMyBooking(bookingId);
            setActionMsg('Đã hủy đơn.');
            await load();
        } catch (e) {
            setActionMsg(e.message || 'Không hủy được đơn.');
        } finally {
            setBusy(false);
        }
    };

    const handleRefund = async () => {
        if (!bookingId || busy) return;
        const reason = window.prompt('Lý do hoàn tiền (bắt buộc, tối thiểu 8 ký tự):', '');
        if (reason == null) return;
        if (!reason.trim() || reason.trim().length < 8) {
            setActionMsg('Lý do hoàn tiền cần ít nhất 8 ký tự, mô tả rõ ràng.');
            return;
        }
        setBusy(true);
        setActionMsg('');
        try {
            await requestBookingRefund(bookingId, reason.trim());
            setActionMsg('Đã gửi yêu cầu hoàn tiền. Admin sẽ xác nhận lý do rồi PayOS chi hộ về tài khoản bạn đã thanh toán.');
            await load();
        } catch (e) {
            setActionMsg(e.message || 'Không gửi được yêu cầu.');
        } finally {
            setBusy(false);
        }
    };

    const handlePolicy = () => {
        if (!detail) return;
        navigate('/cancellation-policy', {
            state: {
                booking: {
                    id: detail.bookingId,
                    email: detail.customerEmail || '',
                    tourTitle: detail.tourTitle,
                    orderId: detail.paymentOrderId,
                },
            },
        });
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <p className={styles.loading}>Đang tải chi tiết đơn...</p>
                </div>
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.backRow}>
                        <Link to="/my-journey" className={styles.backLink}>
                            <ArrowLeft style={{ width: 18, height: 18 }} />
                            Quay lại Chuyến đi của tôi
                        </Link>
                    </div>
                    <div className={styles.errorBox}>{error || 'Không có dữ liệu.'}</div>
                </div>
            </div>
        );
    }

    const st = bookingStatusUi(detail);
    const thumb = resolveMediaUrl(detail.tourThumbnailUrl) || bangkokImg;
    const duration =
        detail.tourDurationDays != null && detail.tourDurationNights != null
            ? `${detail.tourDurationDays} ngày / ${detail.tourDurationNights} đêm`
            : detail.tourDurationDays != null
                ? `${detail.tourDurationDays} ngày`
                : null;

    const showPay = Boolean(detail.continuePaymentUrl);
    const canCancel = (detail.bookingStatus || '').toLowerCase() === 'pending';
    const canRefund = canRequestRefund(detail);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.backRow}>
                    <Link to="/my-journey" className={styles.backLink}>
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                        Quay lại Chuyến đi của tôi
                    </Link>
                </div>

                {actionMsg ? (
                    <div className={styles.section} style={{ marginTop: 0, marginBottom: 16 }}>
                        <p className={styles.value} style={{ margin: 0 }}>{actionMsg}</p>
                    </div>
                ) : null}

                <FloraCompanion bookingId={detail.bookingId} />

                <FloraPostTourFeedback bookingId={detail.bookingId} />

                <div className={styles.hero}>
                    <img className={styles.heroImg} src={thumb} alt={detail.tourTitle || 'Tour'} />
                    <div className={styles.heroBody}>
                        <div className={styles.heroTop}>
                            <div>
                                <h1 className={styles.title}>{detail.tourTitle || 'Đặt tour'}</h1>
                                <div className={styles.meta}>
                                    <span className={styles.metaItem}>
                                        <MapPin style={{ width: 16, height: 16 }} />
                                        {detail.categoryName || '—'}
                                    </span>
                                    {detail.tourId ? (
                                        <Link to={`/tours/${detail.tourId}`} className={styles.btnOutline} style={{ padding: '6px 12px', fontSize: 12 }}>
                                            Xem trang tour
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                            <span className={`${styles.statusBadge} ${st.className}`}>{st.label}</span>
                        </div>

                        <div className={styles.meta}>
                            <span className={styles.metaItem}>
                                <Calendar style={{ width: 16, height: 16 }} />
                                {formatSessionRange(detail.sessionStartDate, detail.sessionEndDate)}
                            </span>
                            <span className={styles.metaItem}>
                                <Users style={{ width: 16, height: 16 }} />
                                {detail.guestCount ?? 0} khách
                            </span>
                            {duration ? (
                                <span className={styles.metaItem}>
                                    <Luggage style={{ width: 16, height: 16 }} />
                                    {duration}
                                </span>
                            ) : null}
                        </div>

                        {detail.guideName ? (
                            <p className={styles.value} style={{ marginTop: 12 }}>
                                <strong>HDV:</strong> {detail.guideName}
                            </p>
                        ) : null}

                        {detail.sessionMaxParticipants != null ? (
                            <p className={styles.value} style={{ marginTop: 8, color: '#6b7280' }}>
                                Chỗ trên lịch: {detail.sessionCurrentParticipants ?? '—'} / {detail.sessionMaxParticipants}
                            </p>
                        ) : null}

                        <div className={styles.priceBlock}>
                            <div className={styles.priceRow}>
                                <span className={styles.priceLabel}>Tổng thanh toán</span>
                                <span className={styles.priceValue}>{formatMoney(detail.totalAmount)}</span>
                            </div>
                            {detail.discountAmount != null && Number(detail.discountAmount) > 0 ? (
                                <p className={styles.discountNote}>
                                    Đã giảm: {formatMoney(detail.discountAmount)}
                                    {detail.promotionCode ? ` (mã ${detail.promotionCode})` : ''}
                                </p>
                            ) : detail.promotionCode ? (
                                <p className={styles.discountNote}>Mã khuyến mãi: {detail.promotionCode}</p>
                            ) : null}
                            <p className={styles.value} style={{ marginTop: 8, color: '#6b7280' }}>
                                Đặt lúc {formatInstantVi(detail.bookedAt)}
                                {detail.updatedAt && detail.updatedAt !== detail.bookedAt
                                    ? ` · Cập nhật ${formatInstantVi(detail.updatedAt)}`
                                    : ''}
                            </p>
                            <p className={styles.value} style={{ marginTop: 4 }}>
                                Thanh toán: <strong>{paymentStatusLabel(detail.paymentStatus)}</strong>
                                {detail.paymentOrderId ? ` · Mã: ${detail.paymentOrderId}` : ''}
                            </p>
                        </div>

                        <div className={styles.actions}>
                            {showPay ? (
                                <a href={detail.continuePaymentUrl} className={styles.btnPrimary}>
                                    <CreditCard style={{ width: 18, height: 18 }} />
                                    Thanh toán ngay
                                </a>
                            ) : null}
                            {canOpenTourChat(detail) ? (
                                <Link to={`/chat/${detail.bookingId}`} className={styles.btnOutline}>
                                    <MessageCircle style={{ width: 18, height: 18 }} />
                                    Phòng chat đoàn
                                </Link>
                            ) : null}
                            <button type="button" className={styles.btnMuted} onClick={handlePolicy}>
                                <FileText style={{ width: 18, height: 18 }} />
                                Chính sách hủy / hoàn
                            </button>
                            {canCancel ? (
                                <button type="button" className={styles.btnDanger} onClick={handleCancel} disabled={busy}>
                                    Hủy đơn chờ thanh toán
                                </button>
                            ) : null}
                            {canRefund ? (
                                <button type="button" className={styles.btnDanger} onClick={handleRefund} disabled={busy}>
                                    Yêu cầu hoàn tiền
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Liên hệ & đón trả</h2>
                    <div className={styles.grid2}>
                        <div>
                            <span className={styles.label}>Email tài khoản</span>
                            <p className={styles.value}>{detail.customerEmail || '—'}</p>
                        </div>
                        <div>
                            <span className={styles.label}>SĐT tài khoản</span>
                            <p className={styles.value}>
                                <Phone style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                {detail.customerPhone || '—'}
                            </p>
                        </div>
                        <div>
                            <span className={styles.label}>SĐT liên hệ chuyến</span>
                            <p className={styles.value}>{detail.contactPhone || detail.customerPhone || '—'}</p>
                        </div>
                        <div>
                            <span className={styles.label}>Điểm đón</span>
                            <p className={styles.value}>
                                <MapPinned style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                {detail.pickupAddress || '—'}
                            </p>
                        </div>
                        <div>
                            <span className={styles.label}>Liên hệ khẩn cấp</span>
                            <p className={styles.value}>
                                {detail.emergencyContactName || detail.emergencyContactPhone
                                    ? `${detail.emergencyContactName || ''}${detail.emergencyContactName && detail.emergencyContactPhone ? ' · ' : ''}${detail.emergencyContactPhone || ''}`
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {detail.specialRequests ? (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Ghi chú / yêu cầu đặc biệt</h2>
                        <p className={styles.value} style={{ whiteSpace: 'pre-wrap' }}>{detail.specialRequests}</p>
                    </div>
                ) : null}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Danh sách khách</h2>
                    {Array.isArray(detail.guests) && detail.guests.length > 0 ? (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Họ tên</th>
                                        <th>Giấy tờ</th>
                                        <th>Hộ chiếu hết hạn</th>
                                        <th>Ngày sinh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.guests.map((g, i) => (
                                        <tr key={g.guestId || i}>
                                            <td>{i + 1}</td>
                                            <td>{g.fullName}</td>
                                            <td>
                                                {g.maskedPassportNumber
                                                    ? `Hộ chiếu ${g.maskedPassportNumber}`
                                                    : g.maskedIdNumber
                                                      ? `CCCD ${g.maskedIdNumber}`
                                                      : '—'}
                                            </td>
                                            <td>{g.passportExpiry ? formatIsoDateVi(g.passportExpiry) : '—'}</td>
                                            <td>{g.dateOfBirth ? formatIsoDateVi(g.dateOfBirth) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : detail.guestNames ? (
                        <p className={styles.value}>{detail.guestNames}</p>
                    ) : (
                        <p className={styles.emptyLine}>Chưa khai báo chi tiết từng khách.</p>
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Lịch sử thanh toán</h2>
                    {Array.isArray(detail.payments) && detail.payments.length > 0 ? (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Số tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Cổng</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.payments.map((p) => (
                                        <tr key={p.paymentId}>
                                            <td>{p.orderId}</td>
                                            <td>{formatMoney(p.amount)}</td>
                                            <td>{paymentStatusLabel(p.status)}</td>
                                            <td>{p.provider || '—'}</td>
                                            <td>{formatInstantVi(p.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.emptyLine}>Chưa có giao dịch thanh toán.</p>
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Hoàn tiền</h2>
                    {Array.isArray(detail.refunds) && detail.refunds.length > 0 ? (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Số tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Lý do</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.refunds.map((r) => (
                                        <tr key={r.refundId}>
                                            <td>{formatMoney(r.amount)}</td>
                                            <td>{refundStatusLabel(r.status)}</td>
                                            <td>{r.reason || '—'}</td>
                                            <td>{formatInstantVi(r.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.emptyLine}>
                            {detail.refundPending ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <AlertCircle style={{ width: 16, height: 16, color: '#b45309' }} />
                                    Có yêu cầu hoàn tiền đang chờ xử lý.
                                </span>
                            ) : (
                                'Chưa có yêu cầu hoàn tiền.'
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
