import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Wallet, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listMyBookings } from '../../api/bookings';
import styles from './UserAccount.module.css';

function formatVnd(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '—';
    return `${v.toLocaleString('vi-VN')} ₫`;
}

function paymentLabel(method) {
    const m = String(method || '').toLowerCase();
    if (m.includes('momo') || m === 'ewallet') return 'Ví MoMo';
    if (m === 'payos') return 'PayOS';
    if (m === 'bank') return 'Chuyển khoản';
    if (m === 'card') return 'Thẻ';
    return method || '—';
}

const MyWallet = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return undefined;
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const rows = await listMyBookings();
                if (alive) setBookings(Array.isArray(rows) ? rows : []);
            } catch (e) {
                if (alive) {
                    setBookings([]);
                    setError(e.message || 'Không tải được lịch sử thanh toán.');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [user]);

    const summary = useMemo(() => {
        const paid = bookings.filter((b) => ['paid', 'confirmed', 'completed'].includes(
            String(b.bookingStatus || '').toLowerCase()
        ));
        const pending = bookings.filter((b) => String(b.bookingStatus || '').toLowerCase() === 'pending');
        const totalPaid = paid.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
        const totalPending = pending.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
        return { paidCount: paid.length, pendingCount: pending.length, totalPaid, totalPending };
    }, [bookings]);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <Wallet size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Ví & Thanh toán
                    </h1>
                    <p className={styles.subtitle}>
                        Theo dõi các giao dịch đặt tour và phương thức thanh toán của bạn.
                    </p>
                </header>

                <div className={styles.card}>
                    <div className={styles.cardMeta}>
                        <span>Đã thanh toán: <strong>{summary.paidCount}</strong> đơn</span>
                        <span className={styles.amount}>{formatVnd(summary.totalPaid)}</span>
                    </div>
                    {summary.pendingCount > 0 && (
                        <p className={styles.cardMeta} style={{ marginTop: 8 }}>
                            Chờ thanh toán: {summary.pendingCount} đơn · {formatVnd(summary.totalPending)}
                        </p>
                    )}
                </div>

                {loading && <p className={styles.state}>Đang tải...</p>}
                {error && <p className={`${styles.state} ${styles.stateError}`}>{error}</p>}

                {!loading && !error && bookings.length === 0 && (
                    <div className={styles.empty}>
                        <p>Chưa có giao dịch nào.</p>
                        <Link to="/tours" className={styles.linkBtn}>
                            Khám phá tour <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {!loading && bookings.map((b) => (
                    <div key={b.id} className={styles.card}>
                        <div className={styles.cardTitle}>{b.tourTitle || 'Tour Flourish'}</div>
                        <div className={styles.cardMeta}>
                            <span className={styles.badge}>{b.bookingStatus || '—'}</span>
                            <span><CreditCard size={14} style={{ display: 'inline' }} /> {paymentLabel(b.paymentMethod)}</span>
                            <span className={styles.amount}>{formatVnd(b.totalAmount)}</span>
                        </div>
                        <Link to={`/my-journey/booking/${b.bookingId || b.id}`} className={styles.linkBtn}>
                            Xem chi tiết đặt chỗ <ArrowRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWallet;
