import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import TransactionDetailModal from '../components/TransactionDetailModal';
import styles from './FinancialManagement.module.css';
import {
    exportTransactionsCsv,
    getFinanceOverview,
    listTransactions,
} from '../../../api/adminFinance';

const STATUS_INFO = {
    pending:   { label: 'Đang xử lý', cls: 'statusPending' },
    paid:      { label: 'Thành công', cls: 'statusCompleted' },
    failed:    { label: 'Thất bại',   cls: 'statusFailed' },
    refunded:  { label: 'Đã hoàn',    cls: 'statusRefunded' },
    processed: { label: 'Đã hoàn',    cls: 'statusCompleted' },
    rejected:  { label: 'Từ chối',    cls: 'statusFailed' },
};

const KIND_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'payment', label: 'Thanh toán' },
    { id: 'refund', label: 'Hoàn tiền' },
];

const STATUS_FILTER_OPTIONS = [
    { id: 'all', label: 'Mọi trạng thái' },
    { id: 'paid', label: 'Thành công' },
    { id: 'pending', label: 'Đang xử lý' },
    { id: 'failed', label: 'Thất bại' },
    { id: 'refunded', label: 'Đã hoàn' },
];

const PROVIDER_FILTER_OPTIONS = [
    { id: 'all', label: 'Mọi cổng TT' },
    { id: 'momo', label: 'MoMo' },
    { id: 'vnpay', label: 'VNPay' },
    { id: 'bank_transfer', label: 'Chuyển khoản NH' },
    { id: 'manual', label: 'Ghi nhận thủ công' },
    { id: 'credit_card', label: 'Thẻ tín dụng' },
];

const PROVIDER_LABEL = {
    momo: 'MoMo',
    vnpay: 'VNPay',
    bank_transfer: 'CK Ngân hàng',
    manual: 'Thủ công',
    credit_card: 'Thẻ',
};

const PAGE_SIZE = 20;

const formatVnd = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
};

const formatVndShort = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return new Intl.NumberFormat('vi-VN').format(n);
};

const formatDateTime = (v) => {
    if (!v) return '—';
    try { return new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; }
};

