import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import styles from './FinancialManagement.module.css';

const MOCK_TRANSACTIONS = [
    { id: 'TXN-9821', customer: 'Nguyễn Văn A', email: 'nva@example.com', amount: '₫12.500.000', type: 'Thanh toán đủ', date: '07/05/2026', status: 'completed' },
    { id: 'TXN-9820', customer: 'Trần Thị B', email: 'ttb@example.com', amount: '₫4.100.000', type: 'Thu cọc', date: '06/05/2026', status: 'completed' },
    { id: 'TXN-9819', customer: 'Lê Văn C', email: 'lvc@example.com', amount: '₫35.000.000', type: 'Thanh toán đủ', date: '06/05/2026', status: 'pending' },
    { id: 'TXN-9818', customer: 'Phạm Thị D', email: 'ptd@example.com', amount: '₫8.200.000', type: 'Hoàn tiền', date: '05/05/2026', status: 'completed' },
    { id: 'TXN-9817', customer: 'Hoàng Văn E', email: 'hve@example.com', amount: '₫18.500.000', type: 'Thanh toán đủ', date: '04/05/2026', status: 'failed' },
    { id: 'TXN-9816', customer: 'Ngô Thị F', email: 'ntf@example.com', amount: '₫6.500.000', type: 'Thu cọc', date: '03/05/2026', status: 'completed' },
];

const STATUS_CONFIG = {
    completed: { label: 'Thành công', className: 'statusCompleted' },
    pending: { label: 'Đang xử lý', className: 'statusPending' },
    failed: { label: 'Thất bại', className: 'statusFailed' },
};

const FinancialManagement = () => {
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        return true;
    });

    const columns = [
        { key: 'id', label: 'Mã GD' },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (_, row) => (
                <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{row.customer}</span>
                    <span className={styles.customerEmail}>{row.email}</span>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Số tiền',
            render: (val) => <span className={styles.amountInfo}>{val}</span>
        },
        {
            key: 'type',
            label: 'Loại GD',
            render: (val) => <span className={styles.typeBadge}>{val}</span>
        },
        { key: 'date', label: 'Ngày', sortable: true },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => (
                <span className={`${styles.statusBadge} ${styles[STATUS_CONFIG[val].className]}`}>
                    {STATUS_CONFIG[val].label}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: () => (
                <button className={styles.actionBtn} title="Xem chi tiết">
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>receipt_long</span>
                </button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Giao Dịch</h1>
                    <p className={styles.pageSubtitle}>Theo dõi doanh thu, dòng tiền và lịch sử thanh toán</p>
                </div>
                <button className={styles.exportBtn}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                    Xuất Báo Cáo
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Tổng doanh thu</span>
                        <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                            <span className="material-icons-round">account_balance_wallet</span>
                        </div>
                    </div>
                    <div className={styles.statValue}>2.450.000.000₫</div>
                    <div className={styles.statTrend}>
                        <span className="material-icons-round trendUp" style={{ fontSize: '16px' }}>trending_up</span>
                        <span className={styles.trendUp}>+12.5%</span>
                        <span className={styles.trendText}>so với tháng trước</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Đã thu cọc</span>
                        <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                            <span className="material-icons-round">payments</span>
                        </div>
                    </div>
                    <div className={styles.statValue}>890.500.000₫</div>
                    <div className={styles.statTrend}>
                        <span className="material-icons-round trendUp" style={{ fontSize: '16px' }}>trending_up</span>
                        <span className={styles.trendUp}>+5.2%</span>
                        <span className={styles.trendText}>so với tháng trước</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Đã hoàn tiền</span>
                        <div className={`${styles.statIcon} ${styles.iconRed}`}>
                            <span className="material-icons-round">currency_exchange</span>
                        </div>
                    </div>
                    <div className={styles.statValue}>45.000.000₫</div>
                    <div className={styles.statTrend}>
                        <span className="material-icons-round trendDown" style={{ fontSize: '16px' }}>trending_down</span>
                        <span className={styles.trendDown}>-2.1%</span>
                        <span className={styles.trendText}>so với tháng trước</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.tableSection}>
                    <h3 className={styles.sectionTitle}>Lịch sử giao dịch gần đây</h3>
                    <div className={styles.filterBar}>
                        <div className={styles.filterTabs}>
                            {[
                                { key: 'all', label: 'Tất cả' },
                                { key: 'completed', label: 'Thành công' },
                                { key: 'pending', label: 'Đang xử lý' },
                                { key: 'failed', label: 'Thất bại' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`${styles.filterTab} ${filterStatus === tab.key ? styles.filterTabActive : ''}`}
                                    onClick={() => setFilterStatus(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredTransactions}
                        selectable={false}
                        totalLabel="giao dịch"
                    />
                </div>

                <div className={styles.widgetsSection}>
                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>
                            <div className={styles.widgetIcon}>
                                <span className="material-icons-round">smart_toy</span>
                            </div>
                            <h4 className={styles.widgetTitle}>Tự động đối soát</h4>
                        </div>
                        <p className={styles.widgetDesc}>Giảm thiểu sai sót kế toán với hệ thống AI tự động đối soát giao dịch ngân hàng theo thời gian thực.</p>
                        <a href="#" className={styles.widgetAction}>Cấu hình API Ngân hàng <span className="material-icons-round" style={{ fontSize: '16px' }}>chevron_right</span></a>
                    </div>

                    <div className={styles.widget}>
                        <div className={styles.widgetHeader}>
                            <div className={styles.widgetIcon}>
                                <span className="material-icons-round">insights</span>
                            </div>
                            <h4 className={styles.widgetTitle}>Phân tích xu hướng</h4>
                        </div>
                        <p className={styles.widgetDesc}>Dự báo doanh thu tháng tới dựa trên lịch sử đặt tour và xu hướng mùa vụ của khách du lịch.</p>
                        <a href="#" className={styles.widgetAction}>Xem báo cáo chi tiết <span className="material-icons-round" style={{ fontSize: '16px' }}>chevron_right</span></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialManagement;
