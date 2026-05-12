import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import BookingDetailModal from '../components/BookingDetailModal';
import {
    getAdminBookingStats,
    listAdminBookings,
} from '../../../api/adminBookings';
import styles from './BookingManagement.module.css';

const STATUS_CONFIG = {
    pending: { label: 'Chờ thanh toán', className: 'statusPending' },
    paid: { label: 'Đã thanh toán', className: 'statusPaid' },
    confirmed: { label: 'Đã xác nhận', className: 'statusConfirmed' },
    completed: { label: 'Đã hoàn thành', className: 'statusCompleted' },
    cancelled: { label: 'Đã huỷ', className: 'statusCancelled' },
};

const PAY_CONFIG = {
    paid: { label: 'Đầy đủ', className: 'payFull' },
    partial: { label: 'Đã cọc', className: 'payDeposit' },
    unpaid: { label: 'Chưa thanh toán', className: 'payUnpaid' },
    refunded: { label: 'Đã hoàn tiền', className: 'payRefunded' },
    refund_pending: { label: 'Chờ hoàn tiền', className: 'payPendingRefund' },
};

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80';

const FILTER_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ thanh toán' },
    { key: 'paid', label: 'Đã thanh toán' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'refund_pending', label: 'Yêu cầu hoàn tiền' },
    { key: 'completed', label: 'Đã hoàn thành' },
    { key: 'cancelled', label: 'Đã huỷ' },
];

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

