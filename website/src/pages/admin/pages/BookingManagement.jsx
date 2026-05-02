import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import styles from './BookingManagement.module.css';

const MOCK_BOOKINGS = [
    { id: 1, bookingId: 'BK-2401', customer: 'Nguyễn Văn An', email: 'an.nguyen@email.com', tour: 'Bangkok-Pattaya', tourCode: 'TH-BKKPAT-01', date: '28/04/2026', departure: '15/05/2026', amount: '₫12.500.000', paid: '₫12.500.000', status: 'confirmed', payType: 'full', passengers: 2 },
    { id: 2, bookingId: 'BK-2402', customer: 'Trần Thị Bình', email: 'binh.tran@email.com', tour: 'Đà Nẵng-Hội An', tourCode: 'VN-DANHA-05', date: '28/04/2026', departure: '20/05/2026', amount: '₫8.200.000', paid: '₫2.460.000', status: 'pending', payType: 'deposit', passengers: 1 },
    { id: 3, bookingId: 'BK-2403', customer: 'Lê Minh Châu', email: 'chau.le@email.com', tour: 'Sapa Misty Peaks', tourCode: 'VN-SAPA-03', date: '27/04/2026', departure: '18/05/2026', amount: '₫15.800.000', paid: '₫15.800.000', status: 'confirmed', payType: 'full', passengers: 3 },
    { id: 4, bookingId: 'BK-2404', customer: 'Phạm Đức Duy', email: 'duy.pham@email.com', tour: 'Bali Discovery', tourCode: 'ID-BALI-09', date: '27/04/2026', departure: '10/05/2026', amount: '₫22.000.000', paid: '₫0', status: 'cancelled', payType: 'refunded', passengers: 2 },
    { id: 5, bookingId: 'BK-2405', customer: 'Hoàng Thị Em', email: 'em.hoang@email.com', tour: 'Tokyo Experience', tourCode: 'JP-TOK-15', date: '26/04/2026', departure: '25/05/2026', amount: '₫28.500.000', paid: '₫8.550.000', status: 'confirmed', payType: 'deposit', passengers: 2 },
    { id: 6, bookingId: 'BK-2406', customer: 'Vũ Quang Huy', email: 'huy.vu@email.com', tour: 'Norway Aurora', tourCode: 'NO-AUR-02', date: '25/04/2026', departure: '15/12/2026', amount: '₫45.000.000', paid: '₫13.500.000', status: 'pending', payType: 'deposit', passengers: 2 },
    { id: 7, bookingId: 'BK-2407', customer: 'Đặng Thu Hương', email: 'huong.dang@email.com', tour: 'Costa Rica Trek', tourCode: 'CR-TREK-12', date: '24/04/2026', departure: '01/06/2026', amount: '₫35.000.000', paid: '₫35.000.000', status: 'confirmed', payType: 'full', passengers: 1 },
    { id: 8, bookingId: 'BK-2408', customer: 'Bùi Văn Khoa', email: 'khoa.bui@email.com', tour: 'Swiss Alps Grandeur', tourCode: 'CH-ALPS-07', date: '23/04/2026', departure: '10/07/2026', amount: '₫52.000.000', paid: '₫15.600.000', status: 'pending', payType: 'deposit', passengers: 2 },
    { id: 9, bookingId: 'BK-2409', customer: 'Ngô Thị Lan', email: 'lan.ngo@email.com', tour: 'Phú Quốc Paradise', tourCode: 'VN-PQ-11', date: '22/04/2026', departure: '05/05/2026', amount: '₫9.800.000', paid: '₫0', status: 'cancel_request', payType: 'pending_refund', passengers: 4 },
    { id: 10, bookingId: 'BK-2410', customer: 'Trịnh Minh Nam', email: 'nam.trinh@email.com', tour: 'Maldives Luxury', tourCode: 'MV-LUX-04', date: '21/04/2026', departure: '20/06/2026', amount: '₫65.000.000', paid: '₫0', status: 'cancel_request', payType: 'pending_refund', passengers: 2 },
];

