import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './GuideOperations.module.css';
import { useGuideSessions, formatViDateRange } from '../hooks/useGuideSessions';
import { getSessionSchedule, getGuideSessionGuests } from '../../../api/guideTours';

const ACTIVITY_ICONS = {
  SIGHTSEEING: 'landscape',
  DINING: 'restaurant',
  TRANSPORT: 'directions_bus',
  EXPERIENCE: 'celebration',
  FREE_TIME: 'schedule',
  SHOPPING: 'shopping_bag',
  ACCOMMODATION: 'hotel',
};

function formatTime(value) {
  if (!value) return '';
  const m = String(value).match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(value);
}

const GuideOperations = () => {
  const navigate = useNavigate();
  const { sessions, loading, error, ongoing } = useGuideSessions();
  const [selectedId, setSelectedId] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [guestRoll, setGuestRoll] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [schedLoading, setSchedLoading] = useState(false);

  const activeSessions = useMemo(
    () => sessions.filter((s) => s.status === 'ongoing' || s.status === 'upcoming'),
    [sessions],
  );

  const selected = useMemo(
    () => sessions.find((s) => s.sessionId === selectedId) || ongoing || activeSessions[0],
    [sessions, selectedId, ongoing, activeSessions],
  );

  useEffect(() => {
    if (selected?.sessionId && !selectedId) {
      setSelectedId(selected.sessionId);
    }
  }, [selected, selectedId]);

  useEffect(() => {
    if (!selected?.sessionId) return;
    let alive = true;
    (async () => {
      setSchedLoading(true);
      try {
        const [sched, roll] = await Promise.all([
          getSessionSchedule(selected.sessionId),
          getGuideSessionGuests(selected.sessionId).catch(() => null),
        ]);
        if (!alive) return;
        setSchedule(sched);
        setGuestRoll(roll);
        if (sched?.days?.length) {
          setActiveDay(sched.days[0].dayNumber || 1);
        }
      } catch {
        if (alive) {
          setSchedule(null);
          setGuestRoll(null);
        }
      } finally {
        if (alive) setSchedLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selected?.sessionId]);

  const dayRow = useMemo(
    () => (schedule?.days || []).find((d) => d.dayNumber === activeDay),
    [schedule, activeDay],
  );

  const timeline = useMemo(() => {
    const acts = dayRow?.activities || [];
    return acts.map((row, index) => {
      const t = row.template || row;
      const title = t.title || t.activityTitle || 'Hoạt động';
      const start = formatTime(t.startTime || row.startTime);
      const end = formatTime(t.endTime || row.endTime);
      const time = start && end ? `${start} – ${end}` : start || '—';
      const type = (t.activityType || 'SIGHTSEEING').toUpperCase();
      const status = row.scheduleStatus === 'CANCELLED'
        ? 'upcoming'
        : index === 0
          ? 'current'
          : 'upcoming';
      return {
        id: row.activityId || t.id || index,
        icon: ACTIVITY_ICONS[type] || 'place',
        title,
        time,
        desc: t.description || t.locationName || '',
        status,
      };
    });
  }, [dayRow]);

  const guestCount = guestRoll?.totalGuestSlots || selected?.currentParticipants || 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            Vận hành: {selected?.tourTitle || 'Chọn tour'}
          </h1>
          <p className={styles.pageSubtitle}>
            <span className="material-icons-round" style={{ fontSize: '16px' }}>calendar_today</span>
            {selected ? formatViDateRange(selected.startDate, selected.endDate) : '—'}
          </p>
          {activeSessions.length > 1 && (
            <select
              value={selected?.sessionId || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
            >
              {activeSessions.map((s) => (
                <option key={s.sessionId} value={s.sessionId}>{s.tourTitle}</option>
              ))}
            </select>
          )}
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.btnOutline} onClick={() => navigate('/guide/guests')}>
            <span className="material-icons-round" style={{ fontSize: '18px' }}>groups</span>
            Đoàn {guestCount} khách
          </button>
          {selected?.sessionId && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate(`/guide/tours/${selected.sessionId}`)}
            >
              <span className="material-icons-round" style={{ fontSize: '18px' }}>check_circle_outline</span>
              Điểm danh & lịch trình
            </button>
          )}
        </div>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p>Đang tải...</p>}

      {!loading && !selected && (
        <p>Chưa có tour để vận hành. <Link to="/guide/tours">Xem danh sách tour</Link></p>
      )}

      {selected && (
        <div className={styles.mainGrid}>
          <div className={styles.timelineCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className="material-icons-round" style={{ color: '#059669' }}>route</span>
                Lịch trình ngày {activeDay}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {(schedule?.days || []).map((d) => (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() => setActiveDay(d.dayNumber)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: d.dayNumber === activeDay ? '#059669' : '#f3f4f6',
                      color: d.dayNumber === activeDay ? '#fff' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    Ngày {d.dayNumber}
                  </button>
                ))}
              </div>
            </div>

            {schedLoading && <p>Đang tải lịch trình...</p>}
            {!schedLoading && timeline.length === 0 && (
              <p style={{ color: '#6b7280', padding: 16 }}>
                Chưa có hoạt động cho ngày này. Chỉnh sửa tại{' '}
                <Link to={`/guide/tours/${selected.sessionId}`}>chi tiết tour</Link>.
              </p>
            )}

            <div className={styles.timeline}>
              {timeline.map((item, index) => (
                <div key={item.id} className={`${styles.timelineItem} ${styles[item.status]}`}>
                  <div className={styles.timelineLeft}>
                    <div className={styles.iconWrap}>
                      <span className="material-icons-round">{item.icon}</span>
                    </div>
                    {index < timeline.length - 1 && <div className={styles.verticalLine} />}
                  </div>
                  <div className={styles.contentBox}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <span className={styles.itemTime}>{item.time}</span>
                    </div>
                    {item.desc && <p className={styles.itemDesc}>{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.sosCard}>
              <div className={styles.sosIcon}>
                <span className="material-icons-round">support_agent</span>
              </div>
              <h2 className={styles.sosTitle}>Hỗ trợ điều hành</h2>
              <p className={styles.sosDesc}>
                Liên hệ hotline điều hành Flourish khi cần hỗ trợ y tế, thay đổi lịch khẩn hoặc sự cố trên tour.
              </p>
              <a href="tel:+84901234567" className={styles.sosBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons-round">call</span>
                GỌI ĐIỀU HÀNH
              </a>
            </div>

            <div className={styles.pollsCard}>
              <div className={styles.pollsHeader}>
                <h2 className={styles.pollsTitle}>
                  <span className="material-icons-round" style={{ color: '#059669' }}>how_to_vote</span>
                  Bình chọn nhanh
                </h2>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, padding: '0 16px 16px' }}>
                Tính năng bình chọn đoàn sẽ được bổ sung. Hiện dùng chat đoàn để thăm dò ý khách.
              </p>
              <Link
                to="/guide/communication"
                style={{ display: 'block', padding: '0 16px 16px', color: '#059669', fontWeight: 600 }}
              >
                Mở giao tiếp đoàn →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideOperations;
