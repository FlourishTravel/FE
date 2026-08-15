import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './GuideCommunication.module.css';
import { useGuideSessions } from '../hooks/useGuideSessions';
import { getGuideSessionGuests } from '../../../api/guideTours';
import {
  getTourChatContext,
  listBookingChatMessages,
} from '../../../api/tourChat';
import { useAuth } from '../../../context/AuthContext';
import TourChatThread from '../../../components/tourChat/TourChatThread';

const GuideCommunication = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessions, loading: sessionsLoading } = useGuideSessions();
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') || '');
  const [guestData, setGuestData] = useState(null);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [bookingId, setBookingId] = useState(searchParams.get('bookingId') || '');
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatErr, setChatErr] = useState('');

  useEffect(() => {
    if (!sessionId && sessions.length > 0) {
      setSessionId(sessions[0].sessionId);
    }
  }, [sessions, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    (async () => {
      setGuestsLoading(true);
      try {
        const data = await getGuideSessionGuests(sessionId);
        if (alive) setGuestData(data);
      } catch {
        if (alive) setGuestData(null);
      } finally {
        if (alive) setGuestsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [sessionId]);

  const bookings = useMemo(() => guestData?.bookings || [], [guestData]);

  useEffect(() => {
    if (!bookingId && bookings.length > 0) {
      setBookingId(bookings[0].bookingId);
      return;
    }
    if (bookingId && bookings.length > 0) {
      const valid = bookings.some((b) => String(b.bookingId) === String(bookingId));
      if (!valid) setBookingId(bookings[0].bookingId);
    }
  }, [bookings, bookingId]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (sessionId) next.set('sessionId', sessionId);
    if (bookingId) next.set('bookingId', bookingId);
    setSearchParams(next, { replace: true });
  }, [sessionId, bookingId, setSearchParams]);

  const loadChat = useCallback(async () => {
    if (!bookingId) return;
    setChatLoading(true);
    setChatErr('');
    try {
      const ctx = await getTourChatContext(bookingId);
      setContext(ctx);
      const list = await listBookingChatMessages(bookingId, { limit: 80 });
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      setContext(null);
      setMessages([]);
      setChatErr(e.message || 'Không mở được phòng chat.');
    } finally {
      setChatLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!context?.canChat || !bookingId) return undefined;
    const id = setInterval(async () => {
      try {
        const list = await listBookingChatMessages(bookingId, { limit: 80 });
        setMessages(Array.isArray(list) ? list : []);
      } catch {
        /* ignore poll errors */
      }
    }, 8000);
    return () => clearInterval(id);
  }, [context?.canChat, bookingId]);

  const selectedBooking = bookings.find((b) => String(b.bookingId) === String(bookingId));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Giao tiếp đoàn</h1>
          <p className={styles.pageSubtitle}>
            Chat theo từng booking — cùng API với app khách và trang chat công khai.
          </p>
        </div>
        <div className={styles.headerBadges}>
          <span className={styles.guestBadge}>
            <span className="material-icons-round" style={{ fontSize: '16px' }}>groups</span>
            {bookings.length} đơn
          </span>
        </div>
      </div>

      <div className={styles.sessionRow} style={{ marginBottom: 12 }}>
        <select
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setBookingId('');
          }}
          disabled={sessionsLoading || !sessions.length}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 280 }}
        >
          {sessions.map((s) => (
            <option key={s.sessionId} value={s.sessionId}>
              {s.tourTitle} · {s.startDate || ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.broadcastCard}>
          <h2 className={styles.broadcastTitle}>
            <span className="material-icons-round">forum</span>
            Phòng chat theo đơn
          </h2>
          <p className={styles.broadcastSub}>Chọn booking để nhắn với khách trong đơn đó.</p>
          {guestsLoading && <p className={styles.broadcastSub}>Đang tải...</p>}
          {!guestsLoading && bookings.length === 0 && (
            <p className={styles.broadcastSub}>Chưa có booking trên chuyến này.</p>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bookings.map((b) => (
              <li key={b.bookingId}>
                <button
                  type="button"
                  onClick={() => setBookingId(b.bookingId)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: String(b.bookingId) === String(bookingId) ? '2px solid #059669' : '1px solid #e5e7eb',
                    background: String(b.bookingId) === String(bookingId) ? '#ecfdf5' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <strong>{b.travelerName || 'Khách'}</strong>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {b.guestCount > 1 ? `${b.guestCount} khách · ` : ''}
                    {b.effectiveContactPhone || b.phone || '—'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <Link to="/guide/guests" style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: '#059669' }}>
            Quản lý khách & điểm danh →
          </Link>
        </div>

        <div className={styles.chatCard}>
          <div className={styles.chatTabs}>
            <button type="button" className={`${styles.chatTab} ${styles.chatTabActive}`}>
              {selectedBooking?.travelerName || 'Chọn đơn'}
            </button>
          </div>

          <div className={styles.chatThreadWrap}>
            {chatLoading && <p className={styles.systemMsg}>Đang tải tin nhắn...</p>}
            {chatErr && !chatLoading && <p className={styles.systemMsg}>{chatErr}</p>}
            {context && !context.canChat && !chatLoading && (
              <p className={styles.systemMsg}>{context.denyReason || 'Chưa thể chat với đơn này.'}</p>
            )}
            {!bookingId && !chatLoading && (
              <p className={styles.systemMsg}>Chọn một đơn bên trái để mở phòng chat.</p>
            )}
            {!chatLoading && context?.canChat && (
              <TourChatThread
                bookingId={bookingId}
                currentUser={user}
                members={context?.members || []}
                messages={messages}
                setMessages={setMessages}
                canChat
                compact
                emptyHint="Chưa có tin nhắn. Nhấn @ để gắn tên (có Flora), thả icon hoặc trả lời tin như Zalo."
                onError={setChatErr}
              />
            )}
          </div>
        </div>

        <div className={styles.liveTipsCard}>
          <div className={styles.liveTipsHeader}>
            <span className={styles.liveTipsTitle}>
              <span className="material-icons-round" style={{ fontSize: '18px' }}>tips_and_updates</span>
              Gợi ý HDV
            </span>
          </div>
          <p className={styles.liveTipsSub}>
            Mỗi booking có phòng chat riêng. Dùng chat để thông báo tập trung, đổi giờ đón hoặc thăm dò ý kiến đoàn.
          </p>
          {bookingId && (
            <a
              href={`/chat/${bookingId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#059669' }}
            >
              Mở chat toàn màn hình ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideCommunication;
