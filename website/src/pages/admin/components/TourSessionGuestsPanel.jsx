import React, { useEffect, useMemo, useState } from 'react';
import { getAdminSessionGuests } from '../../../api/adminTourRoster';
import CheckinHistoryPanel from '../../../components/CheckinHistoryPanel';
import styles from './TourDetailModal.module.css';

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
}

function initialsFromName(name) {
    if (!name || !String(name).trim()) return '?';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function TourSessionGuestsPanel({ sessions, preferredSessionId }) {
    const sessionList = Array.isArray(sessions) ? sessions : [];
    const [sessionId, setSessionId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    useEffect(() => {
        if (preferredSessionId && sessionList.some((s) => s.id === preferredSessionId)) {
            setSessionId(preferredSessionId);
            return;
        }
        if (sessionList.length) {
            setSessionId((prev) => (sessionList.some((s) => s.id === prev) ? prev : sessionList[0].id));
        }
    }, [preferredSessionId, sessionList]);

    useEffect(() => {
        if (!sessionId) {
            setData(null);
            return;
        }
        let alive = true;
        setLoading(true);
        setError('');
        setSelectedBookingId(null);
        getAdminSessionGuests(sessionId)
            .then((d) => {
                if (alive) setData(d || null);
            })
            .catch((e) => {
                if (alive) {
                    setData(null);
                    setError(e?.message || 'Không tải được danh sách khách.');
                }
            })
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [sessionId]);

    const bookings = data?.bookings || [];
    const selected = useMemo(
        () => bookings.find((b) => b.bookingId === selectedBookingId) || null,
        [bookings, selectedBookingId]
    );

    if (!sessionList.length) {
        return (
            <div className={styles.empty}>
                <span className="material-icons-round" style={{ fontSize: 28 }}>
                    group
                </span>
                <span>Chưa có đợt khởi hành — thêm đợt rồi xem danh sách khách.</span>
            </div>
        );
    }

    return (
        <div className={styles.rosterWrap}>
            <div className={styles.rosterToolbar}>
                <label className={styles.rosterLabel} htmlFor="admin-tour-session-guests">
                    Đợt khởi hành
                </label>
                <select
                    id="admin-tour-session-guests"
                    className={styles.rosterSelect}
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                >
                    {sessionList.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                            Đợt {idx + 1} · {formatDate(s.startDate)}
                            {s.tourGuide?.fullName ? ` · HDV ${s.tourGuide.fullName}` : ' · chưa gán HDV'}
                            {` · ${s.currentParticipants ?? 0}/${s.maxParticipants ?? 0} chỗ`}
                        </option>
                    ))}
                </select>
            </div>

            {data && (
                <p className={styles.rosterHint}>
                    {data.paidBookingCount} đơn · {data.checkedInGuestSlots}/{data.totalGuestSlots} đã check-in
                    {data.checkedOutParticipants != null ? ` · ${data.checkedOutParticipants} đã check-out` : ''}
                    {data.guideName ? ` · HDV ${data.guideName}` : ''}
                    . Bấm vào khách để xem lịch sử điểm danh HDV.
                </p>
            )}

            {error ? <div className={styles.errorBox}>{error}</div> : null}
            {loading ? <p className={styles.muted}>Đang tải danh sách khách...</p> : null}

            {!loading && !error && bookings.length === 0 && (
                <div className={styles.empty}>
                    <span className="material-icons-round" style={{ fontSize: 28 }}>
                        person_off
                    </span>
                    <span>Chưa có khách trên đoàn (đơn đã thanh toán / xác nhận).</span>
                </div>
            )}

            <ul className={styles.guestList}>
                {bookings.map((b) => {
                    const open = selectedBookingId === b.bookingId;
                    return (
                        <li key={b.bookingId}>
                            <button
                                type="button"
                                className={`${styles.guestRow} ${open ? styles.guestRowOpen : ''}`}
                                onClick={() => setSelectedBookingId(open ? null : b.bookingId)}
                            >
                                <div className={styles.guestAvatarPh}>
                                    {b.avatarUrl ? (
                                        <img src={b.avatarUrl} alt="" />
                                    ) : (
                                        <span>{initialsFromName(b.travelerName)}</span>
                                    )}
                                </div>
                                <div className={styles.guestRowMain}>
                                    <div className={styles.guestRowName}>
                                        {b.travelerName || 'Khách'}
                                        {b.guestCount > 1 ? (
                                            <span className={styles.guestCount}>{b.guestCount} khách</span>
                                        ) : null}
                                    </div>
                                    <div className={styles.guestRowMeta}>
                                        {b.email || '—'}
                                        {b.effectiveContactPhone || b.phone
                                            ? ` · ${b.effectiveContactPhone || b.phone}`
                                            : ''}
                                    </div>
                                </div>
                                <span className={styles.guestStatus}>
                                    {b.allParticipantsCheckedIn
                                        ? 'Đủ điểm danh'
                                        : b.checkedInGathering
                                          ? 'Đã check-in'
                                          : 'Chưa check-in'}
                                </span>
                                <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>
                                    {open ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>
                            {open && selected ? (
                                <CheckinHistoryPanel booking={selected} guideName={data?.guideName} />
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
