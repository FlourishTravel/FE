import React, { useEffect, useState } from 'react';
import { getAdminTourWaitlist } from '../../../api/adminTourRoster';
import styles from './TourDetailModal.module.css';

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
}

function formatDt(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return '—';
    }
}

const STATUS_LABEL = {
    waiting: 'Đang chờ',
    notified: 'Đã thông báo',
    booked: 'Đã đặt',
    cancelled: 'Đã huỷ',
};

export default function TourWaitlistPanel({ tourId }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tourId) return;
        let alive = true;
        setLoading(true);
        setError('');
        getAdminTourWaitlist(tourId)
            .then((list) => {
                if (alive) setRows(list);
            })
            .catch((e) => {
                if (alive) {
                    setRows([]);
                    setError(e?.message || 'Không tải được danh sách chờ.');
                }
            })
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [tourId]);

    if (loading) {
        return <p className={styles.muted}>Đang tải danh sách chờ...</p>;
    }
    if (error) {
        return <div className={styles.errorBox}>{error}</div>;
    }
    if (!rows.length) {
        return (
            <div className={styles.empty}>
                <span className="material-icons-round" style={{ fontSize: 28 }}>
                    hourglass_empty
                </span>
                <span>Chưa có khách đăng ký danh sách chờ cho tour này.</span>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <p className={styles.rosterHint}>
                {rows.length} người đang chờ chỗ trống hoặc lịch mới. Khách đăng ký khi đợt đã hết chỗ / chưa có ngày.
            </p>
            <table className={styles.sessionTable}>
                <thead>
                    <tr>
                        <th>Khách</th>
                        <th>Liên hệ</th>
                        <th>Phạm vi</th>
                        <th>Trạng thái</th>
                        <th>Đăng ký</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td>
                                <div className={styles.guestRowName}>{r.fullName || '—'}</div>
                                <div className={styles.muted}>{r.email || ''}</div>
                            </td>
                            <td>{r.phone || '—'}</td>
                            <td>
                                {r.scope === 'session'
                                    ? `Đợt ${formatDate(r.sessionStartDate)}`
                                    : 'Cả tour (chờ lịch mới)'}
                            </td>
                            <td>{STATUS_LABEL[r.status] || r.status || '—'}</td>
                            <td>{formatDt(r.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