const formatVndCompact = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const num = Number(value);
    if (Number.isNaN(num)) return '0';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
};

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
};

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const data = await listAdminBookings({ size: 100 });
            setBookings(data.content);
        } catch (err) {
            setErrorMsg(
                err?.message ||
                'Không tải được danh sách booking. Cần đăng nhập với quyền admin để xem dữ liệu thật.'
            );
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const data = await getAdminBookingStats();
            setStats(data);
        } catch {
            setStats(null);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [fetchBookings, fetchStats]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const filteredBookings = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return bookings.filter((b) => {
            if (filterStatus !== 'all') {
                if (filterStatus === 'refund_pending') {
                    if (!b.hasRefundPending) return false;
                } else if (b.status !== filterStatus) {
                    return false;
                }
            }
            if (!q) return true;
            return (
                (b.bookingCode || '').toLowerCase().includes(q) ||
                (b.customer?.fullName || '').toLowerCase().includes(q) ||
                (b.customer?.email || '').toLowerCase().includes(q) ||
                (b.tour?.title || '').toLowerCase().includes(q) ||
                (b.tour?.tourCode || '').toLowerCase().includes(q)
            );
        });
    }, [bookings, filterStatus, searchQuery]);

    const tabCounts = useMemo(() => {
        const counts = { all: bookings.length, refund_pending: 0 };
        for (const b of bookings) {
            counts[b.status] = (counts[b.status] || 0) + 1;
            if (b.hasRefundPending) counts.refund_pending += 1;
        }
        return counts;
    }, [bookings]);

    const handleRefresh = () => {
        fetchBookings();
        fetchStats();
    };

    const handleBookingUpdated = (updated) => {
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
        fetchStats();
    };

    const columns = useMemo(() => [
        {
            key: 'bookingCode',
            label: 'Mã Booking',
            render: (val) => <span className={styles.bookingIdCell}>{val}</span>,
        },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (_, row) => (
                <div>
                    <div className={styles.customerName}>{row.customer?.fullName || '—'}</div>
                    <div className={styles.customerEmail}>{row.customer?.email || '—'}</div>
                </div>
            ),
        },
        {
            key: 'tour',
            label: 'Tour',
            render: (_, row) => (
                <div className={styles.tourCell}>
                    <img
                        src={row.tour?.thumbnailUrl || PLACEHOLDER_IMG}
                        alt=""
                        className={styles.tourThumb}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                    />
                    <div>
                        <div className={styles.tourName}>{row.tour?.title || '—'}</div>
                        <div className={styles.tourCode}>
                            {row.tour?.tourCode || '—'}
                            {row.session?.startDate && (
                                <span className={styles.dot}> • </span>
                            )}
                            {row.session?.startDate && (
                                <span>KH {formatDate(row.session.startDate)}</span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'guestCount',
            label: 'Khách',
            render: (val) => `${val || 0} người`,
        },
        {
            key: 'createdAt',
            label: 'Ngày đặt',
            sortable: true,
            render: (val) => formatDate(val),
        },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            sortable: true,
            render: (val, row) => (
                <div>
                    <div className={styles.amountTotal}>{formatVnd(val)}</div>
                    {Number(row.balanceAmount || 0) > 0 && (
                        <div className={styles.amountBalance}>Còn {formatVnd(row.balanceAmount)}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'paymentClass',
            label: 'Thanh toán',
            render: (val) => {
                const cfg = PAY_CONFIG[val] || PAY_CONFIG.unpaid;
                return (
                    <span className={`${styles.payBadge} ${styles[cfg.className]}`}>
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val, row) => {
                const cfg = STATUS_CONFIG[val] || STATUS_CONFIG.pending;
                return (
                    <div className={styles.statusCell}>
                        <span className={`${styles.statusBadge} ${styles[cfg.className]}`}>
                            {cfg.label}
                        </span>
                        {row.hasRefundPending && (
                            <span className={`${styles.statusBadge} ${styles.statusRefundReq}`}>
                                YC hoàn tiền
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        title="Xem chi tiết & xử lý"
                        onClick={() => setSelectedBookingId(row.id)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Đặt Chỗ</h1>
                    <p className={styles.pageSubtitle}>
                        Theo dõi booking, xử lý thanh toán & hoàn tiền theo nghiệp vụ chuẩn Flourish Travel.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.refreshBtn} onClick={handleRefresh} disabled={loading} title="Tải lại">
                        <span className="material-icons-round" style={{ fontSize: 18 }}>refresh</span>
                        Tải lại
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className={`${styles.banner} ${styles.bannerError}`}>
                    <span className="material-icons-round">error_outline</span>
                    <span>{errorMsg}</span>
                </div>
            )}
            {successMsg && (
                <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                    <span className="material-icons-round">check_circle</span>
                    <span>{successMsg}</span>
                </div>
            )}

            <div className={styles.statsGrid}>
                <StatCard
                    icon="confirmation_number"
                    label="Booking tháng này"
                    value={stats?.totalBookings ?? bookings.length}
                    color="green"
                />
                <StatCard
                    icon="payments"
                    label="Doanh thu tháng"
                    value={`₫${formatVndCompact(stats?.monthlyRevenue)}`}
                    color="blue"
                />
                <StatCard
                    icon="account_balance"
                    label="Công nợ phải thu"
                    value={`₫${formatVndCompact(stats?.pendingDeposit)}`}
                    color="orange"
                />
                <StatCard
                    icon="cancel"
                    label="Yêu cầu hoàn tiền"
                    value={stats?.pendingRefundRequests ?? tabCounts.refund_pending}
                    color="red"
                />
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.filterTab} ${filterStatus === tab.key ? styles.filterTabActive : ''}`}
                            onClick={() => setFilterStatus(tab.key)}
                        >
                            {tab.label}
                            <span className={styles.tabCount}>{tabCounts[tab.key] || 0}</span>
                        </button>
                    ))}
                </div>
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                    <input
                        type="text"
                        placeholder="Mã booking / khách / tour..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>
            </div>

            {loading && bookings.length === 0 ? (
                <div className={styles.loadingNote}>Đang tải dữ liệu booking...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredBookings}
                    selectable={false}
                    totalLabel="booking"
                    emptyMessage="Không có booking nào khớp bộ lọc."
                />
            )}

            <BookingDetailModal
                bookingId={selectedBookingId}
                onClose={() => setSelectedBookingId(null)}
                onUpdated={(updated) => {
                    handleBookingUpdated(updated);
                    setSuccessMsg('Đã cập nhật booking thành công.');
                }}
            />
        </div>
    );
};

export default BookingManagement;
