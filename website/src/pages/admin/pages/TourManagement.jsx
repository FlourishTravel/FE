import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import CreateTourModal from '../components/CreateTourModal';
import styles from './TourManagement.module.css';

const MOCK_TOURS = [
    { id: 1, name: 'Bangkok-Pattaya', code: 'TH-BKKPAT-01', status: 'active', price: '₫12.500.000', departure: '15/05/2026', spots: 8, total: 20, category: 'Đông Nam Á', duration: '5N4Đ', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=100&q=80' },
    { id: 2, name: 'Đà Nẵng-Hội An', code: 'VN-DANHA-05', status: 'active', price: '₫8.200.000', departure: '20/05/2026', spots: 12, total: 25, category: 'Trong nước', duration: '4N3Đ', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Costa Rica Trek', code: 'CR-TREK-12', status: 'upcoming', price: '₫35.000.000', departure: '01/06/2026', spots: 6, total: 10, category: 'Châu Mỹ', duration: '7N6Đ', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=100&q=80' },
    { id: 4, name: 'Bali Discovery', code: 'ID-BALI-09', status: 'active', price: '₫18.500.000', departure: '10/05/2026', spots: 3, total: 15, category: 'Đông Nam Á', duration: '6N5Đ', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=100&q=80' },
    { id: 5, name: 'Norway Aurora', code: 'NO-AUR-02', status: 'full', price: '₫45.000.000', departure: '15/12/2026', spots: 0, total: 8, category: 'Châu Âu', duration: '5N4Đ', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=100&q=80' },
    { id: 6, name: 'Tokyo Experience', code: 'JP-TOK-15', status: 'active', price: '₫28.000.000', departure: '25/05/2026', spots: 10, total: 20, category: 'Đông Á', duration: '6N5Đ', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=100&q=80' },
    { id: 7, name: 'Swiss Alps Grandeur', code: 'CH-ALPS-07', status: 'upcoming', price: '₫52.000.000', departure: '10/07/2026', spots: 8, total: 12, category: 'Châu Âu', duration: '8N7Đ', image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=100&q=80' },
    { id: 8, name: 'Sapa Misty Peaks', code: 'VN-SAPA-03', status: 'active', price: '₫6.500.000', departure: '18/05/2026', spots: 15, total: 30, category: 'Trong nước', duration: '3N2Đ', image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=100&q=80' },
    { id: 9, name: 'Phú Quốc Paradise', code: 'VN-PQ-11', status: 'full', price: '₫9.800.000', departure: '05/05/2026', spots: 0, total: 20, category: 'Trong nước', duration: '4N3Đ', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=100&q=80' },
    { id: 10, name: 'Maldives Luxury', code: 'MV-LUX-04', status: 'full', price: '₫65.000.000', departure: '20/06/2026', spots: 0, total: 6, category: 'Biển đảo', duration: '5N4Đ', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=100&q=80' },
];

const STATUS_CONFIG = {
    active: { label: 'Đang hoạt động', className: 'statusActive' },
    upcoming: { label: 'Sắp khởi hành', className: 'statusUpcoming' },
    full: { label: 'Đã hết chỗ', className: 'statusFull' },
};

const TourManagement = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredTours = MOCK_TOURS.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const columns = [
        {
            key: 'name',
            label: 'Tour',
            render: (_, row) => (
                <div className={styles.tourCell}>
                    <img src={row.image} alt={row.name} className={styles.tourThumb} />
                    <div>
                        <div className={styles.tourName}>{row.name}</div>
                        <div className={styles.tourCode}>{row.code}</div>
                    </div>
                </div>
            )
        },
        { key: 'category', label: 'Danh mục' },
        { key: 'duration', label: 'Thời gian' },
        { key: 'price', label: 'Giá', sortable: true },
        { key: 'departure', label: 'Khởi hành', sortable: true },
        {
            key: 'spots',
            label: 'Chỗ trống',
            render: (_, row) => (
                <div className={styles.spotsCell}>
                    <div className={styles.spotsBar}>
                        <div className={styles.spotsFill} style={{ width: `${((row.total - row.spots) / row.total) * 100}%` }}></div>
                    </div>
                    <span className={styles.spotsText}>{row.spots}/{row.total}</span>
                </div>
            )
        },
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
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Chỉnh sửa">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button className={styles.actionBtn} title="Xem chi tiết">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionDanger}`} title="Xóa">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Tour</h1>
                    <p className={styles.pageSubtitle}>Quản lý tất cả các tour du lịch của Flourish Travel</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsCreateModalOpen(true)}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
                    Thêm Tour Mới
                </button>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="travel_explore" label="Tổng số Tour" value="24" trend="up" trendValue="+3" color="green" />
                <StatCard icon="check_circle" label="Đang hoạt động" value="18" color="blue" />
                <StatCard icon="schedule" label="Sắp khởi hành" value="5" color="orange" />
                <StatCard icon="block" label="Đã hết chỗ" value="3" color="red" />
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'active', label: 'Đang hoạt động' },
                        { key: 'upcoming', label: 'Sắp khởi hành' },
                        { key: 'full', label: 'Đã hết chỗ' },
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
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
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
            />
            
            <CreateTourModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
        </div>
    );
};

export default TourManagement;
