import React from 'react';
import styles from './CheckinHistoryPanel.module.css';

export function formatCheckinDt(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return String(iso);
    }
}

function stopLabel(att) {
    const loc = att?.locationName && String(att.locationName).trim();
    const title = att?.activityTitle && String(att.activityTitle).trim();
    const name = loc || title || 'Điểm trong lịch trình';
    if (att?.dayNumber != null) return `Ngày ${att.dayNumber} · ${name}`;
    return name;
}

/**
 * Lịch sử điểm danh / trả khách do HDV ghi nhận — theo đơn (người đặt + khách kèm).
 */
export default function CheckinHistoryPanel({ booking, guideName }) {
    const participants = booking?.participantAttendance || [];
    if (!booking) return null;

    return (
        <div className={styles.wrap}>
            <div className={styles.head}>
                <span className="material-icons-round" style={{ fontSize: 18 }}>history</span>
                <div>
                    <strong>Lịch sử check-in / check-out HDV</strong>
                    <p className={styles.sub}>
                        {guideName
                            ? `HDV phụ trách: ${guideName}`
                            : 'Chưa gán HDV cho đợt này — thời điểm do HDV ghi khi điểm danh.'}
                    </p>
                </div>
            </div>

            {participants.length === 0 ? (
                <p className={styles.empty}>Chưa có dòng người tham gia để ghi nhận điểm danh.</p>
            ) : (
                <ul className={styles.people}>
                    {participants.map((p) => {
                        const stops = (p.activityAttendance || []).filter((a) => a.checkInAt || a.checkOutAt);
                        return (
                            <li key={p.participantId} className={styles.person}>
                                <div className={styles.personTitle}>
                                    <span className={styles.role}>
                                        {p.participantRole === 'LEAD' ? 'Người đặt' : 'Khách kèm'}
                                    </span>
                                    <span className={styles.name}>{p.displayName || '—'}</span>
                                </div>
                                <div className={styles.times}>
                                    <span>
                                        Check-in đoàn:{' '}
                                        <strong>{p.checkInAt ? formatCheckinDt(p.checkInAt) : 'Chưa'}</strong>
                                    </span>
                                    <span>
                                        Check-out đoàn:{' '}
                                        <strong>{p.checkOutAt ? formatCheckinDt(p.checkOutAt) : 'Chưa'}</strong>
                                    </span>
                                </div>
                                {stops.length > 0 && (
                                    <ul className={styles.stops}>
                                        {stops.map((att) => (
                                            <li key={att.activityId || `${p.participantId}-${att.checkInAt}`}>
                                                <span className={styles.stopName}>{stopLabel(att)}</span>
                                                <span>
                                                    In {att.checkInAt ? formatCheckinDt(att.checkInAt) : '—'}
                                                    {' · '}
                                                    Out {att.checkOutAt ? formatCheckinDt(att.checkOutAt) : '—'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
