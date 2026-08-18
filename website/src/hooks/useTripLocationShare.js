import { useEffect, useRef, useState } from 'react';
import { postFloraLocation } from '../api/flora';

export function todayIsoVn() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
}

/** Chỉ chia sẻ GPS với HDV trong các ngày tour (múi giờ VN). */
export function isTripOngoing({ sessionStartDate, sessionEndDate, bookingStatus }) {
  const st = String(bookingStatus || '').toLowerCase();
  if (!['paid', 'confirmed', 'completed'].includes(st)) return false;
  if (!sessionStartDate) return false;
  const today = todayIsoVn();
  const start = String(sessionStartDate).slice(0, 10);
  const end = String(sessionEndDate || sessionStartDate).slice(0, 10);
  return today >= start && today <= end;
}

/**
 * Gửi vị trí khi khách đang mở chi tiết chuyến trong ngày tour.
 * Trước/sau chuyến: không hỏi GPS.
 */
export function useTripLocationShare({ bookingId, sessionStartDate, sessionEndDate, bookingStatus }) {
  const [status, setStatus] = useState('idle');
  const live = isTripOngoing({ sessionStartDate, sessionEndDate, bookingStatus });
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!live || !bookingId || typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('idle');
      return undefined;
    }

    const send = (coords) => {
      const now = Date.now();
      if (now - lastSentRef.current < 20_000) return;
      lastSentRef.current = now;
      postFloraLocation(bookingId, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracy,
      })
        .then(() => setStatus('sharing'))
        .catch(() => setStatus('error'));
    };

    setStatus('pending');
    const watchId = navigator.geolocation.watchPosition(
      (pos) => send(pos.coords),
      (err) => setStatus(err?.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: false, maximumAge: 15_000, timeout: 20_000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [live, bookingId]);

  return { live, status };
}
