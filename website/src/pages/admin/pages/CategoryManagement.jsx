import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import CategoryFormModal from '../components/CategoryFormModal';
import {
    listCategories,
    listArchivedCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
} from '../../../api/categories';
import styles from './CategoryManagement.module.css';

const TABS = [
    { key: 'active', label: 'Đang hoạt động' },
    { key: 'archived', label: 'Đã lưu trữ' },
];

const CategoryManagement = () => {
    const [activeTab, setActiveTab] = useState('active');

    const [activeList, setActiveList] = useState([]);
    const [archivedList, setArchivedList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchActive = useCallback(async () => {
        const data = await listCategories();
        setActiveList(Array.isArray(data) ? data : []);
    }, []);

    const fetchArchived = useCallback(async () => {
        const data = await listArchivedCategories();
        setArchivedList(Array.isArray(data) ? data : []);
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            // Active là endpoint public; archived cần ADMIN → bắt riêng để không che mất danh sách active khi 401/403.
            await fetchActive();
            try {
                await fetchArchived();
            } catch (archiveErr) {
                setArchivedList([]);
                if (activeTab === 'archived') {
                    setErrorMsg(
                        archiveErr?.message ||
                            'Không tải được danh mục đã lưu trữ. Cần đăng nhập với quyền admin.'
                    );
                }
            }
        } catch (err) {
            setErrorMsg(err?.message || 'Không tải được danh mục');
        } finally {
            setLoading(false);
        }
    }, [fetchActive, fetchArchived, activeTab]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const currentList = activeTab === 'active' ? activeList : archivedList;

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return currentList;
        const q = searchQuery.trim().toLowerCase();
        return currentList.filter(
            (c) =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.slug || '').toLowerCase().includes(q)
        );
    }, [currentList, searchQuery]);

    const openCreate = () => {
        setModalMode('create');
        setEditingCategory(null);
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setModalMode('edit');
        setEditingCategory(row);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (payload) => {
        if (modalMode === 'edit' && editingCategory) {
            const updated = await updateCategory(editingCategory.id, payload);
            setActiveList((prev) =>
                prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updated } : c))
            );
            setSuccessMsg('Đã cập nhật danh mục');
        } else {
            const created = await createCategory(payload);
            if (created) {
                setActiveList((prev) => [...prev, created]);
            } else {
                await fetchActive();
            }
            setSuccessMsg('Đã tạo danh mục mới');
        }
        closeModal();
    };

    const handleArchive = async (row) => {
        const ok = window.confirm(
            `Lưu trữ danh mục "${row.name}"?\n\nDanh mục sẽ bị ẩn khỏi danh sách hoạt động nhưng các tour đang gắn vẫn giữ tham chiếu. Bạn có thể khôi phục bất kỳ lúc nào.`
        );
        if (!ok) return;
        try {
            await deleteCategory(row.id);
            setActiveList((prev) => prev.filter((c) => c.id !== row.id));
            setArchivedList((prev) => [
                { ...row, deletedAt: new Date().toISOString() },
                ...prev,
            ]);
            setSuccessMsg('Đã lưu trữ danh mục');
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể lưu trữ danh mục');
        }
    };

    const handleRestore = async (row) => {
        try {
            const restored = await restoreCategory(row.id);
            setArchivedList((prev) => prev.filter((c) => c.id !== row.id));
            setActiveList((prev) => [...prev, restored || { ...row, deletedAt: null }]);
            setSuccessMsg('Đã khôi phục danh mục');
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể khôi phục danh mục');
        }
    };

    const formatDate = (value) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleDateString('vi-VN');
        } catch {
            return '—';
        }
    };

    const baseColumns = [
        {
            key: 'name',
            label: 'Danh mục',
            render: (_, row) => (
                <div className={styles.nameCell}>
                    <div
                        className={`${styles.nameIcon} ${
                            activeTab === 'archived' ? styles.nameIconArchived : ''
                        }`}
                    >
                        <span className="material-icons-round">
                            {activeTab === 'archived' ? 'inventory_2' : 'category'}
                        </span>
                    </div>
                    <div>
                        <div className={styles.nameTitle}>{row.name}</div>
                        <div className={styles.nameSlug}>/{row.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Mô tả',
            render: (val) => (
                <span className={styles.descCell}>{val || <em className={styles.muted}>—</em>}</span>
            ),
        },
        {
            key: 'sortOrder',
            label: 'Thứ tự',
            sortable: true,
            render: (val) =>
                val === null || val === undefined ? (
                    <span className={styles.muted}>—</span>
                ) : (
                    <span className={styles.orderBadge}>{val}</span>
                ),
        },
    ];

    const activeColumns = [
        ...baseColumns,
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            sortable: true,
            render: (val) => <span className={styles.dateCell}>{formatDate(val)}</span>,
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        title="Chỉnh sửa"
                        onClick={() => openEdit(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            edit
                        </span>
                    </button>
                    <button
                        className={`${styles.actionBtn} ${styles.actionDanger}`}
                        title="Lưu trữ"
                        onClick={() => handleArchive(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            inventory_2
                        </span>
                    </button>
                </div>
            ),
        },
    ];

    const archivedColumns = [
        ...baseColumns,
        {
            key: 'deletedAt',
            label: 'Ngày lưu trữ',
            sortable: true,
            render: (val) => <span className={styles.dateCell}>{formatDate(val)}</span>,
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className={styles.actions}>
                    <button
                        className={`${styles.actionBtn} ${styles.actionRestore}`}
                        title="Khôi phục"
                        onClick={() => handleRestore(row)}
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            restore
                        </span>
                    </button>
                </div>
            ),
        },
    ];

    const columns = activeTab === 'active' ? activeColumns : archivedColumns;

    const activeCount = activeList.length;
    const archivedCount = archivedList.length;
    const withDescriptionCount = activeList.filter((c) => (c.description || '').trim()).length;

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Danh Mục</h1>
                    <p className={styles.pageSubtitle}>
                        Quản lý các danh mục dùng để phân loại tour của Flourish Travel
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={fetchAll}
                        disabled={loading}
                        title="Tải lại"
                    >
                        <span className="material-icons-round" style={{ fontSize: 18 }}>
                            {loading ? 'hourglass_top' : 'refresh'}
                        </span>
                        Tải lại
                    </button>
                    {activeTab === 'active' && (
                        <button className={styles.addBtn} onClick={openCreate}>
                            <span className="material-icons-round" style={{ fontSize: 18 }}>
                                add
                            </span>
                            Thêm danh mục
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="category" label="Đang hoạt động" value={String(activeCount)} color="green" />
                <StatCard
                    icon="description"
                    label="Có mô tả"
                    value={String(withDescriptionCount)}
                    color="blue"
                />
                <StatCard
                    icon="inventory_2"
                    label="Đã lưu trữ"
                    value={String(archivedCount)}
                    color="orange"
                />
            </div>

            {(errorMsg || successMsg) && (
                <div
                    className={`${styles.banner} ${
                        errorMsg ? styles.bannerError : styles.bannerSuccess
                    }`}
                >
                    <span className="material-icons-round" style={{ fontSize: 18 }}>
                        {errorMsg ? 'error_outline' : 'check_circle'}
                    </span>
                    <span>{errorMsg || successMsg}</span>
                    <button
                        className={styles.bannerClose}
                        onClick={() => {
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        type="button"
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>
                            close
                        </span>
                    </button>
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {TABS.map((tab) => {
                        const count = tab.key === 'active' ? activeCount : archivedCount;
                        return (
                            <button
                                key={tab.key}
                                className={`${styles.filterTab} ${
                                    activeTab === tab.key ? styles.filterTabActive : ''
                                }`}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setSearchQuery('');
                                }}
                            >
                                {tab.label}
                                <span className={styles.tabCount}>{count}</span>
                            </button>
                        );
                    })}
                </div>
                <div className={styles.filterSearch}>
                    <span
                        className="material-icons-round"
                        style={{ fontSize: 18, color: '#9ca3af' }}
                    >
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filtered}
                totalLabel="danh mục"
                emptyMessage={
                    loading
                        ? 'Đang tải...'
                        : activeTab === 'active'
                          ? 'Chưa có danh mục hoạt động. Bấm "Thêm danh mục" để tạo mới.'
                          : 'Không có danh mục nào trong lưu trữ.'
                }
            />

            <CategoryFormModal
                isOpen={modalOpen}
                mode={modalMode}
                initialData={editingCategory}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default CategoryManagement;
