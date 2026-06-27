import { useEffect, useState } from 'react';
import { listMyGuideSessions } from '../../../api/guideTours';

export function useGuideSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await listMyGuideSessions();
        if (alive) setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) {
          setSessions([]);
          setError(e?.message || 'Không tải được lịch tour');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const ongoing = sessions.find((s) => s.status === 'ongoing');
  const upcoming = sessions.filter((s) => s.status === 'upcoming');
  const completed = sessions.filter((s) => s.status === 'completed');

  return { sessions, loading, error, ongoing, upcoming, completed };
}

export function sessionDayOfMonth(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? null : d.getDate();
}

export function formatViDateRange(start, end) {
  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

export function statusLabel(status) {
  switch (status) {
    case 'ongoing': return 'Đang diễn ra';
    case 'upcoming': return 'Sắp khởi hành';
    case 'completed': return 'Đã hoàn thành';
    default: return status || '—';
  }
}
