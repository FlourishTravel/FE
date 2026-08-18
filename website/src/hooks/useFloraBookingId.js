import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listMyBookings } from '../api/bookings';
import { getTripFilterPhase } from '../config/navConfig';
import { useAuth } from '../context/AuthContext';

const BOOKING_PATH =
  /\/(?:my-journey\/booking|chat)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function bookingIdFromPath(pathname) {
  const match = String(pathname || '').match(BOOKING_PATH);
  return match?.[1] || null;
}

/**
 * Booking gắn vào Flora trên web user: UUID trên URL chuyến đi/chat,
 * hoặc chuyến đang diễn ra nếu khách đang chat từ trang khác.
 */
export function useFloraBookingId() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const fromPath = bookingIdFromPath(pathname);
  const [fromTrip, setFromTrip] = useState(null);

  useEffect(() => {
    if (fromPath || !user) {
      setFromTrip(null);
      return undefined;
    }
    let cancelled = false;
    listMyBookings()
      .then((list) => {
        if (cancelled) return;
        const rows = Array.isArray(list) ? list : [];
        const ongoing = rows.find((row) => getTripFilterPhase(row) === 'ongoing');
        setFromTrip(ongoing?.bookingId || ongoing?.id || null);
      })
      .catch(() => {
        if (!cancelled) setFromTrip(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fromPath, user]);

  return fromPath || fromTrip || null;
}
