import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GuideAssignmentModal from '../components/GuideAssignmentModal';
import StatCard from '../components/StatCard';
import {
    listOperationSessions,
    unassignGuide,
    updateSessionStatus,
} from '../../../api/tourOperations';
import styles from './TourDispatch.module.css';

/**
 * Trang Điều Hành Tour (Tour Operations / Dispatch).
 * - Calendar tháng + List view, fetch dữ liệu thực từ /tour-operations/sessions.
 * - Cho phép phân công lại HDV, huỷ session, đánh dấu hoàn thành.
 * - Hiện cảnh báo "Cần điều phối" cho session chưa có HDV / sắp khởi hành.
 */

const VIEW_MODES = { CALENDAR: 'calendar', LIST: 'list' };

const STATUS_LABELS = {
    scheduled: { label: 'Đã lên lịch', cls: 'badgeScheduled' },
    full: { label: 'Đã đầy', cls: 'badgeFull' },
    completed: { label: 'Đã hoàn thành', cls: 'badgeCompleted' },
    cancelled: { label: 'Đã huỷ', cls: 'badgeCancelled' },
};

const STATUS_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'issue', label: 'Cần điều phối' },
    { key: 'scheduled', label: 'Đã lên lịch' },
    { key: 'completed', label: 'Đã hoàn thành' },
    { key: 'cancelled', label: 'Đã huỷ' },
];

const ymd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
};

