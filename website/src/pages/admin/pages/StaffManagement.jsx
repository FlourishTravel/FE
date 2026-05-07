import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import styles from './StaffManagement.module.css';

const MOCK_STAFF = [
    { id: 'EMP-001', name: 'Nguyễn Trần Minh', role: 'Super Admin', phone: '0901234567', email: 'minh.nt@flourish.com', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Minh+Nguyen&background=eff6ff&color=3b82f6' },
    { id: 'EMP-002', name: 'Trần Hương Ly', role: 'Sales Tour', phone: '0912345678', email: 'ly.th@flourish.com', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Ly+Tran&background=ecfdf5&color=10b981' },
    { id: 'EMP-003', name: 'Lê Hoàng Hải', role: 'Điều hành', phone: '0923456789', email: 'hai.lh@flourish.com', status: 'on_leave', avatar: 'https://ui-avatars.com/api/?name=Hai+Le&background=fef3c7&color=d97706' },
    { id: 'EMP-004', name: 'Phạm Thanh Mai', role: 'Kế toán', phone: '0934567890', email: 'mai.pt@flourish.com', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Mai+Pham&background=f3e8ff&color=9333ea' },
    { id: 'EMP-005', name: 'Hoàng Minh Tuấn', role: 'Sales Tour', phone: '0945678901', email: 'tuan.hm@flourish.com', status: 'inactive', avatar: 'https://ui-avatars.com/api/?name=Tuan+Hoang&background=f3f4f6&color=4b5563' },
];

const STATUS_CONFIG = {
    active: { label: 'Đang làm', className: 'statusActive' },
    on_leave: { label: 'Nghỉ phép', className: 'statusOnLeave' },
    inactive: { label: 'Đã nghỉ việc', className: 'statusInactive' },
};

const StaffManagement = () => {
    const [filterRole, setFilterRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStaff = MOCK_STAFF.filter(s => {
        if (filterRole !== 'all' && s.role !== filterRole && filterRole !== 'Other') return false;
        // Simple role grouping if we wanted to group 'Super Admin' and 'Điều hành' as 'Other' for example, 
        // but here we'll just match exact if not 'all'. We can refine filters as needed.
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const columns = [
        {
            key: 'name',
            label: 'Nhân viên',
            render: (_, row) => (
                <div className={styles.staffCell}>
                    <img src={row.avatar} alt={row.name} className={styles.staffAvatar} />
                    <div>
                        <div className={styles.staffName}>{row.name}</div>
                        <div className={styles.staffId}>{row.id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Vai trò',
            render: (val) => <span className={styles.roleBadge}>{val}</span>
        },
        {
            key: 'contact',
            label: 'Thông tin liên hệ',
            render: (_, row) => (
                <div className={styles.contactInfo}>
                    <span className={styles.contactPhone}>{row.phone}</span>
                    <span className={styles.contactEmail}>{row.email}</span>
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
                    <button className={styles.actionBtn} title="Chỉnh sửa quyền">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>manage_accounts</span>
                    </button>
                    <button className={styles.actionBtn} title="Sửa thông tin">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionDanger}`} title="Vô hiệu hóa">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>person_off</span>
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Quản Lý Nhân Viên</h1>
                    <p className={styles.pageSubtitle}>Quản lý quyền hạn và thông tin cá nhân của các thành viên trong hệ thống.</p>
                </div>
                <button className={styles.addBtn}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>person_add</span>
                    Thêm Nhân Viên Mới
                </button>
            </div>

            <div className={styles.contentArea}>
                <div className={styles.filterBar}>
                    <div className={styles.filterTabs}>
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'Sales Tour', label: 'Sales Tour' },
                            { key: 'Điều hành', label: 'Điều hành' },
                            { key: 'Kế toán', label: 'Kế toán' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`${styles.filterTab} ${filterRole === tab.key ? styles.filterTabActive : ''}`}
                                onClick={() => setFilterRole(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.filterSearch}>
                        <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhân viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredStaff}
                    selectable={true}
                    totalLabel="nhân viên"
                />
            </div>
        </div>
    );
};

export default StaffManagement;