const FinancialManagement = () => {
    const [filterKind, setFilterKind] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterProvider, setFilterProvider] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [overview, setOverview] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [openTx, setOpenTx] = useState(null); // { kind, id }

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
        return () => clearTimeout(id);
    }, [searchQuery]);

    const loadOverview = useCallback(async () => {
        setLoadingOverview(true);
        try {
            const data = await getFinanceOverview();
            setOverview(data);
        } catch (err) {
            console.warn('Overview load failed:', err.message);
        } finally {
            setLoadingOverview(false);
        }
    }, []);

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await listTransactions({
                q: debouncedQuery || undefined,
                kind: filterKind,
                status: filterStatus,
                provider: filterProvider,
                page: 0,
                size: PAGE_SIZE,
            });
            setTransactions(res.content);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải giao dịch');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filterKind, filterStatus, filterProvider]);

    useEffect(() => { loadOverview(); }, [loadOverview]);
    useEffect(() => { loadTransactions(); }, [loadTransactions]);

    const handleExport = useCallback(async () => {
        setExporting(true);
        setErrorMsg('');
        try {
            await exportTransactionsCsv({
                q: debouncedQuery || undefined,
                kind: filterKind,
                status: filterStatus,
                provider: filterProvider,
            });
        } catch (err) {
            setErrorMsg(err.message || 'Xuất báo cáo thất bại');
        } finally {
            setExporting(false);
        }
    }, [debouncedQuery, filterKind, filterStatus, filterProvider]);

    const handleTxUpdated = useCallback(() => {
        loadOverview();
        loadTransactions();
    }, [loadOverview, loadTransactions]);

    // Chart helpers
    const chartData = overview?.revenueByMonth || [];
    const chartMax = useMemo(() => {
        const vals = chartData.map((p) => Number(p.revenue || 0));
        return Math.max(1, ...vals);
    }, [chartData]);

    const monthlyChange = overview?.monthlyChangePercent ?? 0;

    const columns = useMemo(() => [
        {
            key: 'code',
            label: 'Mã GD',
            render: (_, row) => (
                <div className={styles.txCell}>
                    <span className={`${styles.kindDot} ${row.kind === 'payment' ? styles.kindPayment : styles.kindRefund}`} />
                    <span className={styles.codeText}>{row.code}</span>
                </div>
            ),
        },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (_, row) => (
                <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{row.customerName || '—'}</span>
                    <span className={styles.customerEmail}>{row.customerEmail || row.bookingCode || ''}</span>
                </div>
            ),
        },
        {
            key: 'tourTitle',
            label: 'Tour',
            render: (v) => <span className={styles.tourCell}>{v || '—'}</span>,
        },
        {
            key: 'amount',
            label: 'Số tiền',
            render: (val, row) => (
                <span className={`${styles.amountInfo} ${row.kind === 'refund' ? styles.amountRefund : ''}`}>
                    {row.kind === 'refund' ? '−' : ''}{formatVnd(val)}
                </span>
            ),
        },
        {
            key: 'provider',
            label: 'Cổng',
            render: (v, row) => row.kind === 'refund' ? <span className={styles.muted}>—</span> : <span className={styles.providerBadge}>{PROVIDER_LABEL[v] || v || '—'}</span>,
        },
        {
            key: 'typeLabel',
            label: 'Loại',
            render: (v) => <span className={styles.typeBadge}>{v || '—'}</span>,
        },
        {
            key: 'createdAt',
            label: 'Thời gian',
            sortable: true,
            render: (v) => formatDateTime(v),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => {
                const info = STATUS_INFO[(val || '').toLowerCase()] || { label: val, cls: 'statusPending' };
                return <span className={`${styles.statusBadge} ${styles[info.cls]}`}>{info.label}</span>;
            },
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <button
                    className={styles.actionBtn}
                    title="Xem chi tiết"
                    onClick={(e) => { e.stopPropagation(); setOpenTx({ kind: row.kind, id: row.id }); }}
                >
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>receipt_long</span>
                </button>
            ),
        },
    ], []);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Tài Chính</h1>
                    <p className={styles.pageSubtitle}>Theo dõi doanh thu, dòng tiền và lịch sử thanh toán theo thời gian thực.</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={() => { loadOverview(); loadTransactions(); }}
                        disabled={loading || loadingOverview}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span>
                        Tải lại
                    </button>
                    <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                        {exporting ? 'Đang xuất...' : 'Xuất CSV'}
                    </button>
                </div>
            </div>

            {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                <StatBox
                    icon="account_balance_wallet"
                    color="blue"
                    label="Doanh thu (toàn thời gian)"
                    value={overview ? formatVnd(overview.totalRevenue) : '—'}
                    sub={overview ? `Ròng: ${formatVnd(overview.netRevenue)}` : ''}
                />
                <StatBox
                    icon="trending_up"
                    color="green"
                    label="Doanh thu tháng này"
                    value={overview ? formatVnd(overview.monthlyRevenue) : '—'}
                    trend={monthlyChange >= 0 ? 'up' : 'down'}
                    trendValue={overview ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange}% vs tháng trước` : ''}
                />
                <StatBox
                    icon="hourglass_top"
                    color="orange"
                    label="Đang chờ thu"
                    value={overview ? formatVnd(overview.pendingCollection) : '—'}
                    sub={overview ? `${overview.transactionsThisMonth} GD tháng này` : ''}
                />
                <StatBox
                    icon="currency_exchange"
                    color="red"
                    label="Đã hoàn tiền"
                    value={overview ? formatVnd(overview.refundedAmount) : '—'}
                    sub={overview ? `Chờ duyệt: ${formatVnd(overview.pendingRefundAmount)}` : ''}
                />
            </div>

            {/* Charts & widgets */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartBox}>
                    <div className={styles.chartHead}>
                        <h3 className={styles.chartTitle}>Doanh thu 6 tháng gần nhất</h3>
                        <div className={styles.legend}>
                            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotRevenue}`} />Doanh thu</span>
                            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.dotRefund}`} />Hoàn</span>
                        </div>
                    </div>
                    <div className={styles.chart}>
                        {chartData.length === 0 ? (
                            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
                        ) : (
                            chartData.map((p) => {
                                const revH = (Number(p.revenue || 0) / chartMax) * 140;
                                const refH = (Number(p.refund || 0) / chartMax) * 140;
                                return (
                                    <div key={p.month} className={styles.chartCol}>
                                        <div className={styles.chartBars}>
                                            <div className={styles.barRev} style={{ height: `${Math.max(2, revH)}px` }} title={`Doanh thu: ${formatVnd(p.revenue)}`} />
                                            {Number(p.refund || 0) > 0 && (
                                                <div className={styles.barRef} style={{ height: `${Math.max(2, refH)}px` }} title={`Hoàn: ${formatVnd(p.refund)}`} />
                                            )}
                                        </div>
                                        <div className={styles.chartLabel}>{p.label}</div>
                                        <div className={styles.chartValue}>{formatVndShort(p.revenue)}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.sideBox}>
                    <h3 className={styles.chartTitle}>Top tour theo doanh thu</h3>
                    {(overview?.topToursByRevenue || []).length === 0 ? (
                        <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
                    ) : (
                        <ul className={styles.topList}>
                            {overview.topToursByRevenue.map((t, i) => (
                                <li key={t.tourId} className={styles.topItem}>
                                    <span className={styles.topRank}>{i + 1}</span>
                                    <div className={styles.topInfo}>
                                        <div className={styles.topTitle}>{t.tourTitle}</div>
                                        <div className={styles.topMeta}>{t.bookingCount} booking</div>
                                    </div>
                                    <span className={styles.topAmount}>{formatVndShort(t.totalRevenue)}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 className={`${styles.chartTitle} ${styles.mt16}`}>Phân bổ theo cổng</h3>
                    {(overview?.revenueByProvider || []).length === 0 ? (
                        <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
                    ) : (
                        <ul className={styles.providerList}>
                            {overview.revenueByProvider.map((p) => (
                                <li key={p.provider} className={styles.providerItem}>
                                    <div className={styles.providerHead}>
                                        <span>{PROVIDER_LABEL[p.provider] || p.provider}</span>
                                        <span className={styles.providerPct}>{p.percent}%</span>
                                    </div>
                                    <div className={styles.providerBar}>
                                        <div className={styles.providerFill} style={{ width: `${Math.max(2, p.percent)}%` }} />
                                    </div>
                                    <div className={styles.providerSub}>{formatVndShort(p.total)} • {p.count} GD</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Transactions */}
            <div className={styles.tableSection}>
                <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>Lịch sử giao dịch</h3>
                </div>
                <div className={styles.filterBar}>
                    <div className={styles.filterTabs}>
                        {KIND_TABS.map((t) => (
                            <button
                                key={t.id}
                                className={`${styles.filterTab} ${filterKind === t.id ? styles.filterTabActive : ''}`}
                                onClick={() => setFilterKind(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.rightFilters}>
                        <select
                            className={styles.selectInput}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            {STATUS_FILTER_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                        <select
                            className={styles.selectInput}
                            value={filterProvider}
                            onChange={(e) => setFilterProvider(e.target.value)}
                            disabled={filterKind === 'refund'}
                        >
                            {PROVIDER_FILTER_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                        <div className={styles.search}>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                            <input
                                type="text"
                                placeholder="Mã GD / KH / tour..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingBox}>Đang tải giao dịch...</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={transactions}
                        onRowClick={(row) => setOpenTx({ kind: row.kind, id: row.id })}
                        emptyMessage="Không có giao dịch phù hợp"
                        totalLabel="giao dịch"
                    />
                )}
            </div>

            {openTx && (
                <TransactionDetailModal
                    kind={openTx.kind}
                    id={openTx.id}
                    onClose={() => setOpenTx(null)}
                    onUpdated={() => handleTxUpdated()}
                />
            )}
        </div>
    );
};

const StatBox = ({ icon, color, label, value, sub, trend, trendValue }) => (
    <div className={styles.statCard}>
        <div className={styles.statHeader}>
            <span className={styles.statLabel}>{label}</span>
            <div className={`${styles.statIcon} ${styles['icon' + color.charAt(0).toUpperCase() + color.slice(1)]}`}>
                <span className="material-icons-round">{icon}</span>
            </div>
        </div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statTrend}>
            {trend && (
                <span className={trend === 'up' ? styles.trendUp : styles.trendDown}>
                    <span className="material-icons-round" style={{ fontSize: '15px' }}>{trend === 'up' ? 'trending_up' : 'trending_down'}</span>
                    {trendValue}
                </span>
            )}
            {!trend && sub && <span className={styles.trendText}>{sub}</span>}
        </div>
    </div>
);

export default FinancialManagement;