const TourDispatch = () => {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState(null);
    const [viewMode, setViewMode] = useState(VIEW_MODES.CALENDAR);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const monthName = `Tháng ${month + 1}, ${year}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const from = ymd(new Date(year, month, 1));
            const to = ymd(new Date(year, month, daysInMonth));
            const data = await listOperationSessions({ from, to, q: searchQuery.trim() || undefined });
            setSessions(data);
        } catch (err) {
            setErrorMsg(err?.message || 'Không tải được danh sách điều hành tour. Vui lòng đăng nhập admin.');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, [year, month, daysInMonth, searchQuery]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        if (!successMsg) return;
        const t = setTimeout(() => setSuccessMsg(''), 2500);
        return () => clearTimeout(t);
    }, [successMsg]);

    const sessionsByDay = useMemo(() => {
        const map = new Map();
        for (const s of sessions) {
            if (!s.startDate) continue;
            const key = s.startDate;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(s);
        }
        return map;
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'issue') return s.hasGuideIssue && s.status === 'scheduled';
            return s.status === statusFilter;
        });
    }, [sessions, statusFilter]);

    const sessionsOfSelectedDate = useMemo(() => {
        if (!selectedDateKey) return [];
        return (sessionsByDay.get(selectedDateKey) || []).filter((s) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'issue') return s.hasGuideIssue && s.status === 'scheduled';
            return s.status === statusFilter;
        });
    }, [selectedDateKey, sessionsByDay, statusFilter]);

    const stats = useMemo(() => {
        const total = sessions.length;
        const urgent = sessions.filter((s) => s.urgent).length;
        const issue = sessions.filter((s) => s.hasGuideIssue && s.status === 'scheduled').length;
        const completed = sessions.filter((s) => s.status === 'completed').length;
        const totalGuests = sessions.reduce((acc, s) => acc + (s.currentParticipants || 0), 0);
        const totalCapacity = sessions.reduce((acc, s) => acc + (s.maxParticipants || 0), 0);
        const occupancy = totalCapacity > 0 ? Math.round((totalGuests / totalCapacity) * 100) : 0;
        return { total, urgent, issue, completed, totalGuests, occupancy };
    }, [sessions]);

    const handlePrevMonth = () => {
        setCurrentMonthDate(new Date(year, month - 1, 1));
        setSelectedDateKey(null);
    };

    const handleNextMonth = () => {
        setCurrentMonthDate(new Date(year, month + 1, 1));
        setSelectedDateKey(null);
    };

    const handleToday = () => {
        const now = new Date();
        setCurrentMonthDate(now);
        setSelectedDateKey(ymd(now));
    };

    const handleOpenAssignModal = (session) => {
        setActiveSession(session);
        setIsModalOpen(true);
    };

    const handleAssigned = (updated) => {
        setSessions((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
        setSuccessMsg(`Đã phân công ${updated.tourGuide?.fullName || 'HDV'} cho ${updated.tourTitle}`);
    };

    const handleUnassign = async (session) => {
        if (!window.confirm(`Huỷ phân công HDV cho session ngày ${formatDate(session.startDate)}?`)) return;
        try {
            const updated = await unassignGuide(session.sessionId);
            setSessions((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
            setSuccessMsg('Đã huỷ phân công HDV');
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể huỷ phân công');
        }
    };

    const handleChangeStatus = async (session, status) => {
        const labels = { cancelled: 'huỷ', completed: 'đánh dấu hoàn thành', scheduled: 'mở lại' };
        if (!window.confirm(`Xác nhận ${labels[status] || 'cập nhật'} session ngày ${formatDate(session.startDate)}?`)) return;
        try {
            const updated = await updateSessionStatus(session.sessionId, status);
            setSessions((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
            setSuccessMsg(`Đã cập nhật trạng thái: ${STATUS_LABELS[updated.status]?.label || updated.status}`);
        } catch (err) {
            setErrorMsg(err?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const renderCalendarDays = () => {
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
        const cells = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayDisabled}`}></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const key = ymd(new Date(year, month, d));
            const daySessions = (sessionsByDay.get(key) || []).filter((s) => {
                if (statusFilter === 'all') return true;
                if (statusFilter === 'issue') return s.hasGuideIssue && s.status === 'scheduled';
                return s.status === statusFilter;
            });
            const isToday = isCurrentMonth && d === today.getDate();
            const isActive = selectedDateKey === key;
            const hasIssue = daySessions.some((s) => s.issueLevel !== 'none' && s.status === 'scheduled');

            cells.push(
                <div
                    key={`day-${d}`}
                    className={`${styles.dayCell} ${isToday ? styles.dayToday : ''} ${isActive ? styles.dayCellActive : ''}`}
                    onClick={() => setSelectedDateKey(key)}
                >
                    <div className={styles.dayHeader}>
                        <span className={styles.dayNumber}>{d}</span>
                        {hasIssue && (
                            <span className={styles.dayIssueDot} title="Có session cần điều phối">!</span>
                        )}
                    </div>
                    {daySessions.length > 0 && (
                        <div className={styles.tourDots}>
                            {daySessions.slice(0, 3).map((s) => (
                                <div
                                    key={s.sessionId}
                                    className={`${styles.tourBadge} ${s.issueLevel === 'critical'
                                        ? styles.badgeCritical
                                        : s.issueLevel === 'warning'
                                            ? styles.badgeWarning
                                            : styles.badgeOk}`}
                                    title={s.tourTitle}
                                >
                                    {s.tourCode || (s.tourTitle || '').slice(0, 12)}
                                </div>
                            ))}
                            {daySessions.length > 3 && (
                                <div className={styles.moreBadge}>+{daySessions.length - 3}</div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Điều Hành Tour Tháng</h1>
                    <p className={styles.pageSubtitle}>
                        Theo dõi lịch khởi hành, phân công HDV, xử lý sự cố vận hành theo thời gian thực.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.refreshBtn} onClick={fetchSessions} disabled={loading} title="Tải lại">
                        <span className="material-icons-round" style={{ fontSize: 18 }}>refresh</span>
                        Tải lại
                    </button>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === VIEW_MODES.CALENDAR ? styles.toggleActive : ''}`}
                            onClick={() => setViewMode(VIEW_MODES.CALENDAR)}
                        >
                            Lịch
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === VIEW_MODES.LIST ? styles.toggleActive : ''}`}
                            onClick={() => setViewMode(VIEW_MODES.LIST)}
                        >
                            Danh sách
                        </button>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className={`${styles.banner} ${styles.bannerError}`}>
                    <span className="material-icons-round">error_outline</span>
                    <span>{errorMsg}</span>
                </div>
            )}
            {successMsg && (
                <div className={`${styles.banner} ${styles.bannerSuccess}`}>
                    <span className="material-icons-round">check_circle</span>
                    <span>{successMsg}</span>
                </div>
            )}

            <div className={styles.statsGrid}>
                <StatCard icon="event" label="Tổng session tháng" value={stats.total} color="blue" />
                <StatCard icon="report_problem" label="Cần điều phối" value={stats.issue} color="red" />
                <StatCard icon="bolt" label="Khẩn cấp (≤3 ngày)" value={stats.urgent} color="yellow" />
                <StatCard icon="trending_up" label="Tỷ lệ lấp đầy" value={`${stats.occupancy}%`} color="green" />
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.filterTab} ${statusFilter === tab.key ? styles.filterTabActive : ''}`}
                            onClick={() => setStatusFilter(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className={styles.filterSearch}>
                    <span className="material-icons-round" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
                    <input
                        type="text"
                        className={styles.filterInput}
                        placeholder="Tìm tour theo tên / slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {viewMode === VIEW_MODES.CALENDAR ? (
                <div className={styles.mainLayout}>
                    <div className={styles.calendarContainer}>
                        <div className={styles.calendarHeader}>
                            <h2 className={styles.currentMonth}>{monthName}</h2>
                            <div className={styles.monthNav}>
                                <button className={styles.navBtn} onClick={handlePrevMonth} title="Tháng trước">
                                    <span className="material-icons-round">chevron_left</span>
                                </button>
                                <button className={styles.navBtn} onClick={handleToday}>Hôm nay</button>
                                <button className={styles.navBtn} onClick={handleNextMonth} title="Tháng sau">
                                    <span className="material-icons-round">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className={styles.weekDays}>
                            <div className={styles.weekDay}>CN</div>
                            <div className={styles.weekDay}>T2</div>
                            <div className={styles.weekDay}>T3</div>
                            <div className={styles.weekDay}>T4</div>
                            <div className={styles.weekDay}>T5</div>
                            <div className={styles.weekDay}>T6</div>
                            <div className={styles.weekDay}>T7</div>
                        </div>

                        <div className={styles.daysGrid}>{renderCalendarDays()}</div>
                    </div>

                    {selectedDateKey && (
                        <div className={styles.sidePanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h3 className={styles.panelTitle}>Session ngày {formatDate(selectedDateKey)}</h3>
                                    <p className={styles.panelSubtitle}>{sessionsOfSelectedDate.length} session</p>
                                </div>
                                <button className={styles.closePanelBtn} onClick={() => setSelectedDateKey(null)}>
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <div className={styles.panelContent}>
                                {sessionsOfSelectedDate.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <span className={`material-icons-round ${styles.emptyIcon}`}>event_busy</span>
                                        <p>Không có session nào.</p>
                                    </div>
                                ) : (
                                    sessionsOfSelectedDate.map((s) => (
                                        <SessionCard
                                            key={s.sessionId}
                                            session={s}
                                            onAssign={() => handleOpenAssignModal(s)}
                                            onUnassign={() => handleUnassign(s)}
                                            onChangeStatus={(status) => handleChangeStatus(s, status)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.listContainer}>
                    {loading && <div className={styles.loadingNote}>Đang tải dữ liệu...</div>}
                    {!loading && filteredSessions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={`material-icons-round ${styles.emptyIcon}`}>event_busy</span>
                            <p>Không có session nào khớp bộ lọc.</p>
                        </div>
                    ) : (
                        <div className={styles.listGrid}>
                            {filteredSessions.map((s) => (
                                <SessionCard
                                    key={s.sessionId}
                                    session={s}
                                    onAssign={() => handleOpenAssignModal(s)}
                                    onUnassign={() => handleUnassign(s)}
                                    onChangeStatus={(status) => handleChangeStatus(s, status)}
                                    expanded
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <GuideAssignmentModal
                isOpen={isModalOpen}
                session={activeSession}
                onClose={() => {
                    setIsModalOpen(false);
                    setActiveSession(null);
                }}
                onAssigned={(updated) => {
                    handleAssigned(updated);
                    setIsModalOpen(false);
                    setActiveSession(null);
                }}
            />
        </div>
    );
};

const SessionCard = ({ session, onAssign, onUnassign, onChangeStatus, expanded = false }) => {
    const statusInfo = STATUS_LABELS[session.status] || STATUS_LABELS.scheduled;
    const occupancy = Math.min(100, Math.round(session.occupancyPercent || 0));
    const borderColor = session.issueLevel === 'critical'
        ? '#fca5a5'
        : session.issueLevel === 'warning' ? '#fcd34d' : '#e5e7eb';

    return (
        <div className={`${styles.sessionCard} ${expanded ? styles.sessionCardExpanded : ''}`} style={{ borderColor }}>
            <div className={styles.sessionCardHeader}>
                <div>
                    <h4 className={styles.sessionCardName}>{session.tourTitle}</h4>
                    <div className={styles.sessionMetaLine}>
                        {session.tourCode && <span className={styles.tourCodeChip}>{session.tourCode}</span>}
                        <span className={styles.sessionDates}>
                            <span className="material-icons-round" style={{ fontSize: 14 }}>event</span>
                            {formatDate(session.startDate)}{session.endDate && ` → ${formatDate(session.endDate)}`}
                        </span>
                    </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[statusInfo.cls]}`}>{statusInfo.label}</span>
            </div>

            {session.urgent && (
                <div className={styles.urgentBanner}>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>bolt</span>
                    Khẩn cấp: Khởi hành trong &lt;=3 ngày &amp; chưa có HDV
                </div>
            )}

            <div className={styles.occupancyRow}>
                <div className={styles.occupancyLabel}>
                    Khách: <strong>{session.currentParticipants}/{session.maxParticipants}</strong>
                    <span className={styles.remainingChip}>còn {session.remainingSlots}</span>
                </div>
                <div className={styles.occupancyBar}>
                    <div
                        className={styles.occupancyFill}
                        style={{
                            width: `${occupancy}%`,
                            background: occupancy >= 90 ? '#ef4444' : occupancy >= 60 ? '#f59e0b' : '#10b981',
                        }}
                    />
                </div>
                <span className={styles.occupancyValue}>{occupancy}%</span>
            </div>

            <div className={styles.guideInfo}>
                {session.tourGuide ? (
                    <>
                        <div className={styles.guideAvatar}>
                            {session.tourGuide.avatarUrl
                                ? <img src={session.tourGuide.avatarUrl} alt={session.tourGuide.fullName} />
                                : session.tourGuide.initials}
                        </div>
                        <div className={styles.guideDetails}>
                            <div className={styles.guideLabel}>Hướng dẫn viên</div>
                            <div className={styles.guideName}>
                                {session.tourGuide.fullName}
                                {!session.tourGuide.active && (
                                    <span className={styles.inactiveChip}>tạm khoá</span>
                                )}
                            </div>
                            {session.tourGuide.phone && (
                                <div className={styles.guideContact}>{session.tourGuide.phone}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.guideEmpty}>
                        <span className="material-icons-round" style={{ color: '#ef4444' }}>person_off</span>
                        <div>
                            <div className={styles.guideLabel}>Chưa có HDV</div>
                            <div className={styles.guideName}>Vui lòng phân công ngay</div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.actionRow}>
                {session.status !== 'cancelled' && session.status !== 'completed' && (
                    <button className={styles.assignBtn} onClick={onAssign}>
                        <span className="material-icons-round" style={{ fontSize: 16 }}>person_add</span>
                        {session.tourGuide ? 'Đổi HDV' : 'Phân công HDV'}
                    </button>
                )}
                {session.tourGuide && session.status !== 'completed' && (
                    <button className={styles.ghostBtn} onClick={onUnassign} title="Huỷ phân công">
                        <span className="material-icons-round" style={{ fontSize: 16 }}>person_remove</span>
                    </button>
                )}
                {session.status === 'scheduled' && (
                    <button
                        className={styles.ghostBtn}
                        onClick={() => onChangeStatus('cancelled')}
                        title="Huỷ session"
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>cancel</span>
                    </button>
                )}
                {session.status === 'scheduled' && (
                    <button
                        className={styles.ghostBtn}
                        onClick={() => onChangeStatus('completed')}
                        title="Đánh dấu hoàn thành"
                    >
                        <span className="material-icons-round" style={{ fontSize: 16 }}>task_alt</span>
                    </button>
                )}
                {session.status === 'cancelled' && (
                    <button className={styles.ghostBtn} onClick={() => onChangeStatus('scheduled')} title="Mở lại">
                        <span className="material-icons-round" style={{ fontSize: 16 }}>restart_alt</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default TourDispatch;
