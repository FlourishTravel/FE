import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './GuideTourDetail.module.css';
import {
    cancelSessionActivitySchedule,
    checkinSessionMember,
    getGuideSessionGuests,
    getMyGuideSessionDetail,
    getSessionMembers,
    getSessionSchedule,
    patchSessionActivitySchedule,
    publishSessionActivitySchedule,
} from '../../../api/guideTours';

const ACTIVITY_TYPE_LABELS = {
    SIGHTSEEING: 'Tham quan',
    DINING: 'Ăn uống',
    TRANSPORT: 'Di chuyển',
    EXPERIENCE: 'Trải nghiệm',
    FREE_TIME: 'Tự do',
    SHOPPING: 'Mua sắm',
    ACCOMMODATION: 'Lưu trú',
};

const ACTIVITY_ICONS = {
    SIGHTSEEING: 'landscape',
    DINING: 'restaurant',
    TRANSPORT: 'directions_bus',
    EXPERIENCE: 'celebration',
    FREE_TIME: 'schedule',
    SHOPPING: 'shopping_bag',
    ACCOMMODATION: 'hotel',
};

function formatTimeLabel(value) {
    if (value == null || value === '') return '';
    const s = String(value);
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : s;
}

function formatActivityTimeRange(act) {
    const start = formatTimeLabel(act.startTime);
    const end = formatTimeLabel(act.endTime);
    if (start && end) return `${start} – ${end}`;
    if (start) return start;
    if (act.durationMinutes) return `~${act.durationMinutes} phút`;
    return '';
}

