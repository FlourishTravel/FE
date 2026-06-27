import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './GuideGuestManagement.module.css';
import {
    checkinSessionMember,
    getGuideSessionGuests,
    listMyGuideSessions,
    participantActivityCheckIn,
    participantActivityCheckOut,
    participantCheckIn,
    participantCheckOut,
} from '../../../api/guideTours';

function initialsFromName(name) {
    if (!name || !String(name).trim()) return '?';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function formatDateShort(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return iso;
    }
}

function formatDt(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return '';
    }
}

/** BE có thể trả LocalTime dạng "09:30:00" hoặc ISO. */
function formatTimeHm(v) {
    if (v == null || v === '') return '';
    const s = String(v);
    if (s.includes('T') || s.endsWith('Z')) {
        try {
            return new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return s;
        }
    }
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : s;
}

function attendanceAtActivity(participant, activityId) {
    if (!participant?.activityAttendance?.length || !activityId) return null;
    const id = String(activityId);
    return participant.activityAttendance.find((x) => String(x.activityId) === id) || null;
}

function detectSpecialTag(text) {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes('dị ứng') || t.includes('di ung') || t.includes('allergy')) return 'Dị ứng / sức khỏe';
    if (t.includes('chay') || t.includes('vegan') || t.includes('vegetarian') || t.includes('halal')) return 'Ăn uống đặc biệt';
    return null;
}

const GuideGuestManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [guestData, setGuestData] = useState(null);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingGuests, setLoadingGuests] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [checkInBusyId, setCheckInBusyId] = useState(null);
    const [participantBusyId, setParticipantBusyId] = useState(null);
    const [activityBusyKey, setActivityBusyKey] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingSessions(true);
                const list = await listMyGuideSessions();
                if (!mounted) return;
                setSessions(Array.isArray(list) ? list : []);
            } catch (e) {
                if (mounted) setError(e?.message || 'Không tải được danh sách chuyến.');
            } finally {
                if (mounted) setLoadingSessions(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!sessionId && sessions.length > 0) {
            setSessionId(sessions[0].sessionId);
        }
    }, [sessions, sessionId]);

    const loadGuests = useCallback(async () => {
        if (!sessionId) return;
        setLoadingGuests(true);
        setError('');
        try {
            const data = await getGuideSessionGuests(sessionId);
            setGuestData(data);
        } catch (e) {
            setGuestData(null);
            setError(e?.message || 'Không tải được danh sách khách.');
        } finally {
            setLoadingGuests(false);
        }
    }, [sessionId]);

    useEffect(() => {
        loadGuests();
    }, [loadGuests]);

    const sessionsByTour = useMemo(() => {
        const groups = new Map();
        sessions.forEach((s) => {
            const key = s.tourId || s.tourTitle || '_';
            if (!groups.has(key)) {
                groups.set(key, { label: s.tourTitle || 'Tour', items: [] });
            }
            groups.get(key).items.push(s);
        });
        return [...groups.values()].map((g) => ({
            ...g,
            items: [...g.items].sort((a, b) => {
                const da = a.startDate ? new Date(a.startDate).getTime() : 0;
                const db = b.startDate ? new Date(b.startDate).getTime() : 0;
                return da - db;
            }),
        }));
    }, [sessions]);

    const flatParticipants = useMemo(() => {
        const rows = [];
        (guestData?.bookings || []).forEach((b) => {
            (b.participantAttendance || []).forEach((p) => {
                rows.push({ booking: b, p });
            });
        });
        return rows;
    }, [guestData]);

    const filteredFlatParticipants = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return flatParticipants;
        return flatParticipants.filter(({ booking: b, p }) => {
            const blob = [
                b.travelerName,
                p.displayName,
                p.phoneSnapshot,
                b.effectiveContactPhone,
                b.phone,
                b.pickupAddress,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return blob.includes(q);
        });
    }, [flatParticipants, searchQuery]);

    const filteredBookings = useMemo(() => {
        const rows = guestData?.bookings || [];
        const q = searchQuery.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((b) => {
            const blob = [
                b.travelerName,
                b.email,
                b.phone,
                b.effectiveContactPhone,
                b.pickupAddress,
                b.specialRequests,
                b.emergencyContactName,
                b.emergencyContactPhone,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return blob.includes(q);
        });
    }, [guestData, searchQuery]);

    const attendancePercent = useMemo(() => {
        const t = guestData?.totalGuestSlots ?? 0;
        const c = guestData?.checkedInGuestSlots ?? 0;
        if (!t) return 0;
        return Math.min(100, Math.round((c / t) * 100));
    }, [guestData]);

    /** Đủ khi mọi dòng người tham gia (lead + kèm) đã có check-in. */
    const attendanceStatus = useMemo(() => {
        const total = guestData?.totalGuestSlots ?? 0;
        const checked = guestData?.checkedInGuestSlots ?? 0;

        if (!guestData || loadingGuests) {
            return { kind: 'loading' };
        }
        if (total === 0) {
            return {
                kind: 'empty',
                message:
                    'Chưa có đơn trên danh sách đoàn (đã thanh toán / đã xác nhận). Nếu lịch hiển thị có khách nhưng đây trống, kiểm tra trạng thái booking hoặc chờ đồng bộ sau khi thanh toán.',
            };
        }
        if (checked >= total) {
            return {
                kind: 'complete',
                total,
                checked,
                message: `Đã đủ điểm danh: ${checked}/${total} người trên danh sách tham gia.`,
            };
        }
        const remainingPeople = total - checked;
        return {
            kind: 'partial',
            total,
            checked,
            remainingPeople,
            message: `Chưa đủ: còn ${remainingPeople} người chưa điểm danh.`,
        };
    }, [guestData, loadingGuests]);

    const pickupHints = useMemo(() => {
        const set = new Set();
        (guestData?.bookings || []).forEach((b) => {
            if (b.pickupAddress && String(b.pickupAddress).trim()) {
                set.add(String(b.pickupAddress).trim());
            }
        });
        return [...set].slice(0, 4);
    }, [guestData]);

    const handleCheckIn = async (userId) => {
        if (!sessionId || !userId) return;
        setCheckInBusyId(userId);
        setError('');
        try {
            await checkinSessionMember({ sessionId, userId, checkInType: 'gathering' });
            await loadGuests();
        } catch (e) {
            setError(e?.message || 'Điểm danh thất bại.');
        } finally {
            setCheckInBusyId(null);
        }
    };

    const handleParticipantCheckIn = async (participantId) => {
        if (!sessionId || !participantId) return;
        setParticipantBusyId(participantId);
        setError('');
        try {
            await participantCheckIn(sessionId, participantId);
            await loadGuests();
        } catch (e) {
            setError(e?.message || 'Điểm danh thất bại.');
        } finally {
            setParticipantBusyId(null);
        }
    };

    const handleParticipantCheckOut = async (participantId) => {
        if (!sessionId || !participantId) return;
        setParticipantBusyId(participantId);
        setError('');
        try {
            await participantCheckOut(sessionId, participantId);
            await loadGuests();
        } catch (e) {
            setError(e?.message || 'Check-out thất bại.');
        } finally {
            setParticipantBusyId(null);
        }
    };

    const handleActivityCheckIn = async (activityId, participantId) => {
        if (!sessionId || !activityId || !participantId) return;
        setActivityBusyKey(`${activityId}:${participantId}`);
        setError('');
        try {
            await participantActivityCheckIn(sessionId, participantId, activityId);
            await loadGuests();
        } catch (e) {
            setError(e?.message || 'Điểm danh tại điểm thất bại.');
        } finally {
            setActivityBusyKey(null);
        }
    };

    const handleActivityCheckOut = async (activityId, participantId) => {
        if (!sessionId || !activityId || !participantId) return;
        setActivityBusyKey(`${activityId}:${participantId}`);
        setError('');
        try {
            await participantActivityCheckOut(sessionId, participantId, activityId);
            await loadGuests();
        } catch (e) {
            setError(e?.message || 'Check-out tại điểm thất bại.');
        } finally {
            setActivityBusyKey(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Danh sách khách đoàn</h1>
                    <p className={styles.pageSubtitle}>
                        Chọn tour / chuyến khởi hành, điểm danh theo từng địa điểm trong lịch trình hoặc điểm danh chung trên đơn.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button
                        type="button"
                        className={styles.qrBtn}
                        title="Tính năng đang phát triển"
                        onClick={() => window.alert('Quét QR điểm danh sẽ được gắn với mã chuyến — đang phát triển.')}
                    >
                        <span className="material-icons-round" style={{ fontSize: '20px' }}>qr_code_scanner</span>
                        Quét QR điểm danh
                    </button>
                </div>
            </div>

            <div className={styles.sessionRow}>
                <label className={styles.sessionLabel} htmlFor="guide-session-select">Chuyến đang quản lý</label>
                <select
                    id="guide-session-select"
                    className={styles.sessionSelect}
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    disabled={loadingSessions || !sessions.length}
                >
                    {sessionsByTour.map((group) => (
                        <optgroup
                            key={String(group.items[0]?.tourId ?? group.label)}
                            label={group.label}
                        >
                            {group.items.map((s) => (
                                <option key={s.sessionId} value={s.sessionId}>
                                    {formatDateShort(s.startDate)}
                                    {s.tourCode ? ` · ${s.tourCode}` : ''}
                                    {s.location ? ` · ${s.location}` : ''}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            {error && <div className={styles.inlineError}>{error}</div>}

            {attendanceStatus.kind === 'complete' && (
                <div className={`${styles.attendanceBanner} ${styles.bannerComplete}`} role="status">
                    <span className="material-icons-round" style={{ fontSize: '22px' }}>verified</span>
                    <div>
                        <strong>{attendanceStatus.message}</strong>
                        <p className={styles.bannerHint}>Tất cả người trên danh sách tham gia đã có thời điểm điểm danh.</p>
                    </div>
                </div>
            )}
            {attendanceStatus.kind === 'partial' && (
                <div className={`${styles.attendanceBanner} ${styles.bannerPartial}`} role="status">
                    <span className="material-icons-round" style={{ fontSize: '22px' }}>pending_actions</span>
                    <div>
                        <strong>{attendanceStatus.message}</strong>
                        <p className={styles.bannerHint}>
                            Dùng nút điểm danh từng người (người đặt và khách kèm trong đơn). Sau khi điểm danh có thể check-out khi trả khách.
                        </p>
                    </div>
                </div>
            )}
            {attendanceStatus.kind === 'empty' && (
                <div className={`${styles.attendanceBanner} ${styles.bannerEmpty}`} role="status">
                    <span className="material-icons-round" style={{ fontSize: '22px' }}>info</span>
                    <div>
                        <strong>{attendanceStatus.message}</strong>
                    </div>
                </div>
            )}

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Tiến độ điểm danh</span>
                        <span className={styles.statValueLarge}>
                            {guestData ? `${guestData.checkedInGuestSlots}/${guestData.totalGuestSlots}` : '—'}
                            <span className={styles.statUnit}> khách</span>
                        </span>
                    </div>
                    <div className={styles.statIconWrap}>
                        <span className="material-icons-round" style={{ fontSize: '22px', color: '#059669' }}>check_circle</span>
                    </div>
                    <div className={styles.statProgress}>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${attendancePercent}%` }} />
                        </div>
                    </div>
                    {guestData != null && guestData.checkedOutParticipants != null && (
                        <p className={styles.statSub}>Đã check-out: {guestData.checkedOutParticipants} người</p>
                    )}
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Đơn có ghi chú / yêu cầu đặc biệt</span>
                        <div className={styles.statRow}>
                            <span className={styles.statValueLarge}>
                                {guestData != null ? guestData.bookingsWithSpecialRequests : '—'}
                                <span className={styles.statUnit}> đơn</span>
                            </span>
                            <span className="material-icons-round" style={{ fontSize: '22px', color: '#fbbf24' }}>star</span>
                        </div>
                    </div>
                    <div className={styles.specialTags}>
                        <span className={styles.specialTag}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>receipt_long</span>
                            {guestData != null ? `${guestData.paidBookingCount} đơn trên đoàn` : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {guestData?.itineraryStops?.length > 0 && (
                <section className={styles.stopsWrap} aria-label="Điểm danh theo địa điểm">
                    <h2 className={styles.stopsHeading}>Điểm danh theo địa điểm (lịch trình tour)</h2>
                    <p className={styles.stopsHint}>
                        Mỗi hoạt động trong lịch trình là một điểm có thể ghi nhận có mặt / rời điểm — độc lập với điểm danh chung ở mục dưới.
                    </p>
                    <div className={styles.stopsList}>
                        {guestData.itineraryStops.map((stop, idx) => {
                            const total = guestData.totalGuestSlots ?? 0;
                            const done = stop.checkedInAtStopCount ?? 0;
                            const stopLabel =
                                (stop.locationName && String(stop.locationName).trim()) ||
                                stop.title ||
                                'Điểm trong lịch trình';
                            return (
                                <details key={stop.activityId} className={styles.stopCard} open={idx === 0}>
                                    <summary className={styles.stopSummary}>
                                        <span className={styles.stopSummaryMain}>
                                            <span className={styles.stopDayBadge}>Ngày {stop.dayNumber ?? '—'}</span>
                                            <span className={styles.stopTitle}>{stopLabel}</span>
                                            {(stop.startTime || stop.endTime) && (
                                                <span className={styles.stopTime}>
                                                    {formatTimeHm(stop.startTime)}
                                                    {stop.endTime ? ` – ${formatTimeHm(stop.endTime)}` : ''}
                                                </span>
                                            )}
                                        </span>
                                        <span className={styles.stopProgressPill}>
                                            {done}/{total || '—'} có mặt
                                        </span>
                                    </summary>
                                    <div className={styles.stopBody}>
                                        {filteredFlatParticipants.length === 0 && (
                                            <p className={styles.muted}>Không có khách khớp bộ lọc tìm kiếm.</p>
                                        )}
                                        {filteredFlatParticipants.map(({ booking: b, p }) => {
                                            const row = attendanceAtActivity(p, stop.activityId);
                                            const busy =
                                                activityBusyKey === `${stop.activityId}:${p.participantId}`;
                                            return (
                                                <div key={`${stop.activityId}-${p.participantId}`} className={styles.stopParticipantRow}>
                                                    <div className={styles.stopParticipantLeft}>
                                                        <span className={styles.stopRole}>
                                                            {p.participantRole === 'LEAD' ? 'Người đặt' : 'Khách kèm'}
                                                        </span>
                                                        <span className={styles.stopPName}>{p.displayName}</span>
                                                        <span className={styles.stopBookRef}>
                                                            Đơn: {b.travelerName || '—'}
                                                        </span>
                                                        {row?.checkInAt && (
                                                            <span className={styles.stopMiniTime}>
                                                                In: {formatDt(row.checkInAt)}
                                                            </span>
                                                        )}
                                                        {row?.checkOutAt && (
                                                            <span className={styles.stopMiniTime}>
                                                                Out: {formatDt(row.checkOutAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={styles.stopParticipantActions}>
                                                        {!row?.checkInAt && (
                                                            <button
                                                                type="button"
                                                                className={styles.participantBtnIn}
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    handleActivityCheckIn(stop.activityId, p.participantId)
                                                                }
                                                            >
                                                                {busy ? '…' : 'Có mặt'}
                                                            </button>
                                                        )}
                                                        {row?.checkInAt && !row?.checkOutAt && (
                                                            <button
                                                                type="button"
                                                                className={styles.participantBtnOut}
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    handleActivityCheckOut(stop.activityId, p.participantId)
                                                                }
                                                            >
                                                                Rời điểm
                                                            </button>
                                                        )}
                                                        {row?.checkInAt && row?.checkOutAt && (
                                                            <span className={styles.stopDonePill}>Xong</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                </section>
            )}

            {guestData && !guestData.itineraryStops?.length && guestData.totalGuestSlots > 0 && (
                <p className={styles.noItineraryHint}>
                    Tour này chưa có lịch trình chi tiết với các điểm dừng — chỉ dùng điểm danh chung theo đơn bên dưới.
                </p>
            )}

            <div className={styles.mainGrid}>
                <div className={styles.guestListCard}>
                    <h2 className={styles.sectionHeading}>Điểm danh chung &amp; theo đơn</h2>
                    <p className={styles.sectionSub}>Áp dụng cho cả chuyến (không gắn từng điểm trong lịch trình).</p>
                    <div className={styles.searchBar}>
                        <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>search</span>
                        <input
                            type="text"
                            placeholder="Tìm tên, email, SĐT, điểm đón, ghi chú..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {loadingGuests && <p className={styles.muted}>Đang tải danh sách...</p>}
                    {!loadingGuests && !sessions.length && (
                        <p className={styles.muted}>Chưa có chuyến nào được giao trong khung thời gian hiện tại.</p>
                    )}

                    <div className={styles.guestList}>
                        {filteredBookings.map((b) => {
                            const tag = detectSpecialTag(b.specialRequests);
                            const companionNames = (b.companions || []).map((c) => c.fullName).filter(Boolean);
                            const participantRows = b.participantAttendance || [];
                            const hasParticipantRows = participantRows.length > 0;
                            return (
                                <div key={b.bookingId} className={styles.guestItem}>
                                    <div className={styles.guestItemMain}>
                                    <div className={styles.guestLeft}>
                                        {b.avatarUrl ? (
                                            <div className={styles.avatarWrap}>
                                                <img src={b.avatarUrl} alt="" className={styles.guestAvatar} />
                                                {b.checkedInGathering && <span className={styles.onlineDot} />}
                                            </div>
                                        ) : (
                                            <div className={styles.avatarWrap}>
                                                <div className={styles.avatarInitials}>{initialsFromName(b.travelerName)}</div>
                                            </div>
                                        )}
                                        <div className={styles.guestInfo}>
                                            <span className={styles.guestName}>
                                                {b.travelerName || 'Khách'}
                                                {b.guestCount > 1 && (
                                                    <span className={styles.guestCountBadge}>{b.guestCount} khách</span>
                                                )}
                                            </span>
                                            <span className={styles.guestMeta}>
                                                <span className="material-icons-round" style={{ fontSize: '14px' }}>call</span>
                                                {b.effectiveContactPhone || b.phone || '—'}
                                                {b.pickupAddress && (
                                                    <>
                                                        {' '}
                                                        · <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle' }}>place</span>{' '}
                                                        {b.pickupAddress.length > 48 ? `${b.pickupAddress.slice(0, 48)}…` : b.pickupAddress}
                                                    </>
                                                )}
                                            </span>
                                            {companionNames.length > 0 && (
                                                <span className={styles.companionLine}>
                                                    Đi cùng: {companionNames.slice(0, 4).join(', ')}
                                                    {companionNames.length > 4 ? '…' : ''}
                                                </span>
                                            )}
                                            {b.specialRequests && (
                                                <span className={styles.noteSnippet}>{b.specialRequests}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.guestRight}>
                                        {tag && (
                                            <span className={styles.allergyTag}>
                                                <span className="material-icons-round" style={{ fontSize: '14px' }}>flag</span>
                                                {tag}
                                            </span>
                                        )}
                                        {hasParticipantRows ? (
                                            <div className={styles.checkedActions}>
                                                {b.allParticipantsCheckedIn ? (
                                                    <span className={styles.checkedPill}>Đủ điểm danh đơn</span>
                                                ) : (
                                                    <span className={styles.partialPill}>Chưa đủ đơn</span>
                                                )}
                                                <Link
                                                    to={`/guide/communication?sessionId=${encodeURIComponent(sessionId)}&bookingId=${encodeURIComponent(b.bookingId)}`}
                                                    className={styles.chatLink}
                                                    title="Mở chat đoàn"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: '18px' }}>chat</span>
                                                </Link>
                                                {(b.effectiveContactPhone || b.phone) && (
                                                    <a
                                                        className={styles.callLink}
                                                        href={`tel:${String(b.effectiveContactPhone || b.phone).replace(/\s/g, '')}`}
                                                    >
                                                        <span className="material-icons-round" style={{ fontSize: '18px' }}>call</span>
                                                    </a>
                                                )}
                                            </div>
                                        ) : b.checkedInGathering ? (
                                            <div className={styles.checkedActions}>
                                                <span className={styles.checkedPill}>Đã điểm danh</span>
                                                <Link
                                                    to={`/guide/communication?sessionId=${encodeURIComponent(sessionId)}&bookingId=${encodeURIComponent(b.bookingId)}`}
                                                    className={styles.chatLink}
                                                    title="Mở chat đoàn"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: '18px' }}>chat</span>
                                                </Link>
                                                {(b.effectiveContactPhone || b.phone) && (
                                                    <a
                                                        className={styles.callLink}
                                                        href={`tel:${String(b.effectiveContactPhone || b.phone).replace(/\s/g, '')}`}
                                                    >
                                                        <span className="material-icons-round" style={{ fontSize: '18px' }}>call</span>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.checkedActions}>
                                                <button
                                                    type="button"
                                                    className={styles.checkInBtn}
                                                    disabled={checkInBusyId === b.travelerUserId || !b.travelerUserId}
                                                    onClick={() => handleCheckIn(b.travelerUserId)}
                                                >
                                                    {checkInBusyId === b.travelerUserId ? 'Đang xử lý…' : 'Điểm danh'}
                                                </button>
                                                <Link
                                                    to={`/guide/communication?sessionId=${encodeURIComponent(sessionId)}&bookingId=${encodeURIComponent(b.bookingId)}`}
                                                    className={styles.chatLink}
                                                    title="Mở chat đoàn"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: '18px' }}>chat</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    </div>
                                    {hasParticipantRows && (
                                        <div className={styles.participantSublist}>
                                            {participantRows.map((p) => (
                                                <div key={p.participantId} className={styles.participantRow}>
                                                    <div className={styles.participantRowLeft}>
                                                        <span className={styles.roleTag}>
                                                            {p.participantRole === 'LEAD' ? 'Người đặt' : 'Khách kèm'}
                                                        </span>
                                                        <span className={styles.participantName}>{p.displayName}</span>
                                                        {p.checkInAt && (
                                                            <span className={styles.participantTime}>In: {formatDt(p.checkInAt)}</span>
                                                        )}
                                                        {p.checkOutAt && (
                                                            <span className={styles.participantTime}>Out: {formatDt(p.checkOutAt)}</span>
                                                        )}
                                                    </div>
                                                    <div className={styles.participantRowActions}>
                                                        {!p.checkInAt && (
                                                            <button
                                                                type="button"
                                                                className={styles.participantBtnIn}
                                                                disabled={participantBusyId === p.participantId}
                                                                onClick={() => handleParticipantCheckIn(p.participantId)}
                                                            >
                                                                {participantBusyId === p.participantId ? '…' : 'Điểm danh'}
                                                            </button>
                                                        )}
                                                        {p.checkInAt && !p.checkOutAt && (
                                                            <button
                                                                type="button"
                                                                className={styles.participantBtnOut}
                                                                disabled={participantBusyId === p.participantId}
                                                                onClick={() => handleParticipantCheckOut(p.participantId)}
                                                            >
                                                                Check-out
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.locatorCard}>
                        <div className={styles.locatorHeader}>
                            <div className={styles.locatorTitle}>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>my_location</span>
                                Guest Locator
                            </div>
                        </div>
                        <div className={styles.mapPlaceholder}>
                            <div className={styles.mapContent}>
                                <span className="material-icons-round" style={{ fontSize: '48px', color: '#d1d5db' }}>map</span>
                                <p>Bản đồ vị trí đoàn</p>
                                <p className={styles.mapHint}>Theo dõi realtime sẽ được bổ sung sau.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.internalCard}>
                        <h3 className={styles.internalTitle}>Thông tin chuyến & đón khách</h3>
                        <div className={styles.internalList}>
                            <div className={styles.internalItem}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>flag</span>
                                <span>
                                    {guestData?.tourTitle || '—'}
                                    {guestData?.tourCode ? ` (${guestData.tourCode})` : ''}
                                </span>
                            </div>
                            <div className={styles.internalItem}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>calendar_today</span>
                                <span>
                                    {guestData ? `${formatDateShort(guestData.startDate)} – ${formatDateShort(guestData.endDate)}` : '—'}
                                </span>
                            </div>
                            {pickupHints.map((p) => (
                                <div key={p} className={styles.internalItem}>
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>transfer_within_a_station</span>
                                    <span>{p}</span>
                                </div>
                            ))}
                            {!pickupHints.length && guestData && (
                                <div className={styles.internalItem}>
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#6b7280' }}>info</span>
                                    <span>Chưa có điểm đón trên đơn.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideGuestManagement;