const STATUS_CONFIG = {
    confirmed: { label: 'Xác nhận', className: 'statusConfirmed' },
    pending: { label: 'Chờ xử lý', className: 'statusPending' },
    cancelled: { label: 'Đã hủy', className: 'statusCancelled' },
    cancel_request: { label: 'Yêu cầu hủy', className: 'statusCancelReq' },
};

const PAY_CONFIG = {
    full: { label: 'Đầy đủ', className: 'payFull' },
    deposit: { label: 'Đặt cọc 30%', className: 'payDeposit' },
    refunded: { label: 'Đã hoàn tiền', className: 'payRefunded' },
    pending_refund: { label: 'Chờ hoàn tiền', className: 'payPendingRefund' },
};

const BookingManagement = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBookings = MOCK_BOOKINGS.filter(b => {
        if (filterStatus !== 'all' && b.status !== filterStatus) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return b.bookingId.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.tour.toLowerCase().includes(q);
        }
        return true;
    });

    const columns = [
        {
            key: 'bookingId',
            label: 'Mã Booking',
            render: (val) => <span className={styles.bookingIdCell}>{val}</span>
        },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (_, row) => (
                <div>
                    <div className={styles.customerName}>{row.customer}</div>
                    <div className={styles.customerEmail}>{row.email}</div>
                </div>
            )
        },
        {
            key: 'tour',
            label: 'Tour',
            render: (_, row) => (
                <div>
                    <div className={styles.tourName}>{row.tour}</div>
                    <div className={styles.tourCode}>{row.tourCode}</div>
                </div>
            )
        },
        { key: 'passengers', label: 'Khách', render: (val) => `${val} người` },
        { key: 'date', label: 'Ngày đặt', sortable: true },
        { key: 'amount', label: 'Tổng tiền', sortable: true },
        {
            key: 'payType',
            label: 'Thanh toán',
            render: (val) => (
                <span className={`${styles.payBadge} ${styles[PAY_CONFIG[val]?.className]}`}>
                    {PAY_CONFIG[val]?.label}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => (
                <span className={`${styles.statusBadge} ${styles[STATUS_CONFIG[val]?.className]}`}>
                    {STATUS_CONFIG[val]?.label}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: () => (
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Xem chi tiết">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                    </button>
                    <button className={styles.actionBtn} title="Chỉnh sửa">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Đặt Chỗ</h1>
                    <p className={styles.pageSubtitle}>Theo dõi và quản lý tất cả các booking của Flourish Travel</p>
                </div>
                <button className={styles.addBtn}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
                    Tạo Booking Mới
                </button>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="confirmation_number" label="Tổng Đặt Chỗ" value="156" trend="up" trendValue="+12" color="green" />
                <StatCard icon="payments" label="Doanh Thu Tháng" value="₫890.5M" trend="up" trendValue="+18%" color="blue" />
                <StatCard icon="account_balance" label="Cọc Chưa Thanh Toán" value="₫245M" color="orange" />
                <StatCard icon="cancel" label="Yêu Cầu Hủy" value="3" trend="down" trendValue="-2" color="red" />
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {[
                        { key: 'all', label: 'Tất cả', count: MOCK_BOOKINGS.length },
                        { key: 'confirmed', label: 'Xác nhận', count: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length },
                        { key: 'pending', label: 'Chờ xử lý', count: MOCK_BOOKINGS.filter(b => b.status === 'pending').length },
                        { key: 'cancel_request', label: 'Yêu cầu hủy', count: MOCK_BOOKINGS.filter(b => b.status === 'cancel_request').length },
                        { key: 'cancelled', label: 'Đã hủy', count: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles.filterTab} ${filterStatus === tab.key ? styles.filterTabActive : ''}`}
                            onClick={() => setFilterStatus(tab.key)}
                        >
                            {tab.label}
                            <span className={styles.tabCount}>{tab.count}</span>
                        </button>
                    ))}
                </div>
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                    <input
                        type="text"
                        placeholder="Tìm booking, khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredBookings}
                selectable={false}
                totalLabel="booking"
            />
        </div>
    );
};

export default BookingManagement;