const GuideTourDetail = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const [sessionDetail, setSessionDetail] = useState(null);
    const [guestRoll, setGuestRoll] = useState(null);
    const [members, setMembers] = useState([]);
    const [checkedInMembers, setCheckedInMembers] = useState({});
    const [activeDay, setActiveDay] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [sessionSchedule, setSessionSchedule] = useState(null);
    const [editActivity, setEditActivity] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [scheduleBusy, setScheduleBusy] = useState(false);

    const reloadSchedule = async () => {
        try {
            const sched = await getSessionSchedule(tourId);
            setSessionSchedule(sched);
        } catch {
            setSessionSchedule(null);
        }
    };

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                setError('');
                const [detail, travelers, roll] = await Promise.all([
                    getMyGuideSessionDetail(tourId),
                    getSessionMembers(tourId),
                    getGuideSessionGuests(tourId).catch(() => null),
                ]);
                if (!mounted) return;
                setSessionDetail(detail);
                setGuestRoll(roll);
                setMembers(travelers);
                const checkedMap = {};
                travelers.forEach((u) => {
                    const row = roll?.bookings?.find((b) => b.travelerUserId === u.id);
                    checkedMap[u.id] = !!row?.checkedInGathering;
                });
                setCheckedInMembers(checkedMap);
                if (detail?.itineraryDays?.length) {
                    setActiveDay(detail.itineraryDays[0].dayNumber || 1);
                }
                await reloadSchedule();
            } catch (err) {
                if (mounted) setError(err?.message || 'Khong the tai chi tiet tour');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [tourId]);

    const activeScheduleDay = useMemo(
        () => (sessionSchedule?.days || []).find((d) => d.dayNumber === activeDay),
        [sessionSchedule, activeDay],
    );

    const scheduleRowForActivity = (act) => {
        const id = act.id || act.activityId;
        if (!id || !activeScheduleDay?.activities) return null;
        return activeScheduleDay.activities.find((r) => r.activityId === id) || null;
    };

    const openEditActivity = (row) => {
        const eff = row?.effective || {};
        const start = eff.startTime || row?.template?.startTime;
        const end = eff.endTime || row?.template?.endTime;
        setEditActivity(row);
        setEditForm({
            title: eff.title || row?.template?.title || '',
            locationName: eff.locationName || row?.template?.locationName || '',
            locationAddress: eff.locationAddress || row?.template?.locationAddress || '',
            startTime: formatTimeLabel(start),
            endTime: formatTimeLabel(end),
            scheduleStatus: eff.scheduleStatus || row?.template?.scheduleStatus || 'CONFIRMED',
            operationalNote: row?.override?.operationalNote || '',
            isGatheringEvent: eff.isGatheringEvent ?? row?.template?.isGatheringEvent ?? false,
        });
    };

    const buildPatchBody = () => {
        const baseDate = sessionDetail?.startDate
            ? new Date(sessionDetail.startDate).toISOString().slice(0, 10)
            : '2026-01-01';
        const toOffset = (timeStr) => {
            if (!timeStr) return undefined;
            const [h, m] = timeStr.split(':');
            return `${baseDate}T${h.padStart(2, '0')}:${m}:00+07:00`;
        };
        return {
            title: editForm.title || undefined,
            locationName: editForm.locationName || undefined,
            locationAddress: editForm.locationAddress || undefined,
            startAt: toOffset(editForm.startTime),
            endAt: toOffset(editForm.endTime),
            scheduleStatus: editForm.scheduleStatus,
            operationalNote: editForm.operationalNote || undefined,
            isGatheringEvent: editForm.isGatheringEvent,
        };
    };

    const handleSaveDraft = async () => {
        if (!editActivity?.activityId) return;
        try {
            setScheduleBusy(true);
            const data = await patchSessionActivitySchedule(tourId, editActivity.activityId, buildPatchBody());
            setSessionSchedule(data);
            setEditActivity(null);
        } catch (err) {
            setError(err?.message || 'Lưu nháp thất bại');
        } finally {
            setScheduleBusy(false);
        }
    };

    const handlePublish = async () => {
        if (!editActivity?.activityId) return;
        const ok = window.confirm(
            'Thay đổi này sẽ cập nhật hành trình Flora cho khách trong đoàn và gửi thông báo trong ứng dụng cho những khách đã bật nhận thông báo.',
        );
        if (!ok) return;
        try {
            setScheduleBusy(true);
            await patchSessionActivitySchedule(tourId, editActivity.activityId, buildPatchBody());
            const data = await publishSessionActivitySchedule(tourId, editActivity.activityId);
            setSessionSchedule(data);
            setEditActivity(null);
        } catch (err) {
            setError(err?.message || 'Công bố thất bại');
        } finally {
            setScheduleBusy(false);
        }
    };

    const handleCancelActivity = async (activityId) => {
        const ok = window.confirm('Hủy hoạt động này trong lịch đoàn? Khách sẽ thấy sau khi công bố.');
        if (!ok) return;
        try {
            setScheduleBusy(true);
            const data = await cancelSessionActivitySchedule(tourId, activityId);
            setSessionSchedule(data);
        } catch (err) {
            setError(err?.message || 'Hủy hoạt động thất bại');
        } finally {
            setScheduleBusy(false);
        }
    };

    const publicationBadge = (status) => {
        if (status === 'PUBLISHED') return { label: 'Đã công bố', cls: styles.badgePublished };
        if (status === 'DRAFT') return { label: 'Bản nháp', cls: styles.badgeDraft };
        if (status === 'CANCELLED') return { label: 'Đã hủy', cls: styles.badgeCancelled };
        return { label: 'Lịch mẫu', cls: styles.badgeTemplate };
    };

    const activeItinerary = useMemo(
        () => (sessionDetail?.itineraryDays || []).find((d) => d.dayNumber === activeDay),
        [sessionDetail, activeDay],
    );

    /** Tiến độ điểm danh theo đơn đã thanh toán (đồng bộ trang Quản lý khách). */
    const rollAttendancePercent = useMemo(() => {
        const t = guestRoll?.totalGuestSlots ?? 0;
        const c = guestRoll?.checkedInGuestSlots ?? 0;
        if (!t) return null;
        return Math.min(100, Math.round((c / t) * 100));
    }, [guestRoll]);

    const attendancePercent = useMemo(() => {
        if (!sessionDetail?.maxParticipants) return 0;
        return Math.min(100, Math.round((sessionDetail.checkedInParticipants / sessionDetail.maxParticipants) * 100));
    }, [sessionDetail]);

    const displayAttendancePercent = rollAttendancePercent != null ? rollAttendancePercent : attendancePercent;

    const rollComplete =
        guestRoll &&
        guestRoll.totalGuestSlots > 0 &&
        guestRoll.checkedInGuestSlots >= guestRoll.totalGuestSlots;

    const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Dang cap nhat');

    const handleCheckIn = async (userId) => {
        try {
            await checkinSessionMember({ sessionId: tourId, userId, checkInType: 'gathering' });
            setCheckedInMembers((prev) => ({ ...prev, [userId]: true }));
            const roll = await getGuideSessionGuests(tourId);
            setGuestRoll(roll);
        } catch (err) {
            setError(err?.message || 'Điểm danh thất bại.');
        }
    };

    if (loading) return <div className={styles.page}>Dang tai du lieu...</div>;
    if (error && !sessionDetail) return <div className={styles.page}>{error}</div>;
    if (!sessionDetail) return <div className={styles.page}>Khong tim thay session.</div>;

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate('/guide/tours')}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                <span>Quay lai danh sach</span>
            </button>

            <div className={styles.heroBanner}>
                <img src={sessionDetail.thumbnailUrl || 'https://picsum.photos/1200/360'} alt={sessionDetail.tourTitle} className={styles.heroImage} />
                <div className={styles.heroOverlay}>
                    <div className={styles.heroInfo}>
                        <div className={styles.heroBadges}>
                            <span className={styles.statusBadge}>{(sessionDetail.status || '').toUpperCase()}</span>
                            <span className={styles.codeBadge}>Ma: {sessionDetail.tourCode || 'N/A'}</span>
                        </div>
                        <h1 className={styles.heroTitle}>{sessionDetail.tourTitle}</h1>
                    </div>
                    <div className={styles.heroActions}>
                        <button className={styles.heroBtnOutline} onClick={() => setMemberModalOpen(true)}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>how_to_reg</span>
                            Diem danh khach
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <div className={styles.overviewCard}>
                        <h2 className={styles.sectionTitle}>Tổng quan</h2>
                        <div className={styles.overviewGrid}>
                            <div className={styles.overviewItem}>
                                <span className="material-icons-round" style={{ fontSize: '24px', color: '#3b82f6' }}>groups</span>
                                <div>
                                    <span className={styles.overviewLabel}>Sĩ số đoàn (booking)</span>
                                    <span className={styles.overviewValue}>{sessionDetail.currentParticipants}/{sessionDetail.maxParticipants}</span>
                                </div>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className="material-icons-round" style={{ fontSize: '24px', color: '#3b82f6' }}>calendar_today</span>
                                <div>
                                    <span className={styles.overviewLabel}>Khởi hành</span>
                                    <span className={styles.overviewValue}>{formatDate(sessionDetail.startDate)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <span>
                                    Điểm danh đoàn
                                    {guestRoll && guestRoll.totalGuestSlots > 0 && (
                                        <span className={rollComplete ? styles.rollBadgeOk : styles.rollBadgeWarn}>
                                            {rollComplete ? 'Đã đủ' : 'Chưa đủ'}
                                        </span>
                                    )}
                                </span>
                                <span className={styles.progressPercent}>{displayAttendancePercent}%</span>
                            </div>
                            <p className={styles.rollSub}>
                                {guestRoll && guestRoll.totalGuestSlots > 0 ? (
                                    <>
                                        <strong>
                                            {guestRoll.checkedInGuestSlots}/{guestRoll.totalGuestSlots} khách
                                        </strong>{' '}
                                        đã tính điểm danh (theo các đơn đã thanh toán).
                                    </>
                                ) : (
                                    <>
                                        Chưa có dữ liệu đơn hoặc đang tải — hiển thị dự phòng:{' '}
                                        {sessionDetail.checkedInParticipants}/{sessionDetail.maxParticipants} (check-in hệ thống).
                                    </>
                                )}
                            </p>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${displayAttendancePercent}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.partnersCard}>
                        <div className={styles.partnerHeader}>
                            <h2 className={styles.sectionTitle}>Thong tin chuyen di</h2>
                        </div>
                        <div className={styles.partnerItem}>
                            <div className={styles.partnerIcon}>
                                <span className="material-icons-round">location_on</span>
                            </div>
                            <div className={styles.partnerInfo}>
                                <span className={styles.partnerType}>Diem den</span>
                                <span className={styles.partnerName}>{sessionDetail.location}</span>
                                <span className={styles.partnerDetail}>{formatDate(sessionDetail.startDate)} - {formatDate(sessionDetail.endDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.itineraryCard}>
                    <div className={styles.itineraryHeader}>
                        <h2 className={styles.sectionTitle}>
                            <span style={{ fontSize: '20px' }}>🗓</span> Lich trinh chi tiet
                        </h2>
                        <div className={styles.dayTabs}>
                            {(sessionDetail.itineraryDays || []).map((day) => (
                                <button
                                    key={day.dayNumber}
                                    className={`${styles.dayTab} ${activeDay === day.dayNumber ? styles.dayTabActive : ''}`}
                                    onClick={() => setActiveDay(day.dayNumber)}
                                >
                                    Ngay {day.dayNumber}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.dayLabel}>
                        <span className={styles.dayBadge}>DAY {activeDay}</span>
                        <h3 className={styles.dayTitle}>{activeItinerary?.title || 'Chua cap nhat lich trinh'}</h3>
                    </div>

                    {activeItinerary && (activeItinerary.summary || activeItinerary.description) && (
                        <p className={styles.dayIntro}>
                            {activeItinerary.summary || activeItinerary.description}
                        </p>
                    )}

                    <div className={styles.timeline}>
                        {!activeItinerary && (
                            <p className={styles.contentDesc}>Tour này chưa có dữ liệu lịch trình.</p>
                        )}
                        {activeItinerary && (!activeItinerary.activities || activeItinerary.activities.length === 0) && (
                            <p className={styles.contentDesc}>Chưa có hoạt động chi tiết cho ngày này.</p>
                        )}
                        {activeItinerary?.activities?.map((act, idx, arr) => {
                            const typeKey = (act.activityType || '').toUpperCase().replace('-', '_');
                            const icon = ACTIVITY_ICONS[typeKey] || 'place';
                            const typeLabel = ACTIVITY_TYPE_LABELS[typeKey] || act.activityType || 'Hoạt động';
                            const schedRow = scheduleRowForActivity(act);
                            const pub = publicationBadge(schedRow?.override?.publicationStatus);
                            const eff = schedRow?.effective;
                            const timeRange = eff
                                ? formatActivityTimeRange({ startTime: eff.startTime, endTime: eff.endTime })
                                : formatActivityTimeRange(act);
                            const displayTitle = eff?.title || act.title;
                            const displayLocation = eff?.locationName || act.locationName;
                            return (
                                <div key={`${act.sortOrder ?? idx}-${displayTitle ?? idx}`} className={styles.timelineItem}>
                                    <div className={styles.timelineLeft}>
                                        <div className={`${styles.timelineDot} ${styles.dot_upcoming}`} />
                                        {idx < arr.length - 1 && <div className={styles.timelineLine} />}
                                    </div>
                                    <div className={styles.timelineTime}>
                                        {timeRange || '—'}
                                    </div>
                                    <div className={styles.timelineContent}>
                                        <div className={styles.activityMeta}>
                                            {act.activityType && (
                                                <span className={styles.activityTypeBadge}>{typeLabel}</span>
                                            )}
                                            <span className={pub.cls}>{pub.label}</span>
                                            {schedRow?.sourceLabel && schedRow.sourceLabel !== 'Lịch mẫu' && (
                                                <span className={styles.badgeOverride}>{schedRow.sourceLabel}</span>
                                            )}
                                            {eff?.scheduleStatus === 'CONFIRMED' && (
                                                <span className={styles.badgeConfirmed}>Đã xác nhận</span>
                                            )}
                                            {eff?.scheduleStatus === 'ESTIMATED' && (
                                                <span className={styles.badgeEstimated}>Dự kiến</span>
                                            )}
                                            {schedRow?.activityId && (
                                                <button
                                                    type="button"
                                                    className={styles.scheduleEditBtn}
                                                    onClick={() => openEditActivity(schedRow)}
                                                >
                                                    Cập nhật đoàn
                                                </button>
                                            )}
                                        </div>
                                        <div className={styles.contentHeader}>
                                            <span className="material-icons-round" style={{ fontSize: '18px' }}>{icon}</span>
                                            <strong>{displayTitle || 'Hoạt động'}</strong>
                                        </div>
                                        {displayLocation && (
                                            <div className={styles.activityLocation}>
                                                <span className="material-icons-round" style={{ fontSize: '14px' }}>place</span>
                                                {displayLocation}
                                            </div>
                                        )}
                                        {act.description && (
                                            <p className={styles.contentDesc}>{act.description}</p>
                                        )}
                                        {act.imageUrl && (
                                            <img src={act.imageUrl} alt="" className={styles.activityImage} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {memberModalOpen && (
                <div className={styles.memberModalOverlay} onClick={() => setMemberModalOpen(false)}>
                    <div className={styles.memberModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.partnerHeader}>
                            <h2 className={styles.sectionTitle}>Danh sach khach</h2>
                            <button className={styles.addBtn} onClick={() => setMemberModalOpen(false)}>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
                            </button>
                        </div>
                        {members.map((m) => (
                            <div key={m.id} className={styles.partnerItem}>
                                <div className={styles.partnerInfo}>
                                    <span className={styles.partnerName}>{m.fullName || m.email}</span>
                                    <span className={styles.partnerDetail}>{m.email}</span>
                                </div>
                                <button className={styles.actionBtn} disabled={checkedInMembers[m.id]} onClick={() => handleCheckIn(m.id)}>
                                    {checkedInMembers[m.id] ? 'Da check-in' : 'Check-in'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && <p className={styles.contentDesc}>{error}</p>}

            {editActivity && (
                <div className={styles.memberModalOverlay} onClick={() => !scheduleBusy && setEditActivity(null)}>
                    <div className={styles.scheduleEditModal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.sectionTitle}>Cập nhật lịch đoàn</h2>
                        <p className={styles.contentDesc}>
                            Lịch mẫu giữ nguyên — thay đổi chỉ áp dụng cho chuyến này sau khi công bố.
                        </p>
                        <label className={styles.editField}>
                            Tiêu đề
                            <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                        </label>
                        <label className={styles.editField}>
                            Giờ bắt đầu (HH:mm)
                            <input value={editForm.startTime} onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))} />
                        </label>
                        <label className={styles.editField}>
                            Giờ kết thúc (HH:mm)
                            <input value={editForm.endTime} onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))} />
                        </label>
                        <label className={styles.editField}>
                            Địa điểm
                            <input value={editForm.locationName} onChange={(e) => setEditForm((f) => ({ ...f, locationName: e.target.value }))} />
                        </label>
                        <label className={styles.editField}>
                            Ghi chú vận hành
                            <textarea value={editForm.operationalNote} onChange={(e) => setEditForm((f) => ({ ...f, operationalNote: e.target.value }))} />
                        </label>
                        <label className={styles.editField}>
                            Trạng thái lịch
                            <select value={editForm.scheduleStatus} onChange={(e) => setEditForm((f) => ({ ...f, scheduleStatus: e.target.value }))}>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="ESTIMATED">Dự kiến</option>
                                <option value="UNAVAILABLE">Chưa có</option>
                            </select>
                        </label>
                        <div className={styles.scheduleEditActions}>
                            <button type="button" className={styles.heroBtnOutline} disabled={scheduleBusy} onClick={handleSaveDraft}>
                                Lưu nháp
                            </button>
                            <button type="button" className={styles.actionBtn} disabled={scheduleBusy} onClick={handlePublish}>
                                Công bố
                            </button>
                            <button
                                type="button"
                                className={styles.actionBtn}
                                disabled={scheduleBusy}
                                onClick={() => handleCancelActivity(editActivity.activityId)}
                            >
                                Hủy hoạt động
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuideTourDetail;
