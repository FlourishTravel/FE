import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import CreateTourModal from '../components/CreateTourModal';
import TourDetailModal from '../components/TourDetailModal';
import { listAdminTours, deleteTour } from '../../../api/tours';
import styles from './TourManagement.module.css';

const STATUS_CONFIG = {
    active: { label: 'Đang hoạt động', className: 'statusActive' },
    upcoming: { label: 'Sắp khởi hành', className: 'statusUpcoming' },
    ongoing: { label: 'Đang diễn ra', className: 'statusOngoing' },
    completed: { label: 'Đã kết thúc', className: 'statusCompleted' },
    full: { label: 'Đã hết chỗ', className: 'statusFull' },
    draft: { label: 'Nháp', className: 'statusDraft' },
};

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80';

const PAGE_SIZE = 20;

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

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
};

const formatDuration = (days, nights) => {
    if (!days && !nights) return '—';
    const d = days ?? 0;
    const n = nights ?? Math.max(0, d - 1);
    return `${d}N${n}Đ`;
};

const TourManagement = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [detailTourId, setDetailTourId] = useState(null);

    const fetchTours = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            // Status filter để client-side cho mượt; chỉ truyền q + size lớn
            const data = await listAdminTours({ size: PAGE_SIZE * 5 });
            setTours(data.content);
        } catch (err) {
            setErrorMsg(
                err?.message ||
                    'Không tải được danh sách tour. Cần đăng nhập với quyền admin để xem dữ liệu thật.'
            );
            setTours([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const filteredTours = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return tours.filter((t) => {
            if (filterStatus !== 'all' && t.status !== filterStatus) return false;
            if (!q) return true;
            return (
                (t.title || '').toLowerCase().includes(q) ||
                (t.slug || '').toLowerCase().includes(q)
            );
        });
    }, [tours, filterStatus, searchQuery]);

    const stats = useMemo(() => {
        const counts = { active: 0, upcoming: 0, ongoing: 0, completed: 0, full: 0, draft: 0 };
        tours.forEach((t) => {
            if (counts[t.status] !== undefined) counts[t.status] += 1;
        });
        return { total: tours.length, ...counts };
    }, [tours]);

    const handleCreated = (_, departureWarning) => {
        setSuccessMsg(
            departureWarning
                ? `Đã tạo tour mới. Lưu ý: ${departureWarning}`
                : 'Đã tạo tour mới'
        );
        fetchTours();
    };

    const handleEdit = (row) => {
        navigate(`/admin/tours/itinerary/${row.id}`);
    };

    const handleViewDetail = (row) => {
        setDetailTourId(row.id);
    };

    const handleEditFromDetail = (detail) => {
        setDetailTourId(null);
        if (detail?.id) navigate(`/admin/tours/itinerary/${detail.id}`);
    };

    const handleDelete = async (row) => {
        const ok = window.confirm(
            `Xoá tour "${row.title}"?\n\nNếu tour đã có booking, BE sẽ từ chối để bảo vệ dữ liệu liên quan.`
        );
        if (!ok) return;
        try {
            await deleteTour(row.id);
            setTours((prev) => prev.filter((t) => t.id !== row.id));
            setSuccessMsg('Đã xoá tour');
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể xoá tour');
        }
    };

    const columns = [
        {
            key: 'title',
            label: 'Tour',
            render: (_, row) => (
                <div className={styles.tourCell}>
                    <img
                        src={row.thumbnailUrl || PLACEHOLDER_IMG}
                        alt={row.title}
                        className={styles.tourThumb}
                        onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                    />
                    <div>
                        <div className={styles.tourName}>{row.title}</div>
                        <div className={styles.tourCode}>/{row.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Danh mục',
            render: (_, row) =>
                row.category ? (
                    <span>
                        {row.category.name}
                        {row.category.archived && (
                            <span
                                style={{
                                    marginLeft: 6,
                                    fontSize: 11,
                                    color: '#b45309',
                                    background: '#fef3c7',
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                }}
                                title="Danh mục đã lưu trữ"
                            >
                                lưu trữ
                            </span>
                        )}
                    </span>
                ) : (
                    <span style={{ color: '#9ca3af' }}>—</span>
                ),
        },
        {
            key: 'duration',
            label: 'Thời gian',
            render: (_, row) => formatDuration(row.durationDays, row.durationNights),
        },
        {
            key: 'basePrice',
            label: 'Giá',
            sortable: true,
            render: (_, row) => formatVnd(row.basePrice),
        },
        {
            key: 'departure',
            label: 'Khởi hành',
            sortable: true,
            render: (_, row) => formatDate(row.earliestSession?.startDate),
        },
        {
            key: 'spots',
            label: 'Chỗ trống',
            render: (_, row) => {
                const s = row.earliestSession;
                if (!s || s.maxParticipants == null) {
                    return <span style={{ color: '#9ca3af' }}>—</span>;
                }
                const total = s.maxParticipants;
                const current = s.currentParticipants ?? 0;
                const remaining = Math.max(0, total - current);
                const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
                return (
                    <div className={styles.spotsCell}>
                        <div className={styles.spotsBar}>
                            <div className={styles.spotsFill} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className={styles.spotsText}>
                            {remaining}/{total}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => {
                const cfg = STATUS_CONFIG[val] || STATUS_CONFIG.draft;
                return (
                    <span className={`${styles.statusBadge} ${styles[cfg.className]}`}>
                        {cfg.label}
                    </span>
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
                        title="Chỉnh sửa & lịch trình"
                        onClick={() => handleEdit(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>
                            edit
                        </span>
                    </button>
                    <button
                        className={styles.actionBtn}
                        title="Xem chi tiết"
                        onClick={() => handleViewDetail(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>
                            visibility
                        </span>
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.actionDanger}`}
                        title="Xóa"
                        onClick={() => handleDelete(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>
                            delete
                        </span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Tour</h1>
                    <p className={styles.pageSubtitle}>
                        Quản lý tất cả các tour du lịch của Flourish Travel
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className={styles.refreshBtn || styles.addBtn}
                        onClick={fetchTours}
                        disabled={loading}
                        style={{
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #e5e7eb',
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            {loading ? 'hourglass_top' : 'refresh'}
                        </span>
                        Tải lại
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsCreateModalOpen(true)}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>
                            add
                        </span>
                        Thêm Tour Mới
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="travel_explore" label="Tổng số Tour" value={String(stats.total)} color="green" />
                <StatCard
                    icon="check_circle"
                    label="Đang hoạt động"
                    value={String(stats.active)}
                    color="blue"
                />
                <StatCard
                    icon="schedule"
                    label="Sắp khởi hành"
                    value={String(stats.upcoming)}
                    color="orange"
                />
                <StatCard icon="block" label="Đã hết chỗ" value={String(stats.full)} color="red" />
            </div>

            {(errorMsg || successMsg) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        background: errorMsg ? '#fef2f2' : '#ecfdf5',
                        color: errorMsg ? '#b91c1c' : '#047857',
                        border: errorMsg ? '1px solid #fecaca' : '1px solid #a7f3d0',
                    }}
                >
                    <span className="material-icons-round" style={{ fontSize: 18 }}>
                        {errorMsg ? 'error_outline' : 'check_circle'}
                    </span>
                    <span>{errorMsg || successMsg}</span>
                    <button
                        onClick={() => {
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4,
                            borderRadius: 6,
                            opacity: 0.7,
                        }}
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>
                            close
                        </span>
                    </button>
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'active', label: 'Đang hoạt động' },
                        { key: 'ongoing', label: 'Đang diễn ra' },
                        { key: 'upcoming', label: 'Sắp khởi hành' },
                        { key: 'completed', label: 'Đã kết thúc' },
                        { key: 'full', label: 'Đã hết chỗ' },
                        { key: 'draft', label: 'Nháp' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.filterTab} ${
                                filterStatus === tab.key ? styles.filterTabActive : ''
                            }`}
                            onClick={() => setFilterStatus(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm tour..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredTours}
                selectable={true}
                totalLabel="tour"
                emptyMessage={
                    loading
                        ? 'Đang tải...'
                        : tours.length === 0
                          ? 'Chưa có tour nào.'
                          : 'Không có tour khớp bộ lọc.'
                }
            />

            <CreateTourModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleCreated}
            />

            <TourDetailModal
                isOpen={Boolean(detailTourId)}
                tourId={detailTourId}
                onClose={() => setDetailTourId(null)}
                onEdit={handleEditFromDetail}
            />
        </div>
    );
};

export default TourManagement;
