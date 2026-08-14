import React, { useEffect, useMemo, useState } from 'react';
import { resolveMediaUrl } from '../../../api/config';
import { createAdminSession, deleteAdminSession, getAdminTourDetail } from '../../../api/tours';
import styles from './TourDetailModal.module.css';

const STATUS_LABELS = {
    draft: { label: 'Nháp', cls: 'badgeDraft' },
    active: { label: 'Đang hoạt động', cls: 'badgeActive' },
    departing_soon: { label: 'Sắp khởi hành', cls: 'badgeDepartingSoon' },
    upcoming: { label: 'Mở bán xa', cls: 'badgeUpcoming' },
    ongoing: { label: 'Đang diễn ra', cls: 'badgeOngoing' },
    completed: { label: 'Đã kết thúc', cls: 'badgeCompleted' },
    full: { label: 'Đã hết chỗ', cls: 'badgeFull' },
};

const SESSION_STATUS_LABELS = {
    scheduled: { label: 'Sắp khởi hành', cls: 'badgeDepartingSoon' },
    ongoing: { label: 'Đang diễn ra', cls: 'badgeOngoing' },
    in_progress: { label: 'Đang diễn ra', cls: 'badgeOngoing' },
    completed: { label: 'Hoàn tất', cls: 'badgeDraft' },
    cancelled: { label: 'Đã huỷ', cls: 'badgeFull' },
};

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

const TABS = [
    { key: 'overview', label: 'Tổng quan', icon: 'info' },
    { key: 'itinerary', label: 'Lịch trình', icon: 'event_note' },
    { key: 'locations', label: 'Địa điểm', icon: 'place' },
    { key: 'sessions', label: 'Đợt khởi hành', icon: 'calendar_month' },
    { key: 'media', label: 'Ảnh & Video', icon: 'collections' },
];

const formatVnd = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('vi-VN');
    } catch {
        return '—';
    }
};

const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};

