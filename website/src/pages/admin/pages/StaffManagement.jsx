import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StaffDetailModal from '../components/StaffDetailModal';
import StaffFormModal from '../components/StaffFormModal';
import styles from './StaffManagement.module.css';
import {
    getStaffStats,
    listStaff,
} from '../../../api/adminStaff';

const PAGE_SIZE = 20;

const DEPT_TABS = [
    { id: 'all', label: 'Tất cả', param: undefined },
    { id: 'SALES', label: 'Sales', param: 'SALES' },
    { id: 'OPERATIONS', label: 'Điều hành', param: 'OPERATIONS' },
    { id: 'FINANCE', label: 'Kế toán', param: 'FINANCE' },
    { id: 'GUIDE', label: 'HDV', param: 'GUIDE' },
];

const STATUS_LABEL = {
    active: 'Đang làm',
    on_leave: 'Nghỉ phép',
    inactive: 'Đã nghỉ việc',
};

const initialsOf = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const StaffManagement = () => {
    const [filterDept, setFilterDept] = useState('all');
    const [employmentStatus, setEmploymentStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [page, setPage] = useState(0);

    const [staff, setStaff] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [openDetailId, setOpenDetailId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [formStaffId, setFormStaffId] = useState(null);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
        return () => clearTimeout(id);
    }, [searchQuery]);

    useEffect(() => {
        setPage(0);
    }, [filterDept, employmentStatus, debouncedQuery]);

    const deptParam = useMemo(() => {
        const tab = DEPT_TABS.find((t) => t.id === filterDept);
        return tab?.param;
    }, [filterDept]);

    const loadStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const data = await getStaffStats();
            setStats(data);
        } catch (err) {
            console.warn('Staff stats:', err.message);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const loadStaff = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await listStaff({
                q: debouncedQuery || undefined,
                employmentStatus: employmentStatus === 'all' ? undefined : employmentStatus,
                department: deptParam,
                page,
                size: PAGE_SIZE,
            });
            setStaff(res.content);
            setTotalPages(res.totalPages || 0);
            setTotalElements(res.totalElements ?? res.content.length);
        } catch (err) {
            setErrorMsg(err.message || 'Không thể tải danh sách nhân viên');
            setStaff([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, employmentStatus, deptParam, page]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadStaff();
    }, [loadStaff]);

    const tabCounts = useMemo(() => {
        const by = stats?.byDepartment || {};
        return {
            all: stats?.totalStaff ?? 0,
            SALES: by.sales ?? 0,
            OPERATIONS: by.operations ?? 0,
            FINANCE: by.finance ?? 0,
            GUIDE: stats?.guideCount ?? by.guides ?? 0,
        };
    }, [stats]);

    const handleStaffUpdated = useCallback((updated) => {
        setStaff((prev) =>
            prev.map((s) =>
                s.id === updated.id
                    ? {
                        ...s,
                        fullName: updated.fullName,
                        email: updated.email,
                        phone: updated.phone,
                        avatarUrl: updated.avatarUrl,
                        roleName: updated.roleName,
                        roleLabel: updated.roleLabel,
                        jobTitle: updated.jobTitle,
                        department: updated.department,
                        departmentLabel: updated.departmentLabel,
                        employmentStatus: updated.employmentStatus,
                        active: updated.active,
                    }
                    : s
            )
        );
        loadStats();
    }, [loadStats]);

    const columns = useMemo(() => [
        {
            key: 'name',
            label: 'Nhân viên',
            render: (_, row) => (
                <div className={styles.staffCell}>
                    {row.avatarUrl ? (
                        <img src={row.avatarUrl} alt="" className={styles.staffAvatar} />
                    ) : (
                        <div className={styles.staffAvatarFallback}>{initialsOf(row.fullName)}</div>
                    )}
                    <div>
                        <div className={styles.staffName}>
                            {row.fullName}
                            {!row.active && (
                                <span className={styles.inactiveDot} title="Không đăng nhập được" />
                            )}
                        </div>
                        <div className={styles.staffMeta}>
                            {[row.employeeCode, row.email].filter(Boolean).join(' · ')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'roleLabel',
            label: 'Vai trò / BP',
            render: (_, row) => (
                <div className={styles.roleDept}>
                    <span className={styles.roleBadge}>{row.roleLabel || row.roleName}</span>
                    <span className={styles.deptHint}>{row.departmentLabel || '—'}</span>
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Liên hệ',
            render: (_, row) => (
                <div className={styles.contactInfo}>
                    <span className={styles.contactPhone}>{row.phone || '—'}</span>
                    {row.jobTitle && (
                        <span className={styles.jobHint}>{row.jobTitle}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'employmentStatus',
            label: 'Trạng thái',
            render: (v) => (
                <span className={`${styles.statusBadge} ${styles[`st_${v}`] || ''}`}>
                    {STATUS_LABEL[v] || v}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenDetailId(row.id);
                    }}
                    title="Chi tiết"
                >
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                </button>
            ),
        },
    ], []);

    const tablePageSize = Math.max(staff.length, 1);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Nhân Viên</h1>
                    <p className={styles.pageSub}>
                        Nhân sự nội bộ (quản trị, HDV, nhân viên phòng ban). Tab HDV lọc theo vai trò hướng dẫn viên.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.refreshBtn}
                        onClick={() => { loadStaff(); loadStats(); }}
                        disabled={loading || loadingStats}
                        title="Tải lại"
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span>
                        Tải lại
                    </button>
                    <button
                        type="button"
                        className={styles.addBtn}
                        onClick={() => {
                            setFormMode('create');
                            setFormStaffId(null);
                            setFormOpen(true);
                        }}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>person_add</span>
                        Thêm nhân viên
                    </button>
                </div>
            </div>

            {errorMsg && <div className={`${styles.banner} ${styles.bannerError}`}>{errorMsg}</div>}
            {successMsg && <div className={`${styles.banner} ${styles.bannerSuccess}`}>{successMsg}</div>}

            <div className={styles.statsGrid}>
                <StatCard
                    icon="groups"
                    label="Tổng nhân sự"
                    value={stats ? stats.totalStaff.toLocaleString('vi-VN') : '—'}
                    color="green"
                />
                <StatCard
                    icon="badge"
                    label="Đang làm"
                    value={stats ? stats.activeCount.toLocaleString('vi-VN') : '—'}
                    color="blue"
                />
                <StatCard
                    icon="event_busy"
                    label="Nghỉ phép"
                    value={stats ? stats.onLeaveCount.toLocaleString('vi-VN') : '—'}
                    color="orange"
                />
                <StatCard
                    icon="hiking"
                    label="HDV"
                    value={stats ? stats.guideCount.toLocaleString('vi-VN') : '—'}
                    color="purple"
                />
            </div>

            <div className={styles.tableSection}>
                <div className={styles.filterBar}>
                    <div className={styles.tabs}>
                        {DEPT_TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`${styles.tab} ${filterDept === t.id ? styles.tabActive : ''}`}
                                onClick={() => setFilterDept(t.id)}
                            >
                                {t.label}
                                <span className={styles.tabCount}>{tabCounts[t.id] ?? 0}</span>
                            </button>
                        ))}
                    </div>
                    <div className={styles.rightFilters}>
                        <select
                            className={styles.activeSelect}
                            value={employmentStatus}
                            onChange={(e) => setEmploymentStatus(e.target.value)}
                        >
                            <option value="all">Mọi trạng thái làm việc</option>
                            <option value="active">Đang làm</option>
                            <option value="on_leave">Nghỉ phép</option>
                            <option value="inactive">Đã nghỉ việc</option>
                        </select>
                        <div className={styles.search}>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                            <input
                                type="text"
                                placeholder="Tên, email, SĐT, mã NV..."
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
                    <>
                        <DataTable
                            columns={columns}
                            data={staff}
                            pageSize={tablePageSize}
                            onRowClick={(row) => setOpenDetailId(row.id)}
                            emptyMessage="Không có nhân viên phù hợp"
                            totalLabel="nhân viên"
                            selectable={false}
                        />
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    type="button"
                                    className={styles.pageBtn}
                                    disabled={page <= 0}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                >
                                    Trước
                                </button>
                                <span className={styles.pageInfo}>
                                    Trang {page + 1} / {totalPages}
                                    <span className={styles.pageTotal}>
                                        ({totalElements.toLocaleString('vi-VN')} người)
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    className={styles.pageBtn}
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <StaffDetailModal
                staffId={openDetailId}
                onClose={() => setOpenDetailId(null)}
                onUpdated={(d) => {
                    handleStaffUpdated(d);
                    setSuccessMsg('Đã cập nhật nhân viên');
                    setTimeout(() => setSuccessMsg(''), 2500);
                }}
                onEditClick={(id) => {
                    setOpenDetailId(null);
                    setFormMode('edit');
                    setFormStaffId(id);
                    setFormOpen(true);
                }}
            />

            <StaffFormModal
                open={formOpen}
                mode={formMode}
                staffId={formStaffId}
                onClose={() => {
                    setFormOpen(false);
                    setFormStaffId(null);
                }}
                onSaved={() => {
                    loadStaff();
                    loadStats();
                    setSuccessMsg(formMode === 'create' ? 'Đã tạo nhân viên' : 'Đã cập nhật nhân viên');
                    setTimeout(() => setSuccessMsg(''), 2500);
                }}
            />
        </div>
    );
};

export default StaffManagement;
