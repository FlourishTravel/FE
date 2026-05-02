import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import styles from './CustomerManagement.module.css';

const MOCK_CUSTOMERS = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', phone: '0901 234 567', tier: 'VIP', totalSpent: '₫125.5M', bookings: 8, joinDate: '03/2024', lastActive: '28/04/2026', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', phone: '0912 345 678', tier: 'Gold', totalSpent: '₫68.2M', bookings: 5, joinDate: '06/2024', lastActive: '28/04/2026', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Lê Minh Châu', email: 'chau.le@email.com', phone: '0923 456 789', tier: 'VIP', totalSpent: '₫215.8M', bookings: 12, joinDate: '01/2024', lastActive: '27/04/2026', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 4, name: 'Phạm Đức Duy', email: 'duy.pham@email.com', phone: '0934 567 890', tier: 'Silver', totalSpent: '₫22M', bookings: 2, joinDate: '09/2024', lastActive: '27/04/2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: 5, name: 'Hoàng Thị Em', email: 'em.hoang@email.com', phone: '0945 678 901', tier: 'Gold', totalSpent: '₫85.5M', bookings: 6, joinDate: '04/2024', lastActive: '26/04/2026', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    { id: 6, name: 'Vũ Quang Huy', email: 'huy.vu@email.com', phone: '0956 789 012', tier: 'Standard', totalSpent: '₫12M', bookings: 1, joinDate: '11/2024', lastActive: '25/04/2026', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
    { id: 7, name: 'Đặng Thu Hương', email: 'huong.dang@email.com', phone: '0967 890 123', tier: 'Gold', totalSpent: '₫92M', bookings: 7, joinDate: '02/2024', lastActive: '24/04/2026', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
    { id: 8, name: 'Bùi Văn Khoa', email: 'khoa.bui@email.com', phone: '0978 901 234', tier: 'Silver', totalSpent: '₫35.6M', bookings: 3, joinDate: '07/2024', lastActive: '23/04/2026', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
];

const TIER_CONFIG = {
    VIP: { className: 'tierVIP' },
    Gold: { className: 'tierGold' },
    Silver: { className: 'tierSilver' },
    Standard: { className: 'tierStandard' },
};

const ACTIVITIES = [
    { date: '28/04/2026', text: 'Đặt tour Bangkok-Pattaya', type: 'booking' },
    { date: '15/04/2026', text: 'Hoàn thành tour Sapa Misty Peaks', type: 'completed' },
    { date: '10/03/2026', text: 'Đặt tour Đà Nẵng-Hội An', type: 'booking' },
    { date: '25/02/2026', text: 'Nâng hạng VIP', type: 'upgrade' },
];

const CustomerManagement = () => {
    const [filterTier, setFilterTier] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(MOCK_CUSTOMERS[0]);

    const filtered = MOCK_CUSTOMERS.filter(c => {
        if (filterTier !== 'all' && c.tier !== filterTier) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
        }
        return true;
    });

    const columns = [
        {
            key: 'name', label: 'Khách hàng',
            render: (_, row) => (
                <div className={styles.custCell}>
                    <img src={row.avatar} alt="" className={styles.custAvatar} />
                    <div>
                        <div className={styles.custName}>{row.name}</div>
                        <div className={styles.custEmail}>{row.email}</div>
                    </div>
                </div>
            )
        },
        { key: 'phone', label: 'SĐT' },
        {
            key: 'tier', label: 'Hạng',
            render: (v) => <span className={`${styles.tier} ${styles[TIER_CONFIG[v]?.className]}`}>{v}</span>
        },
        { key: 'totalSpent', label: 'Tổng chi tiêu', sortable: true },
        { key: 'bookings', label: 'Booking', sortable: true },
        { key: 'lastActive', label: 'Hoạt động' },
        {
            key: 'actions', label: '',
            render: (_, row) => (
                <button className={styles.viewBtn} onClick={(e) => { e.stopPropagation(); setSelected(row); }}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>visibility</span>
                </button>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Khách Hàng</h1>
                    <p className={styles.pageSub}>Quản lý cơ sở dữ liệu khách hàng và lịch sử dịch vụ.</p>
                </div>
                <button className={styles.addBtn}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>person_add</span>
                    Thêm Khách Hàng
                </button>
            </div>

            <div className={styles.statsGrid}>
                <StatCard icon="group" label="Tổng Khách Hàng" value="1,245" trend="up" trendValue="+56" color="green" />
                <StatCard icon="workspace_premium" label="Khách Hàng VIP" value="89" trend="up" trendValue="+5" color="purple" />
                <StatCard icon="replay" label="Tỷ Lệ Quay Lại" value="34%" trend="up" trendValue="+3%" color="blue" />
                <StatCard icon="account_balance_wallet" label="Chi Tiêu TB" value="₫15.2M" color="orange" />
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.tableSection}>
                    <div className={styles.filterBar}>
                        <div className={styles.tabs}>
                            {['all', 'VIP', 'Gold', 'Silver', 'Standard'].map(t => (
                                <button key={t} className={`${styles.tab} ${filterTier === t ? styles.tabActive : ''}`} onClick={() => setFilterTier(t)}>
                                    {t === 'all' ? 'Tất cả' : t}
                                </button>
                            ))}
                        </div>
                        <div className={styles.search}>
                            <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                            <input type="text" placeholder="Tìm khách hàng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} />
                        </div>
                    </div>
                    <DataTable columns={columns} data={filtered} onRowClick={setSelected} totalLabel="khách hàng" />
                </div>

                {selected && (
                    <div className={styles.panel}>
                        <div className={styles.panelHead}>
                            <h3 className={styles.panelTitle}>Chi tiết khách hàng</h3>
                            <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className={styles.profile}>
                            <img src={selected.avatar} alt="" className={styles.profileAvatar} />
                            <h4 className={styles.profileName}>{selected.name}</h4>
                            <span className={`${styles.tier} ${styles[TIER_CONFIG[selected.tier]?.className]}`}>{selected.tier}</span>
                        </div>
                        <div className={styles.section}>
                            <h5 className={styles.sectionTitle}>Thông tin liên hệ</h5>
                            <div className={styles.infoRow}><span className="material-icons-round" style={{ fontSize: '16px', color: '#9ca3af' }}>mail</span><span>{selected.email}</span></div>
                            <div className={styles.infoRow}><span className="material-icons-round" style={{ fontSize: '16px', color: '#9ca3af' }}>phone</span><span>{selected.phone}</span></div>
                            <div className={styles.infoRow}><span className="material-icons-round" style={{ fontSize: '16px', color: '#9ca3af' }}>calendar_today</span><span>Tham gia: {selected.joinDate}</span></div>
                        </div>
                        <div className={styles.panelStats}>
                            <div className={styles.pStat}><span className={styles.pStatVal}>{selected.bookings}</span><span className={styles.pStatLbl}>Booking</span></div>
                            <div className={styles.pStat}><span className={styles.pStatVal}>{selected.totalSpent}</span><span className={styles.pStatLbl}>Chi tiêu</span></div>
                        </div>
                        <div className={styles.section}>
                            <h5 className={styles.sectionTitle}>Hoạt động gần đây</h5>
                            {ACTIVITIES.map((a, i) => (
                                <div key={i} className={styles.actItem}>
                                    <div className={styles.actDot}></div>
                                    <div><div className={styles.actDate}>{a.date}</div><div className={styles.actText}>{a.text}</div></div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.panelActions}>
                            <button className={styles.btnPrimary}><span className="material-icons-round" style={{ fontSize: '16px' }}>mail</span>Gửi Email</button>
                            <button className={styles.btnSecondary}><span className="material-icons-round" style={{ fontSize: '16px' }}>edit</span>Chỉnh sửa</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;
