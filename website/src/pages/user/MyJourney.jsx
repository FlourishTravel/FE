import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Users, CheckCircle, Eye,
    Trash2, Luggage, ArrowRight, MessageCircle, LogIn, FileText,
} from 'lucide-react';
import bangkokImg from '../../assets/di-chuyen-di-lai-thai-lan-2.webp';
import styles from './MyJourney.module.css';
import { listMyBookings } from '../../api/bookings';
import { getAccessToken } from '../../api/auth';
import { resolveMediaUrl } from '../../api/config';

function formatInstantVi(iso) {
    if (!iso) return '';
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

function formatTourDuration(days, nights) {
    if (days != null && nights != null) return `${days} ngày / ${nights} đêm`;
    if (days != null) return `${days} ngày`;
    return null;
}

function canOpenTourChat(booking) {
    const s = (booking.bookingStatus || '').toLowerCase();
    return ['paid', 'confirmed', 'completed'].includes(s);
}

function statusUi(booking) {
    const st = (booking.bookingStatus || '').toLowerCase();
    if (st === 'cancelled') {
        return { label: 'Đã hủy', className: styles.statusCancelled };
    }
    if (st === 'paid') {
        if (booking.refundPending) {
            return { label: 'Hoàn tiền đang xử lý', className: styles.statusPending };
        }
        return { label: 'Đã thanh toán', className: styles.statusPaid };
    }
    if (st === 'pending') {
        return { label: 'Chờ thanh toán', className: styles.statusPending };
    }
    return { label: booking.bookingStatus || '—', className: styles.statusConfirmed };
}

const MyJourney = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [needLogin, setNeedLogin] = useState(false);

    const load = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setNeedLogin(true);
            setBookings([]);
            setLoading(false);
            setError('');
            return;
        }
        setNeedLogin(false);
        setLoading(true);
        setError('');
        try {
            const list = await listMyBookings();
            setBookings(Array.isArray(list) ? list : []);
        } catch (e) {
            if (e.status === 401) {
                setNeedLogin(true);
                setBookings([]);
            } else {
                setError(e.message || 'Không tải được danh sách đặt chỗ.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handlePolicy = (booking) => {
        navigate('/cancellation-policy', {
            state: {
                booking: {
                    id: booking.bookingId,
                    email: booking.customerEmail || '',
                    tourTitle: booking.tourTitle,
                    orderId: booking.paymentOrderId,
                },
            },
        });
    };

    const getImage = (booking) => {
        const u = resolveMediaUrl(booking.tourThumbnailUrl);
        if (u) return u;
        return bangkokImg;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>Chuyến đi của tôi</h1>
                        <p className={styles.pageSubtitle}>
                            Xem đơn đặt tour, lịch khởi hành và trạng thái thanh toán
                        </p>
                    </div>
                    {!loading && bookings.length > 0 && (
                        <span className={styles.bookingCount}>
                            {bookings.length} đặt chỗ
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className={styles.emptyState} style={{ padding: 48 }}>
                        <p className={styles.emptyText}>Đang tải chuyến đi...</p>
                    </div>
                ) : needLogin ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconCircle}>
                            <LogIn className={styles.emptyIcon} />
                        </div>
                        <h2 className={styles.emptyTitle}>Đăng nhập để xem chuyến đi</h2>
                        <p className={styles.emptyText}>
                            Các tour bạn đã đặt được lưu trên tài khoản FlourishTravel. Đăng nhập để xem chi tiết và thanh toán.
                        </p>
                        <Link to="/login" className={styles.emptyBtn}>
                            Đăng nhập
                            <ArrowRight style={{ width: 18, height: 18 }} />
                        </Link>
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText} style={{ color: '#b91c1c' }}>{error}</p>
                        <button
                            type="button"
                            className={styles.emptyBtn}
                            onClick={() => load()}
                        >
                            Thử lại
                        </button>
                    </div>
                ) : bookings.length > 0 ? (
                    <div className={styles.bookingList}>
                        {bookings.map((booking, idx) => {
                            const st = statusUi(booking);
                            const duration = formatTourDuration(booking.tourDurationDays, booking.tourDurationNights);
                            return (
                                <div
                                    key={booking.bookingId}
                                    className={styles.bookingCard}
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <img
                                        src={getImage(booking)}
                                        alt={booking.tourTitle || 'Tour'}
                                        className={styles.cardImage}
                                    />
                                    <div className={styles.cardBody}>
                                        <div>
                                            <div className={styles.cardTop}>
                                                <div>
                                                    <h3 className={styles.tourTitle}>{booking.tourTitle || 'Tour'}</h3>
                                                    <span className={styles.tourLocation}>
                                                        <MapPin className={styles.locationIcon} />
                                                        {booking.categoryName || '—'}
                                                    </span>
                                                </div>
                                                <span className={`${styles.statusBadge} ${st.className}`}>
                                                    <CheckCircle className={styles.statusIcon} />
                                                    {st.label}
                                                </span>
                                            </div>

                                            <div className={styles.cardMeta}>
                                                <span className={styles.metaItem}>
                                                    <Calendar className={styles.metaIcon} />
                                                    {formatSessionRange(booking.sessionStartDate, booking.sessionEndDate)}
                                                </span>
                                                <span className={styles.metaItem}>
                                                    <Users className={styles.metaIcon} />
                                                    {booking.guestCount ?? 0} khách
                                                </span>
                                                {duration ? (
                                                    <span className={styles.metaItem}>
                                                        <Luggage className={styles.metaIcon} />
                                                        {duration}
                                                    </span>
                                                ) : null}
                                            </div>
                                            {booking.paymentOrderId ? (
                                                <p className={styles.bookedDate} style={{ marginTop: 4 }}>
                                                    Mã đơn thanh toán: <strong>{booking.paymentOrderId}</strong>
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className={styles.cardBottom}>
                                            <div className={styles.priceArea}>
                                                <span className={styles.priceLabel}>Tổng thanh toán</span>
                                                <span className={styles.priceValue}>
                                                    {(Number(booking.totalAmount) || 0).toLocaleString('de-DE')} VND
                                                </span>
                                                <span className={styles.bookedDate}>
                                                    Đặt lúc {formatInstantVi(booking.bookedAt)}
                                                </span>
                                            </div>
                                            <div className={styles.cardActions}>
                                                <Link
                                                    to={`/my-journey/booking/${booking.bookingId}`}
                                                    className={styles.btnDetail}
                                                >
                                                    <FileText className={styles.btnDetailIcon} />
                                                    Chi tiết đơn
                                                </Link>
                                                {canOpenTourChat(booking) ? (
                                                    <Link
                                                        to={`/chat/${booking.bookingId}`}
                                                        className={styles.btnChat}
                                                    >
                                                        <MessageCircle className={styles.btnChatIcon} />
                                                        Vào phòng chat
                                                    </Link>
                                                ) : (
                                                    <span
                                                        className={`${styles.btnChat} ${styles.btnChatDisabled}`}
                                                        title="Mở chat sau khi thanh toán thành công hoặc đơn đã được xác nhận."
                                                    >
                                                        <MessageCircle className={styles.btnChatIcon} />
                                                        Phòng chat
                                                    </span>
                                                )}
                                                {booking.tourId ? (
                                                    <Link
                                                        to={`/tours/${booking.tourId}`}
                                                        className={styles.btnViewTour}
                                                    >
                                                        <Eye className={styles.btnViewIcon} />
                                                        Xem tour
                                                    </Link>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    className={styles.btnDelete}
                                                    onClick={() => handlePolicy(booking)}
                                                    title="Hủy tour / chính sách hoàn tiền"
                                                >
                                                    <Trash2 style={{ width: 15, height: 15 }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconCircle}>
                            <Luggage className={styles.emptyIcon} />
                        </div>
                        <h2 className={styles.emptyTitle}>Chưa có chuyến đi nào</h2>
                        <p className={styles.emptyText}>
                            Bạn chưa có đơn đặt tour trên tài khoản này. Khám phá các hành trình và đặt chỗ để xuất hiện tại đây.
                        </p>
                        <Link to="/tours" className={styles.emptyBtn}>
                            Khám phá tour
                            <ArrowRight style={{ width: 18, height: 18 }} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJourney;
