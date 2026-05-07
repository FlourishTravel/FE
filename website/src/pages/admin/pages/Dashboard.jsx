import React, { useState, useRef, useEffect } from 'react';
import StatCard from '../components/StatCard';
import styles from './Dashboard.module.css';

const MONTHLY_REVENUE = [
    { month: 'T1', value: 1.8 },
    { month: 'T2', value: 2.1 },
    { month: 'T3', value: 1.5 },
    { month: 'T4', value: 2.8 },
    { month: 'T5', value: 2.3 },
    { month: 'T6', value: 3.1 },
    { month: 'T7', value: 2.9 },
    { month: 'T8', value: 3.4 },
    { month: 'T9', value: 2.7 },
    { month: 'T10', value: 3.2 },
    { month: 'T11', value: 2.45 },
    { month: 'T12', value: 0 },
];

const RECENT_BOOKINGS = [
    { id: 'BK-2401', customer: 'Nguyễn Văn An', tour: 'Bangkok-Pattaya', date: '28/04/2026', amount: '₫12.500.000', status: 'confirmed', payType: 'Thanh toán đầy đủ' },
    { id: 'BK-2402', customer: 'Trần Thị Bình', tour: 'Đà Nẵng-Hội An', date: '28/04/2026', amount: '₫8.200.000', status: 'pending', payType: 'Đặt cọc 30%' },
    { id: 'BK-2403', customer: 'Lê Minh Châu', tour: 'Sapa Misty Peaks', date: '27/04/2026', amount: '₫15.800.000', status: 'confirmed', payType: 'Thanh toán đầy đủ' },
    { id: 'BK-2404', customer: 'Phạm Đức Duy', tour: 'Bali Discovery', date: '27/04/2026', amount: '₫22.000.000', status: 'cancelled', payType: 'Đã hoàn tiền' },
    { id: 'BK-2405', customer: 'Hoàng Thị Em', tour: 'Tokyo Experience', date: '26/04/2026', amount: '₫28.500.000', status: 'confirmed', payType: 'Đặt cọc 30%' },
];

const STATUS_MAP = {
    confirmed: { label: 'Xác nhận', className: 'statusConfirmed' },
    pending: { label: 'Chờ xử lý', className: 'statusPending' },
    cancelled: { label: 'Đã hủy', className: 'statusCancelled' },
};

const Dashboard = () => {
    const canvasRef = useRef(null);
    const [chartPeriod, setChartPeriod] = useState('year');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
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
        const maxVal = Math.max(...MONTHLY_REVENUE.map(d => d.value)) * 1.15;
        const barWidth = chartW / MONTHLY_REVENUE.length * 0.55;
        const gap = chartW / MONTHLY_REVENUE.length;

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
            const label = ((maxVal - (maxVal / 4) * i)).toFixed(1);
            ctx.fillText(`${label} Tỷ`, padding.left - 8, y + 4);
        }

        // Bars
        MONTHLY_REVENUE.forEach((d, i) => {
            const x = padding.left + gap * i + (gap - barWidth) / 2;
            const barH = (d.value / maxVal) * chartH;
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
            ctx.fillText(d.month, x + barWidth / 2, rect.height - padding.bottom + 18);
        });

        // Line overlay
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        MONTHLY_REVENUE.forEach((d, i) => {
            const x = padding.left + gap * i + gap / 2;
            const y = padding.top + chartH - (d.value / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dots
        MONTHLY_REVENUE.forEach((d, i) => {
            const x = padding.left + gap * i + gap / 2;
            const y = padding.top + chartH - (d.value / maxVal) * chartH;
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }, [chartPeriod]);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Tổng quan Dashboard</h1>
                    <p className={styles.pageSubtitle}>Chào mừng trở lại, Super Admin. Dưới đây là hiệu suất hệ thống hôm nay.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.statsGrid}>
                <StatCard icon="account_balance_wallet" label="Tổng Doanh Thu" value="₫2.45 Tỷ" trend="up" trendValue="+12.5%" color="green" />
                <StatCard icon="event_note" label="Booking Hôm Nay" value="23" trend="up" trendValue="+8" color="blue" />
                <StatCard icon="person_add" label="Khách Hàng Mới" value="156" trend="up" trendValue="+23%" color="purple" />
                <StatCard icon="trending_up" label="Tỷ Lệ Chuyển Đổi" value="68.5%" trend="down" trendValue="-2.1%" color="orange" />
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
                        <canvas ref={canvasRef} className={styles.canvas}></canvas>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className={styles.recentCard}>
                    <div className={styles.recentHeader}>
                        <h2 className={styles.recentTitle}>
                            <span className="material-icons-round" style={{ fontSize: '20px', color: '#3498db' }}>receipt_long</span>
                            Booking Gần Đây
                        </h2>
                        <button className={styles.viewAllBtn}>Xem tất cả</button>
                    </div>
                    <div className={styles.bookingList}>
                        {RECENT_BOOKINGS.map(booking => (
                            <div key={booking.id} className={styles.bookingItem}>
                                <div className={styles.bookingLeft}>
                                    <span className={styles.bookingId}>{booking.id}</span>
                                    <span className={styles.bookingCustomer}>{booking.customer}</span>
                                    <span className={styles.bookingTour}>{booking.tour}</span>
                                </div>
                                <div className={styles.bookingRight}>
                                    <span className={styles.bookingAmount}>{booking.amount}</span>
                                    <span className={`${styles.bookingStatus} ${styles[STATUS_MAP[booking.status].className]}`}>
                                        {STATUS_MAP[booking.status].label}
                                    </span>
                                    <span className={styles.bookingDate}>{booking.date}</span>
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
