import React, { useState } from 'react';
import styles from './GuideExpenses.module.css';

const EXPENSES = [
    { id: 1, date: '24/10', category: 'Vận chuyển', desc: 'Phí cầu đường cao tốc HN-HL', amount: '850.000', status: 'approved' },
    { id: 2, date: '24/10', category: 'Ăn uống', desc: 'Bữa trưa đoàn - NH Hải Sản', amount: '6.200.000', status: 'approved' },
    { id: 3, date: '24/10', category: 'Vé tham quan', desc: 'Vé Hang Sửng Sốt x24', amount: '3.600.000', status: 'pending' },
    { id: 4, date: '25/10', category: 'Lưu trú', desc: 'KS Mường Thanh - 12 phòng', amount: '18.000.000', status: 'pending' },
    { id: 5, date: '25/10', category: 'Khác', desc: 'Nước uống + snack trên xe', amount: '480.000', status: 'approved' },
];

const STATUS_MAP = {
    approved: { label: 'Đã duyệt', class: 'statusApproved' },
    pending: { label: 'Chờ duyệt', class: 'statusPending' },
    rejected: { label: 'Từ chối', class: 'statusRejected' },
};

const GuideExpenses = () => {
    const [showForm, setShowForm] = useState(false);

    const totalBudget = 45000000;
    const totalSpent = EXPENSES.reduce((sum, e) => sum + parseInt(e.amount.replace(/\./g, '')), 0);
    const remaining = totalBudget - totalSpent;
    const spentPercent = Math.round((totalSpent / totalBudget) * 100);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>Chi phí Tour: Bờ Tây Nước Mỹ</h1>
                    <p className={styles.pageSubtitle}>
                        <span className="material-icons-round" style={{ fontSize: '16px' }}>account_balance_wallet</span>
                        Quản lý ngân sách và các khoản chi tiêu thực tế.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnOutline}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>download</span>
                        Xuất báo cáo
                    </button>
                    <button className={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
                        Thêm chi phí
                    </button>
                </div>
            </div>

            {/* Budget Overview */}
            <div className={styles.budgetGrid}>
                <div className={styles.budgetCard}>
                    <div className={styles.budgetIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <span className="material-icons-round">account_balance_wallet</span>
                    </div>
                    <div>
                        <span className={styles.budgetLabel}>Ngân sách Tour</span>
                        <span className={styles.budgetValue}>₫{(totalBudget / 1000000).toFixed(0)} Tr</span>
                    </div>
                </div>
                <div className={styles.budgetCard}>
                    <div className={styles.budgetIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                        <span className="material-icons-round">payments</span>
                    </div>
                    <div>
                        <span className={styles.budgetLabel}>Đã chi</span>
                        <span className={styles.budgetValue}>₫{(totalSpent / 1000000).toFixed(1)} Tr</span>
                    </div>
                </div>
                <div className={styles.budgetCard}>
                    <div className={styles.budgetIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                        <span className="material-icons-round">savings</span>
                    </div>
                    <div>
                        <span className={styles.budgetLabel}>Còn lại</span>
                        <span className={styles.budgetValue}>₫{(remaining / 1000000).toFixed(1)} Tr</span>
                    </div>
                </div>
                <div className={styles.budgetCard}>
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span className={styles.budgetLabel}>Sử dụng</span>
                            <span className={styles.progressPercent}>{spentPercent}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${spentPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className={styles.formCard}>
                    <h3 className={styles.formTitle}>Thêm khoản chi mới</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hạng mục</label>
                            <select className={styles.formSelect}>
                                <option>Vận chuyển</option>
                                <option>Ăn uống</option>
                                <option>Vé tham quan</option>
                                <option>Lưu trú</option>
                                <option>Khác</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Số tiền (VNĐ)</label>
                            <input type="text" className={styles.formInput} placeholder="0" />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.formLabel}>Mô tả</label>
                            <input type="text" className={styles.formInput} placeholder="Nhập mô tả chi phí..." />
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Hủy</button>
                        <button className={styles.submitBtn}>
                            <span className="material-icons-round" style={{ fontSize: '16px' }}>check</span>
                            Lưu chi phí
                        </button>
                    </div>
                </div>
            )}

            {/* Expense Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>
                        <span className="material-icons-round" style={{ fontSize: '20px', color: '#059669' }}>receipt_long</span>
                        Danh sách chi phí
                    </h2>
                    <div className={styles.tableFilter}>
                        <button className={`${styles.filterBtn} ${styles.filterActive}`}>Tất cả</button>
                        <button className={styles.filterBtn}>Đã duyệt</button>
                        <button className={styles.filterBtn}>Chờ duyệt</button>
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Hạng mục</th>
                                <th>Mô tả</th>
                                <th>Số tiền (₫)</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXPENSES.map(expense => (
                                <tr key={expense.id}>
                                    <td className={styles.dateCol}>{expense.date}</td>
                                    <td>
                                        <span className={styles.categoryTag}>{expense.category}</span>
                                    </td>
                                    <td className={styles.descCol}>{expense.desc}</td>
                                    <td className={styles.amountCol}>{expense.amount}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[STATUS_MAP[expense.status].class]}`}>
                                            {STATUS_MAP[expense.status].label}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.moreBtn}>
                                            <span className="material-icons-round">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuideExpenses;
