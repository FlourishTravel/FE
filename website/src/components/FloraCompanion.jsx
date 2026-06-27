import React, { useEffect, useState, useCallback } from 'react';
import { getFloraJourney, postFloraNearbyRecommendations } from '../api/flora';
import styles from './FloraCompanion.module.css';

function scheduleBadge(status) {
  if (status === 'CONFIRMED') return { label: 'Đã xác nhận', className: styles.badgeConfirmed };
  if (status === 'ESTIMATED') return { label: 'Dự kiến', className: styles.badgeEstimated };
  return { label: 'Chưa có lịch tập trung', className: styles.badgeUnavailable };
}

function formatInstant(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return null;
  }
}

function mapUrl(lat, lon) {
  if (lat == null || lon == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

/**
 * Active-tour briefing panel — activity-level journey from Flora API.
 */
export default function FloraCompanion({ bookingId, onChatFlora }) {
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [nearbyData, setNearbyData] = useState(null);

  const loadJourney = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getFloraJourney(bookingId);
      if (res.success) setJourney(res.data);
      else setError(res.message || 'Không tải hành trình');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  const meeting = journey?.nextMeeting;
  const confirmedMeeting = meeting?.scheduleStatus === 'CONFIRMED' && meeting?.reminderEligible;

  useEffect(() => {
    if (!confirmedMeeting) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [confirmedMeeting, meeting?.time]);

  const loadNearby = useCallback(async () => {
    if (!bookingId) return;
    setNearbyLoading(true);
    setNearbyError(null);
    try {
      let body = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
          body = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationConsent: true,
          };
        } catch {
          // Fall back to activity/destination on server when permission denied
        }
      }
      const res = await postFloraNearbyRecommendations(bookingId, body);
      if (res.success) setNearbyData(res.data);
      else setNearbyError(res.message || 'Không tải gợi ý gần đây');
    } catch (e) {
      setNearbyError(e.message);
    } finally {
      setNearbyLoading(false);
    }
  }, [bookingId]);

  const handleNearbyClick = () => {
    setNearbyOpen(true);
    loadNearby();
  };

  if (loading) return <div className={styles.wrap}>Flora đang tải lịch trình...</div>;
  if (error) return <div className={styles.wrap}>{error}</div>;
  if (!journey) return null;

  const inactive = journey.journeyStatus && !['ACTIVE', 'UPCOMING'].includes(journey.journeyStatus);
  if (inactive) return null;

  const badge = scheduleBadge(meeting?.scheduleStatus);
  const countdown = confirmedMeeting && meeting?.minutesUntil != null && meeting.minutesUntil >= 0
    ? meeting.minutesUntil
    : null;

  // tick triggers re-render for countdown refresh
  void tick;

  const current = journey.currentActivity;
  const next = journey.nextActivity;
  const mapLink = mapUrl(meeting?.latitude, meeting?.longitude);

  return (
    <section className={styles.wrap} aria-label="Flora AI đồng hành">
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Flora AI — Đồng hành chuyến đi</h3>
        <span className={badge.className}>{badge.label}</span>
      </div>

      {(meeting?.scheduleSource === 'SESSION_OVERRIDE' || next?.scheduleSource === 'SESSION_OVERRIDE') && (
        <div className={styles.scheduleUpdated}>
          <strong>Lịch trình đã cập nhật</strong>
          {meeting?.lastUpdatedAt && (
            <span className={styles.muted}> — Cập nhật lúc {formatInstant(meeting.lastUpdatedAt)}</span>
          )}
          {meeting?.locationName && meeting.scheduleSource === 'SESSION_OVERRIDE' && (
            <p className={styles.line}>
              <strong>Điểm tập trung mới:</strong> {meeting.locationName}
            </p>
          )}
          <p className={styles.muted}>
            Thông tin lịch trình có thể thay đổi theo điều kiện thực tế.
          </p>
          <button type="button" className={styles.actionBtn} onClick={loadJourney}>
            Làm mới hành trình
          </button>
        </div>
      )}

      {current && (
        <p className={styles.line}>
          <strong>Đang diễn ra:</strong> {current.title}
          {current.endAt && (
            <span className={styles.muted}> (đến {formatInstant(current.endAt)})</span>
          )}
        </p>
      )}
      {!current && journey.currentScheduleItem && (
        <p className={styles.line}>
          <strong>Hôm nay:</strong> {journey.currentScheduleItem.title}
        </p>
      )}

      {next && (
        <p className={styles.line}>
          <strong>Tiếp theo:</strong> {next.title}
          {next.startAt && (
            <span className={styles.muted}> — {formatInstant(next.startAt)}</span>
          )}
        </p>
      )}
      {!next && journey.nextScheduleItem && (
        <p className={styles.line}>
          <strong>Tiếp theo (ngày):</strong> {journey.nextScheduleItem.title}
        </p>
      )}

      {(meeting?.locationName || journey.meetingPoint) && (
        <p className={styles.line}>
          <strong>Điểm tập trung:</strong>{' '}
          {meeting?.locationName || journey.meetingPoint}
          {meeting?.locationAddress && meeting.locationAddress !== meeting?.locationName && (
            <span className={styles.muted}> — {meeting.locationAddress}</span>
          )}
        </p>
      )}

      {countdown != null && (
        <p className={styles.countdown}>
          Còn khoảng <strong>{countdown}</strong> phút đến giờ tập trung
          {meeting?.time && (
            <span className={styles.muted}> ({formatInstant(meeting.time)})</span>
          )}
        </p>
      )}

      {!confirmedMeeting && (next || journey.nextScheduleItem) && (
        <p className={styles.fallback}>
          Flora đã xác định hoạt động tiếp theo, nhưng điểm tập trung chính thức chưa được cập nhật.
          Bạn hãy theo thông báo của hướng dẫn viên hoặc kiểm tra nhóm chat đoàn nhé.
        </p>
      )}

      {journey.warnings?.map((w, i) => (
        <p key={i} className={styles.warning}>{w}</p>
      ))}

      {journey.weatherSummary && (
        <p className={styles.line}>Thời tiết: {journey.weatherSummary}</p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.actionBtn} onClick={handleNearbyClick} disabled={nearbyLoading}>
          {nearbyLoading ? 'Đang tải gợi ý...' : 'Gợi ý gần đây'}
        </button>
        {mapLink && (
          <a className={styles.actionBtn} href={mapLink} target="_blank" rel="noopener noreferrer">
            Xem trên bản đồ
          </a>
        )}
        {onChatFlora && (
          <button type="button" className={styles.actionBtn} onClick={onChatFlora}>
            Chat với Flora
          </button>
        )}
      </div>

      {nearbyOpen && (
        <section className={styles.nearbySection} aria-label="Gợi ý gần đây">
          <h4 className={styles.nearbyTitle}>Gợi ý gần đây</h4>
          {nearbyError && <p className={styles.warning}>{nearbyError}</p>}
          {nearbyData?.journeyContext && (
            <p className={styles.line}>
              {nearbyData.journeyContext.canValidateSchedule && nearbyData.journeyContext.freeMinutesUntilMeeting != null ? (
                <>Thời gian còn lại: khoảng <strong>{nearbyData.journeyContext.freeMinutesUntilMeeting}</strong> phút</>
              ) : (
                <span className={styles.fallbackInline}>Chưa thể xác nhận đủ thời gian</span>
              )}
              {nearbyData.journeyContext.scheduleStatus && (
                <span className={styles.muted}> — {nearbyData.journeyContext.scheduleStatus === 'CONFIRMED' ? 'Đã xác nhận' : 'Dữ liệu địa điểm dự kiến'}</span>
              )}
            </p>
          )}
          {nearbyData?.warnings?.map((w, i) => (
            <p key={`nw-${i}`} className={styles.warning}>{w}</p>
          ))}
          {nearbyData?.recommendations?.length > 0 ? (
            <ul className={styles.nearbyList}>
              {nearbyData.recommendations.map((item) => (
                <li key={item.id} className={styles.nearbyCard}>
                  <div className={styles.nearbyCardHeader}>
                    <strong>{item.name}</strong>
                    {item.fitsSchedule ? (
                      <span className={styles.badgeFits}>Phù hợp với thời gian còn lại</span>
                    ) : (
                      <span className={styles.badgeNoFit}>Chưa thể xác nhận đủ thời gian</span>
                    )}
                  </div>
                  <p className={styles.muted}>
                    {item.category}
                    {item.straightLineDistanceMeters != null && ` · ${item.straightLineDistanceMeters}m`}
                    {item.estimatedVisitMinutes != null && ` · ~${item.estimatedVisitMinutes} phút ghé thăm`}
                  </p>
                  {item.dataSource && item.dataSource !== 'OSM' && (
                    <p className={styles.warning}>Dữ liệu địa điểm dự kiến ({item.dataSource})</p>
                  )}
                  {item.warnings?.map((w, wi) => (
                    <p key={wi} className={styles.warning}>{w}</p>
                  ))}
                  {item.mapAction?.latitude != null && item.mapAction?.longitude != null && (
                    <a
                      className={styles.actionBtn}
                      href={`https://www.google.com/maps/search/?api=1&query=${item.mapAction.latitude},${item.mapAction.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mở bản đồ
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : !nearbyLoading && !nearbyError && (
            <p className={styles.muted}>Chưa có gợi ý trong khu vực này.</p>
          )}
        </section>
      )}

      {journey.packingReminders?.length > 0 && (
        <ul className={styles.list}>
          {journey.packingReminders.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
