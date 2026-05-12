import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import styles from './Dashboard.module.css';
import { getFinanceOverview } from '../../../api/adminFinance';
import { listAdminBookings } from '../../../api/adminBookings';
import { getAdminCustomerStats } from '../../../api/adminCustomers';

const STATUS_MAP = {
    confirmed: { label: 'Xác nhận', className: 'statusConfirmed' },
    pending: { label: 'Chờ xử lý', className: 'statusPending' },
    paid: { label: 'Đã thanh toán', className: 'statusConfirmed' },
    completed: { label: 'Hoàn thành', className: 'statusConfirmed' },
    cancelled: { label: 'Đã hủy', className: 'statusCancelled' },
};

const formatVnd = (value) => {
    const num = Number(value || 0);
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

const compactBillions = (value) => {
    const num = Number(value || 0);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} Tỷ`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Tr`;
    return new Intl.NumberFormat('vi-VN').format(num);
};

const Dashboard = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [chartPeriod, setChartPeriod] = useState('year');
    const [overview, setOverview] = useState(null);
    const [customerStats, setCustomerStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const revenuePoints = useMemo(() => {
        const all = overview?.revenueByMonth || [];
        if (chartPeriod === 'week') return all.slice(-7);
        if (chartPeriod === 'month') return all.slice(-6);
        return all.slice(-12);
    }, [overview, chartPeriod]);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const [ov, cs, rb] = await Promise.all([
                getFinanceOverview(),
                getAdminCustomerStats(),
                listAdminBookings({ page: 0, size: 5 }),
            ]);
            setOverview(ov);
            setCustomerStats(cs);
            setRecentBookings(rb.content || []);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !revenuePoints.length) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartW = rect.width - padding.left - padding.right;
        const chartH = rect.height - padding.top - padding.bottom;
        const values = revenuePoints.map((d) => Number(d.revenue || 0));
        const maxVal = Math.max(...values, 1) * 1.15;
        const barWidth = (chartW / revenuePoints.length) * 0.55;
        const gap = chartW / revenuePoints.length;

        // Grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(rect.width - padding.right, y);
            ctx.stroke();
            // Y labels
            ctx.fillStyle = '#9ca3af';
            ctx.font = '11px Inter';
            ctx.textAlign = 'right';
            const label = maxVal - (maxVal / 4) * i;
            ctx.fillText(compactBillions(label), padding.left - 8, y + 4);
        }

        // Bars
        revenuePoints.forEach((d, i) => {
            const value = Number(d.revenue || 0);
            const x = padding.left + gap * i + (gap - barWidth) / 2;
            const barH = (value / maxVal) * chartH;
            const y = padding.top + chartH - barH;

            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
            grad.addColorStop(0, '#2ecc71');
            grad.addColorStop(1, '#27ae60');
            ctx.fillStyle = grad;

            // Rounded rect
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();

            // X labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(d.label || d.month || '', x + barWidth / 2, rect.height - padding.bottom + 18);
        });

        // Line overlay
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        revenuePoints.forEach((d, i) => {
            const value = Number(d.revenue || 0);
            const x = padding.left + gap * i + gap / 2;
            const y = padding.top + chartH - (value / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dots
        revenuePoints.forEach((d, i) => {
            const value = Number(d.revenue || 0);
            const x = padding.left + gap * i + gap / 2;
            const y = padding.top + chartH - (value / maxVal) * chartH;
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }, [chartPeriod, revenuePoints]);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Tổng quan Dashboard</h1>
                    <p className={styles.pageSubtitle}>
                        Theo dõi doanh thu, booking và tăng trưởng khách hàng theo thời gian thực.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={() => navigate('/admin/finance')}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                        Đi đến tài chính
                    </button>
                </div>
            </div>

            {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

            {/* KPI Cards */}
            <div className={styles.statsGrid}>
                <StatCard
                    icon="account_balance_wallet"
                    label="Tổng Doanh Thu"
                    value={overview ? formatVnd(overview.totalRevenue) : '—'}
                    trend={(overview?.monthlyChangePercent || 0) >= 0 ? 'up' : 'down'}
                    trendValue={overview ? `${overview.monthlyChangePercent.toFixed(1)}% so với tháng trước` : ''}
                    color="green"
                />
                <StatCard
                    icon="event_note"
                    label="Booking tháng này"
                    value={overview ? String(overview.transactionsThisMonth || 0) : '—'}
                    trend={((overview?.successRatePercent || 0) >= 70) ? 'up' : 'down'}
                    trendValue={overview ? `Success rate ${overview.successRatePercent.toFixed(1)}%` : ''}
                    color="blue"
                />
                <StatCard
                    icon="person_add"
                    label="Khách hàng mới"
                    value={customerStats ? String(customerStats.newCustomersThisMonth || 0) : '—'}
                    trend={(customerStats?.newCustomersThisMonth || 0) > 0 ? 'up' : undefined}
                    trendValue={customerStats ? `Tổng khách: ${customerStats.totalCustomers || 0}` : ''}
                    color="purple"
                />
                <StatCard
                    icon="trending_up"
                    label="Tỷ lệ quay lại"
                    value={customerStats ? `${(customerStats.returnRatePercent || 0).toFixed(1)}%` : '—'}
                    trend={(customerStats?.returnRatePercent || 0) >= 30 ? 'up' : 'down'}
                    trendValue="Khách có >=2 booking"
                    color="orange"
                />
            </div>

            {/* Chart + Recent Bookings */}
            <div className={styles.mainGrid}>
                {/* Revenue Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>
                            <span className="material-icons-round" style={{ fontSize: '20px', color: '#2ecc71' }}>bar_chart</span>
                            Doanh Thu Theo Tháng
                        </h2>
                        <div className={styles.chartPeriod}>
                            {['week', 'month', 'year'].map(p => (
                                <button
                                    key={p}
                                    className={`${styles.periodBtn} ${chartPeriod === p ? styles.periodActive : ''}`}
                                    onClick={() => setChartPeriod(p)}
                                >
                                    {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.chartArea}>
                        {loading ? (
                            <div className={styles.placeholder}>Đang tải biểu đồ...</div>
                        ) : !revenuePoints.length ? (
                            <div className={styles.placeholder}>Chưa có dữ liệu doanh thu</div>
                        ) : (
                            <canvas ref={canvasRef} className={styles.canvas}></canvas>
                        )}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className={styles.recentCard}>
                    <div className={styles.recentHeader}>
                        <h2 className={styles.recentTitle}>
                            <span className="material-icons-round" style={{ fontSize: '20px', color: '#3498db' }}>receipt_long</span>
                            Booking Gần Đây
                        </h2>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/admin/bookings')}>
                            Xem tất cả
                        </button>
                    </div>
                    <div className={styles.bookingList}>
                        {!recentBookings.length && (
                            <div className={styles.placeholder}>Chưa có booking gần đây</div>
                        )}
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className={styles.bookingItem}>
                                <div className={styles.bookingLeft}>
                                    <span className={styles.bookingId}>{booking.bookingCode || booking.id?.slice(0, 8)}</span>
                                    <span className={styles.bookingCustomer}>{booking.customer?.fullName || '—'}</span>
                                    <span className={styles.bookingTour}>{booking.tour?.title || '—'}</span>
                                </div>
                                <div className={styles.bookingRight}>
                                    <span className={styles.bookingAmount}>{formatVnd(booking.totalAmount)}</span>
                                    <span className={`${styles.bookingStatus} ${styles[(STATUS_MAP[booking.status] || STATUS_MAP.pending).className]}`}>
                                        {(STATUS_MAP[booking.status] || STATUS_MAP.pending).label}
                                    </span>
                                    <span className={styles.bookingDate}>{formatDate(booking.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
