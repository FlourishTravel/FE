import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import CustomerDetailModal from '../components/CustomerDetailModal';
import styles from './CustomerManagement.module.css';
import {
    getAdminCustomerStats,
    listAdminCustomers,
} from '../../../api/adminCustomers';

const TIER_INFO = {
    VIP: { label: 'VIP', cls: 'tierVIP' },
    GOLD: { label: 'Gold', cls: 'tierGold' },
    SILVER: { label: 'Silver', cls: 'tierSilver' },
    STANDARD: { label: 'Standard', cls: 'tierStandard' },
};

const TIER_FILTER_OPTIONS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'VIP', label: 'VIP' },
    { id: 'GOLD', label: 'Gold' },
    { id: 'SILVER', label: 'Silver' },
    { id: 'STANDARD', label: 'Standard' },
];

const PAGE_SIZE = 20;

const formatVnd = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return new Intl.NumberFormat('vi-VN').format(n);
};

const formatFullVnd = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
};

const formatDateShort = (v) => {
    if (!v) return '—';
    try {
        return new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return '—';
    }
};

const initialsOf = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const CustomerManagement = () => {
    const [filterTier, setFilterTier] = useState('all');
    const [filterActive, setFilterActive] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [openCustomerId, setOpenCustomerId] = useState(null);

    // Debounce search input.
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
        return () => clearTimeout(id);
    }, [searchQuery]);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await listAdminCustomers({
                q: debouncedQuery || undefined,
                tier: filterTier === 'all' ? undefined : filterTier,
                active: filterActive === 'all' ? undefined : filterActive === 'active',
                page: 0,
                size: PAGE_SIZE,
            });
            setCustomers(res.content);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải danh sách khách hàng');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filterTier, filterActive]);

    const loadStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const data = await getAdminCustomerStats();
            setStats(data);
        } catch (err) {
            console.warn('Stats load failed:', err.message);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => { loadCustomers(); }, [loadCustomers]);
    useEffect(() => { loadStats(); }, [loadStats]);

    const handleCustomerUpdated = useCallback((updated) => {
        setCustomers((prev) =>
            prev.map((c) =>
                c.id === updated.id
                    ? {
                        ...c,
                        fullName: updated.fullName,
                        email: updated.email,
                        phone: updated.phone,
                        avatarUrl: updated.avatarUrl,
                        active: updated.active,
                        tier: updated.tier,
                        marketingOptIn: updated.marketingOptIn,
                    }
                    : c
            )
        );
        loadStats();
    }, [loadStats]);

    const breakdown = stats?.breakdown || { vip: 0, gold: 0, silver: 0, standard: 0 };

    const tierCounts = useMemo(() => ({
        all: stats?.totalCustomers || customers.length,
        VIP: breakdown.vip || 0,
        GOLD: breakdown.gold || 0,
        SILVER: breakdown.silver || 0,
        STANDARD: breakdown.standard || 0,
    }), [stats, customers.length, breakdown]);

    const columns = useMemo(() => [
        {
            key: 'name',
            label: 'Khách hàng',
            render: (_, row) => (
                <div className={styles.custCell}>
                    {row.avatarUrl ? (
                        <img src={row.avatarUrl} alt="" className={styles.custAvatar} />
                    ) : (
                        <div className={styles.custAvatarFallback}>{initialsOf(row.fullName)}</div>
                    )}
                    <div>
                        <div className={styles.custName}>
                            {row.fullName}
                            {!row.active && <span className={styles.inactiveDot} title="Vô hiệu hoá" />}
                        </div>
                        <div className={styles.custEmail}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        { key: 'phone', label: 'SĐT', render: (v) => v || '—' },
        {
            key: 'tier',
            label: 'Hạng',
            render: (v) => {
                const info = TIER_INFO[v] || TIER_INFO.STANDARD;
                return <span className={`${styles.tier} ${styles[info.cls]}`}>{info.label}</span>;
            },
        },
        {
            key: 'totalSpent',
            label: 'Chi tiêu',
            sortable: true,
            render: (v) => <span className={styles.spendCell}>{`\u20AB${formatVnd(v)}`}</span>,
        },
        { key: 'bookingCount', label: 'Booking', sortable: true },
        {
            key: 'lastActiveAt',
            label: 'Hoạt động',
            render: (v) => formatDateShort(v),
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <button
                    className={styles.viewBtn}
                    onClick={(e) => { e.stopPropagation(); setOpenCustomerId(row.id); }}
                    title="Xem chi tiết"
                >
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                </button>
            ),
        },
    ], []);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Khách Hàng</h1>
                    <p className={styles.pageSub}>Quản lý cơ sở dữ liệu khách hàng và lịch sử dịch vụ.</p>
                </div>
                <button
                    className={styles.refreshBtn}
                    onClick={() => { loadCustomers(); loadStats(); }}
                    disabled={loading || loadingStats}
                    title="Tải lại"
                >
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span>
                    Tải lại
                </button>
            </div>

            {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}
            {successMsg && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{successMsg}</div>}

            <div className={styles.statsGrid}>
                <StatCard
                    icon="group"
                    label="Tổng Khách Hàng"
                    value={stats ? stats.totalCustomers.toLocaleString('vi-VN') : '—'}
                    trend="up"
                    trendValue={stats ? `+${stats.newCustomersThisMonth} tháng này` : ''}
                    color="green"
                />
                <StatCard
                    icon="workspace_premium"
                    label="Khách VIP"
                    value={stats ? stats.vipCustomers.toLocaleString('vi-VN') : '—'}
                    trend="up"
                    trendValue={stats ? `Gold: ${breakdown.gold} • Silver: ${breakdown.silver}` : ''}
                    color="purple"
                />
                <StatCard
                    icon="replay"
                    label="Tỷ Lệ Quay Lại"
                    value={stats ? `${stats.returnRatePercent}%` : '—'}
                    trend={stats && stats.returnRatePercent >= 30 ? 'up' : 'down'}
                    trendValue={stats ? '≥2 booking' : ''}
                    color="blue"
                />
                <StatCard
                    icon="account_balance_wallet"
                    label="Chi Tiêu TB"
                    value={stats ? formatFullVnd(stats.averageSpendPerCustomer) : '—'}
                    color="orange"
                />
            </div>

            <div className={styles.tableSection}>
                <div className={styles.filterBar}>
                    <div className={styles.tabs}>
                        {TIER_FILTER_OPTIONS.map((t) => (
                            <button
                                key={t.id}
                                className={`${styles.tab} ${filterTier === t.id ? styles.tabActive : ''}`}
                                onClick={() => setFilterTier(t.id)}
                            >
                                {t.label}
                                <span className={styles.tabCount}>{tierCounts[t.id] ?? 0}</span>
                            </button>
                        ))}
                    </div>
                    <div className={styles.rightFilters}>
                        <select
                            className={styles.activeSelect}
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã vô hiệu hoá</option>
                        </select>
                        <div className={styles.search}>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                            <input
                                type="text"
                                placeholder="Tên / email / SĐT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingBox}>Đang tải danh sách...</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={customers}
                        onRowClick={(row) => setOpenCustomerId(row.id)}
                        emptyMessage="Không có khách hàng phù hợp"
                        totalLabel="khách hàng"
                    />
                )}
            </div>

            <CustomerDetailModal
                customerId={openCustomerId}
                onClose={() => setOpenCustomerId(null)}
                onUpdated={(updated) => {
                    handleCustomerUpdated(updated);
                    setSuccessMsg('Đã cập nhật khách hàng');
                    setTimeout(() => setSuccessMsg(''), 2500);
                }}
            />
        </div>
    );
};

export default CustomerManagement;