/** LocalTime từ BE: chuỗi "HH:mm:ss", mảng [h,m,s], hoặc object { hour, minute }. */
const formatTimePart = (t) => {
    if (t == null || t === '') return '';
    if (typeof t === 'string') {
        const s = t.trim();
        return s.length >= 5 ? s.slice(0, 5) : s;
    }
    if (Array.isArray(t) && t.length >= 2) {
        const [h, m] = t;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    if (typeof t === 'object' && t.hour != null && t.minute != null) {
        return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
    }
    return '';
};

const formatActivityTimeWindow = (a) => {
    const st = formatTimePart(a?.startTime);
    const en = formatTimePart(a?.endTime);
    if (st && en) return `${st} – ${en}`;
    if (st) return st;
    if (a?.durationMinutes != null && a.durationMinutes > 0) return `${a.durationMinutes} phút`;
    return '';
};

const TourDetailModal = ({ isOpen, tourId, onClose, onEdit }) => {
    const [tab, setTab] = useState('overview');
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [expandedItineraryId, setExpandedItineraryId] = useState(null);
    const [newStartDate, setNewStartDate] = useState('');
    const [newMaxPax, setNewMaxPax] = useState('20');
    const [sessionBusy, setSessionBusy] = useState(false);
    const [sessionMsg, setSessionMsg] = useState('');

    const reloadDetail = () => {
        if (!tourId) return Promise.resolve();
        return getAdminTourDetail(tourId)
            .then((data) => setDetail(data || null))
            .catch((err) => setErrorMsg(err?.message || 'Không tải được chi tiết tour'));
    };

    useEffect(() => {
        if (!isOpen || !tourId) return;
        setTab('overview');
        setLoading(true);
        setErrorMsg('');
        setDetail(null);
        setNewStartDate('');
        setNewMaxPax('20');
        setSessionMsg('');
        getAdminTourDetail(tourId)
            .then((data) => setDetail(data || null))
            .catch((err) => setErrorMsg(err?.message || 'Không tải được chi tiết tour'))
            .finally(() => setLoading(false));
    }, [isOpen, tourId]);

    useEffect(() => {
        setExpandedItineraryId(null);
    }, [tourId, isOpen]);

    useEffect(() => {
        if (tab !== 'itinerary') setExpandedItineraryId(null);
    }, [tab]);

    const heroImage = useMemo(() => {
        if (!detail?.images?.length) return PLACEHOLDER_IMG;
        return detail.images[0]?.imageUrl || PLACEHOLDER_IMG;
    }, [detail]);

    const handleAddSession = async (e) => {
        e.preventDefault();
        if (!detail?.id || !newStartDate) return;
        setSessionBusy(true);
        setSessionMsg('');
        try {
            await createAdminSession({
                tourId: detail.id,
                startDate: newStartDate,
                maxParticipants: Number(newMaxPax) > 0 ? Number(newMaxPax) : 20,
            });
            setNewStartDate('');
            setNewMaxPax('20');
            setSessionMsg('Đã thêm đợt khởi hành.');
            await reloadDetail();
        } catch (err) {
            setSessionMsg(err?.message || 'Không thêm được đợt.');
        } finally {
            setSessionBusy(false);
        }
    };

    const handleDeleteSession = async (session) => {
        if (!session?.id) return;
        const ok = window.confirm(
            `Xoá đợt khởi hành ${formatDate(session.startDate)}? Chỉ xoá được đợt chưa có khách đặt.`
        );
        if (!ok) return;
        setSessionBusy(true);
        setSessionMsg('');
        try {
            await deleteAdminSession(session.id);
            setSessionMsg('Đã xoá đợt.');
            await reloadDetail();
        } catch (err) {
            setSessionMsg(err?.message || 'Không xoá được đợt.');
        } finally {
            setSessionBusy(false);
        }
    };

    if (!isOpen) return null;

    const renderStatusBadge = (status, dict = STATUS_LABELS) => {
        const cfg = dict[status] || dict.draft || { label: status || '—', cls: 'badgeDraft' };
        return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerHero}>
                        <img
                            src={heroImage}
                            alt={detail?.title || 'Tour'}
                            className={styles.heroImg}
                            onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                        />
                        <div className={styles.heroOverlay} />
                        <div className={styles.heroContent}>
                            <div className={styles.heroMeta}>
                                {detail?.category && (
                                    <span className={styles.categoryChip}>
                                        <span className="material-icons-round" style={{ fontSize: 14 }}>
                                            category
                                        </span>
                                        {detail.category.name}
                                        {detail.category.archived && (
                                            <span className={styles.archivedTag}>(lưu trữ)</span>
                                        )}
                                    </span>
                                )}
                                {detail?.status && renderStatusBadge(detail.status)}
                            </div>
                            <h2 className={styles.heroTitle}>
                                {loading ? 'Đang tải...' : detail?.title || '—'}
                            </h2>
                            <div className={styles.heroSlug}>/{detail?.slug || '—'}</div>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng" type="button">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            <span className="material-icons-round" style={{ fontSize: 16 }}>
                                {t.icon}
                            </span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {errorMsg && (
                        <div className={styles.errorBox}>
                            <span className="material-icons-round" style={{ fontSize: 18 }}>
                                error_outline
                            </span>
                            {errorMsg}
                        </div>
                    )}

                    {loading && !errorMsg && (
                        <div className={styles.loading}>
                            <span className="material-icons-round" style={{ fontSize: 28 }}>
                                hourglass_top
                            </span>
                            Đang tải dữ liệu...
                        </div>
                    )}

                    {!loading && detail && tab === 'overview' && (
                        <div className={styles.section}>
                            <div className={styles.grid2}>
                                <InfoBlock icon="payments" label="Giá cơ bản" value={formatVnd(detail.basePrice)} />
                                <InfoBlock
                                    icon="schedule"
                                    label="Thời lượng"
                                    value={
                                        detail.durationDays
                                            ? `${detail.durationDays}N${detail.durationNights ?? ''}Đ`
                                            : '—'
                                    }
                                />
                                <InfoBlock
                                    icon="event"
                                    label="Số đợt khởi hành"
                                    value={String(detail.sessions?.length ?? 0)}
                                />
                                <InfoBlock
                                    icon="place"
                                    label="Số địa điểm"
                                    value={String(detail.locations?.length ?? 0)}
                                />
                                <InfoBlock icon="event_available" label="Tạo lúc" value={formatDate(detail.createdAt)} />
                                <InfoBlock icon="update" label="Cập nhật" value={formatDate(detail.updatedAt)} />
                            </div>

                            <h3 className={styles.sectionTitle}>Mô tả</h3>
                            <div className={styles.descriptionBox}>
                                {detail.description || <em className={styles.muted}>Chưa có mô tả.</em>}
                            </div>
                        </div>
                    )}

                    {!loading && detail && tab === 'itinerary' && (
                        <div className={styles.section}>
                            {detail.itineraries?.length ? (
                                <div className={styles.timeline}>
                                    <p className={styles.itineraryHint}>
                                        Chọn một ngày để xem các hoạt động và ảnh minh hoạ.
                                    </p>
                                    {detail.itineraries.map((it) => {
                                        const isDayExpanded = expandedItineraryId === it.id;
                                        const acts = [...(it.activities || [])].sort(
                                            (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                                        );
                                        const coverSrc = it.coverImageUrl
                                            ? resolveMediaUrl(it.coverImageUrl)
                                            : '';
                                        return (
                                            <div key={it.id} className={styles.timelineItem}>
                                                <div className={styles.timelineMarker}>
                                                    <span>{it.dayNumber}</span>
                                                </div>
                                                <div className={styles.timelineColumn}>
                                                    <button
                                                        type="button"
                                                        className={styles.timelineDayToggle}
                                                        onClick={() =>
                                                            setExpandedItineraryId((prev) =>
                                                                prev === it.id ? null : it.id
                                                            )
                                                        }
                                                        aria-expanded={isDayExpanded}
                                                    >
                                                        <div className={styles.timelineDayToggleMain}>
                                                            {coverSrc ? (
                                                                <img
                                                                    src={coverSrc}
                                                                    alt=""
                                                                    className={styles.dayCoverThumb}
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={styles.timelineDayText}>
                                                                <div className={styles.timelineTitle}>
                                                                    Ngày {it.dayNumber ?? '—'}
                                                                    {it.title ? ` — ${it.title}` : ''}
                                                                </div>
                                                                {it.summary ? (
                                                                    <p className={styles.timelineSummary}>
                                                                        {it.summary}
                                                                    </p>
                                                                ) : null}
                                                                {!isDayExpanded && it.description ? (
                                                                    <p className={styles.timelineDescPreview}>
                                                                        {it.description}
                                                                    </p>
                                                                ) : null}
                                                                <span className={styles.activityCountBadge}>
                                                                    {acts.length} hoạt động
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`material-icons-round ${styles.timelineChevron}`}
                                                        >
                                                            {isDayExpanded ? 'expand_less' : 'expand_more'}
                                                        </span>
                                                    </button>
                                                    {isDayExpanded && (
                                                        <div className={styles.timelineExpand}>
                                                            {it.description && (
                                                                <p className={styles.timelineDesc}>{it.description}</p>
                                                            )}
                                                            {acts.length === 0 ? (
                                                                <div className={styles.activityEmpty}>
                                                                    Chưa có hoạt động chi tiết cho ngày này.
                                                                </div>
                                                            ) : (
                                                                <ul className={styles.activityList}>
                                                                    {acts.map((act) => {
                                                                        const imgSrc = act.imageUrl
                                                                            ? resolveMediaUrl(act.imageUrl)
                                                                            : '';
                                                                        const timeWin = formatActivityTimeWindow(act);
                                                                        return (
                                                                            <li key={act.id} className={styles.activityRow}>
                                                                                {imgSrc ? (
                                                                                    <div className={styles.activityThumbWrap}>
                                                                                        <img
                                                                                            src={imgSrc}
                                                                                            alt=""
                                                                                            className={styles.activityThumb}
                                                                                            onError={(e) => {
                                                                                                e.currentTarget.style.display =
                                                                                                    'none';
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div
                                                                                        className={styles.activityThumbPh}
                                                                                        aria-hidden
                                                                                    >
                                                                                        <span className="material-icons-round">
                                                                                            image
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                <div className={styles.activityBody}>
                                                                                    <div className={styles.activityTitle}>
                                                                                        {act.title || 'Hoạt động'}
                                                                                    </div>
                                                                                    <div className={styles.activityMeta}>
                                                                                        {timeWin ? (
                                                                                            <span>{timeWin}</span>
                                                                                        ) : null}
                                                                                        {act.activityType ? (
                                                                                            <span className={styles.activityType}>
                                                                                                {act.activityType}
                                                                                            </span>
                                                                                        ) : null}
                                                                                        {act.locationName ? (
                                                                                            <span className={styles.activityLoc}>
                                                                                                {act.locationName}
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                    {act.description ? (
                                                                                        <p className={styles.activityDesc}>
                                                                                            {act.description}
                                                                                        </p>
                                                                                    ) : null}
                                                                                </div>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyHint icon="event_note" text="Chưa có lịch trình chi tiết cho tour này." />
                            )}
                        </div>
                    )}

                    {!loading && detail && tab === 'locations' && (
                        <div className={styles.section}>
                            {detail.locations?.length ? (
                                <div className={styles.locationList}>
                                    {detail.locations.map((loc) => (
                                        <div key={loc.id} className={styles.locationItem}>
                                            <div className={styles.locationIdx}>{loc.visitOrder}</div>
                                            <div className={styles.locationInfo}>
                                                <div className={styles.locationName}>{loc.locationName}</div>
                                                <div className={styles.locationMeta}>
                                                    Ngày {loc.dayNumber ?? '?'} •{' '}
                                                    {loc.latitude != null && loc.longitude != null
                                                        ? `${Number(loc.latitude).toFixed(4)}, ${Number(loc.longitude).toFixed(4)}`
                                                        : 'Chưa có toạ độ'}
                                                </div>
                                            </div>
                                            {loc.latitude != null && loc.longitude != null && (
                                                <a
                                                    className={styles.mapLink}
                                                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Mở Google Maps"
                                                >
                                                    <span className="material-icons-round" style={{ fontSize: 18 }}>
                                                        open_in_new
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyHint icon="place" text="Chưa có địa điểm nào." />
                            )}
                        </div>
                    )}

                    {!loading && detail && tab === 'sessions' && (
                        <div className={styles.section}>
                            <form className={styles.addSessionForm} onSubmit={handleAddSession}>
                                <div className={styles.addSessionFields}>
                                    <label>
                                        Ngày khởi hành
                                        <input
                                            type="date"
                                            required
                                            value={newStartDate}
                                            onChange={(e) => setNewStartDate(e.target.value)}
                                            disabled={sessionBusy}
                                        />
                                    </label>
                                    <label>
                                        Số khách tối đa
                                        <input
                                            type="number"
                                            min="1"
                                            max="999"
                                            value={newMaxPax}
                                            onChange={(e) => setNewMaxPax(e.target.value)}
                                            disabled={sessionBusy}
                                        />
                                    </label>
                                </div>
                                <button type="submit" className={styles.addSessionBtn} disabled={sessionBusy}>
                                    <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
                                    {sessionBusy ? 'Đang lưu...' : 'Thêm đợt'}
                                </button>
                            </form>
                            {sessionMsg ? (
                                <p className={styles.sessionMsg}>{sessionMsg}</p>
                            ) : (
                                <p className={styles.sessionHint}>
                                    Ngày kết thúc được tính từ số ngày của tour. Có thể thêm nhiều đợt cho cùng một tour.
                                </p>
                            )}
                            {detail.sessions?.length ? (
                                <table className={styles.sessionTable}>
                                    <thead>
                                        <tr>
                                            <th>Đợt</th>
                                            <th>Khởi hành</th>
                                            <th>Kết thúc</th>
                                            <th>Slot</th>
                                            <th>HDV</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detail.sessions.map((s, idx) => {
                                            const total = s.maxParticipants ?? 0;
                                            const current = s.currentParticipants ?? 0;
                                            const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
                                            const canDelete = current === 0 && s.status !== 'ongoing';
                                            return (
                                                <tr key={s.id}>
                                                    <td>Đợt {idx + 1}</td>
                                                    <td>{formatDate(s.startDate)}</td>
                                                    <td>{formatDate(s.endDate)}</td>
                                                    <td>
                                                        <div className={styles.spotsCell}>
                                                            <div className={styles.spotsBar}>
                                                                <div
                                                                    className={styles.spotsFill}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span>
                                                                {current}/{total}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {s.tourGuide ? (
                                                            <div className={styles.guideCell}>
                                                                {s.tourGuide.avatarUrl ? (
                                                                    <img
                                                                        src={s.tourGuide.avatarUrl}
                                                                        alt={s.tourGuide.fullName}
                                                                        className={styles.guideAvatar}
                                                                    />
                                                                ) : (
                                                                    <div className={styles.guideAvatarPh}>
                                                                        <span className="material-icons-round" style={{ fontSize: 14 }}>
                                                                            person
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <span>{s.tourGuide.fullName}</span>
                                                            </div>
                                                        ) : (
                                                            <span className={styles.muted}>Chưa gán</span>
                                                        )}
                                                    </td>
                                                    <td>{renderStatusBadge(s.status, SESSION_STATUS_LABELS)}</td>
                                                    <td>
                                                        {canDelete ? (
                                                            <button
                                                                type="button"
                                                                className={styles.sessionDeleteBtn}
                                                                disabled={sessionBusy}
                                                                onClick={() => handleDeleteSession(s)}
                                                                title="Xoá đợt chưa có khách"
                                                            >
                                                                <span className="material-icons-round" style={{ fontSize: 16 }}>
                                                                    delete_outline
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className={styles.muted}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyHint
                                    icon="calendar_month"
                                    text="Chưa có lịch khởi hành. Thêm đợt ở form phía trên để mở bán."
                                />
                            )}
                        </div>
                    )}

                    {!loading && detail && tab === 'media' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                Ảnh ({detail.images?.length ?? 0})
                            </h3>
                            {detail.images?.length ? (
                                <div className={styles.imageGrid}>
                                    {detail.images.map((img) => (
                                        <div key={img.id} className={styles.imageCard}>
                                            <img
                                                src={img.imageUrl}
                                                alt={img.caption || ''}
                                                onError={(e) => {
                                                    e.currentTarget.src = PLACEHOLDER_IMG;
                                                }}
                                            />
                                            {img.caption && (
                                                <div className={styles.imageCaption}>{img.caption}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyHint icon="image" text="Chưa có ảnh." />
                            )}

                            <h3 className={styles.sectionTitle} style={{ marginTop: 20 }}>
                                Video ({detail.videos?.length ?? 0})
                            </h3>
                            {detail.videos?.length ? (
                                <div className={styles.videoList}>
                                    {detail.videos.map((v) => (
                                        <a
                                            key={v.id}
                                            href={v.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.videoCard}
                                        >
                                            <img
                                                src={v.thumbnailUrl || PLACEHOLDER_IMG}
                                                alt={v.title || 'Video'}
                                                onError={(e) => {
                                                    e.currentTarget.src = PLACEHOLDER_IMG;
                                                }}
                                            />
                                            <div className={styles.videoOverlay}>
                                                <span className="material-icons-round" style={{ fontSize: 32 }}>
                                                    play_circle
                                                </span>
                                            </div>
                                            <div className={styles.videoMeta}>
                                                <div className={styles.videoTitle}>{v.title || 'Video'}</div>
                                                <div className={styles.videoDur}>
                                                    {formatDuration(v.durationSeconds)}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <EmptyHint icon="videocam" text="Chưa có video." />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.btnGhost} onClick={onClose} type="button">
                        Đóng
                    </button>
                    {detail?.id && (
                        <button
                            className={styles.btnPrimary}
                            onClick={() => onEdit && onEdit(detail)}
                            type="button"
                        >
                            <span className="material-icons-round" style={{ fontSize: 18 }}>
                                edit
                            </span>
                            Chỉnh sửa & lịch trình
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoBlock = ({ icon, label, value }) => (
    <div className={styles.infoBlock}>
        <div className={styles.infoIcon}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>
                {icon}
            </span>
        </div>
        <div>
            <div className={styles.infoLabel}>{label}</div>
            <div className={styles.infoValue}>{value}</div>
        </div>
    </div>
);

const EmptyHint = ({ icon, text }) => (
    <div className={styles.empty}>
        <span className="material-icons-round" style={{ fontSize: 28 }}>
            {icon}
        </span>
        <span>{text}</span>
    </div>
);

export default TourDetailModal;
