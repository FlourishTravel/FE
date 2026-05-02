import React, { useState } from 'react';
import styles from './DataTable.module.css';

const DataTable = ({
    columns,
    data,
    pageSize = 8,
    selectable = false,
    onRowClick,
    emptyMessage = 'Không có dữ liệu',
    totalLabel = 'mục',
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const totalPages = Math.ceil(data.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedData = data.slice(startIdx, startIdx + pageSize);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const toggleRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(d => d.id));
        }
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {selectable && (
                                <th className={styles.checkboxCol}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={toggleAll}
                                        className={styles.checkbox}
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${styles.th} ${col.sortable ? styles.sortable : ''}`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                    style={col.width ? { width: col.width } : {}}
                                >
                                    <span className={styles.thContent}>
                                        {col.label}
                                        {col.sortable && sortConfig.key === col.key && (
                                            <span className="material-icons-round" style={{ fontSize: '16px' }}>
                                                {sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.emptyRow}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <tr
                                    key={row.id || idx}
                                    className={`${styles.tr} ${onRowClick ? styles.clickable : ''} ${selectedRows.includes(row.id) ? styles.selected : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {selectable && (
                                        <td className={styles.checkboxCol}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={(e) => { e.stopPropagation(); toggleRow(row.id); }}
                                                className={styles.checkbox}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className={styles.td}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                    Hiển thị {startIdx + 1}-{Math.min(startIdx + pageSize, data.length)} của {data.length} {totalLabel}
                </span>
                <div className={styles.pageButtons}>
                    <button
                        className={styles.pageBtn}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    {totalPages > 5 && <span className={styles.pageDots}>...</span>}
                    <button
                        className={styles.pageBtn}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                </div>
                {selectable && selectedRows.length > 0 && (
                    <span className={styles.selectedInfo}>
                        {selectedRows.length} {totalLabel} đã chọn
                    </span>
                )}
            </div>
        </div>
    );
};

export default DataTable;
