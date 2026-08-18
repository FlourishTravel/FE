import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import styles from './GroupChat.module.css';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '../../api/auth';
import { getTourChatContext, listBookingChatMessages } from '../../api/tourChat';
import { getMyBookingDetail } from '../../api/bookings';
import ChatAvatar from '../../components/ChatAvatar';
import TourChatThread from '../../components/tourChat/TourChatThread';
import { BOOKING_CODE_RE, isBookingRef } from '../../utils/bookingRef';

function formatIsoDateVi(s) {
  if (!s) return '';
  const parts = String(s).split('-');
  if (parts.length < 3) return s;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

function formatSessionRange(start, end) {
  if (!start) return '—';
  const a = formatIsoDateVi(start);
  if (!end || end === start) return a;
  return `${a} – ${formatIsoDateVi(end)}`;
}

const GroupChat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');

  const loadContext = useCallback(async () => {
    if (!bookingId || !isBookingRef(bookingId)) {
      setLoadErr('Mã đặt chỗ không hợp lệ.');
      setLoading(false);
      return;
    }
    const token = getAccessToken();
    if (!token) {
      navigate(`/login?return=${encodeURIComponent(`/chat/${bookingId}`)}`);
      return;
    }
    setLoadErr('');
    setLoading(true);
    try {
      let id = bookingId;
      if (BOOKING_CODE_RE.test(bookingId)) {
        const detail = await getMyBookingDetail(bookingId);
        id = detail?.bookingId;
        if (!id) throw Object.assign(new Error('Không tìm thấy đặt chỗ.'), { status: 404 });
        navigate(`/chat/${id}`, { replace: true });
        return;
      }
      const ctx = await getTourChatContext(id);
      setContext(ctx);
    } catch (e) {
      if (e.status === 401) {
        navigate(`/login?return=${encodeURIComponent(`/chat/${bookingId}`)}`);
        return;
      }
      if (e.status === 404) {
        setLoadErr('Không tìm thấy đặt chỗ hoặc bạn không có quyền xem.');
      } else {
        setLoadErr(e.message || 'Không tải được phòng chat.');
      }
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  const refreshMessages = useCallback(async () => {
    if (!bookingId || !isBookingRef(bookingId) || BOOKING_CODE_RE.test(bookingId)) return;
    if (!getAccessToken()) return;
    try {
      const list = await listBookingChatMessages(bookingId, { limit: 80 });
      setMessages(Array.isArray(list) ? list : []);
    } catch {
      /* giữ danh sách cũ khi poll lỗi mạng */
    }
  }, [bookingId]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  useEffect(() => {
    if (!context?.canChat) return undefined;
    refreshMessages();
    const id = setInterval(refreshMessages, 5000);
    return () => clearInterval(id);
  }, [context?.canChat, refreshMessages]);

  const tourTitle = context?.tourTitle || 'Tour';
  const range = formatSessionRange(context?.sessionStartDate, context?.sessionEndDate);
  const guideLine = context?.guideName ? `HDV: ${context.guideName}` : null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatLayout}>
        <header className={styles.header}>
          <Link to="/my-journey" className={styles.backLink} aria-label="Quay lại">
            <ArrowLeft className={styles.backIcon} />
          </Link>
          <div className={styles.headerInfo}>
            {context?.guideAvatarUrl ? (
              <ChatAvatar
                name={context.guideName || 'HDV'}
                url={context.guideAvatarUrl}
                className={styles.headerAvatar}
              />
            ) : (
              <MessageCircle className={styles.headerIcon} />
            )}
            <div className={styles.headerCopy}>
              <h1 className={styles.roomTitle}>{tourTitle}</h1>
              <p className={styles.roomMeta}>
                Khởi hành {range}
                {guideLine ? ` · ${guideLine}` : ''}
              </p>
            </div>
            {Array.isArray(context?.members) && context.members.length > 0 && (
              <span className={styles.headerBadge}>{context.members.length} thành viên</span>
            )}
          </div>
        </header>

        {loading ? (
          <div className={styles.messages} style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
            <p className={styles.emptyHint}>Đang tải...</p>
          </div>
        ) : loadErr ? (
          <div className={styles.messages} style={{ padding: 24 }}>
            <p className={styles.emptyHint} style={{ color: '#b91c1c' }}>{loadErr}</p>
            <button type="button" className={styles.retryBtn} onClick={() => loadContext()}>
              Thử lại
            </button>
          </div>
        ) : context && !context.canChat ? (
          <div className={styles.messages} style={{ padding: 24 }}>
            <p className={styles.emptyHint}>{context.denyReason || 'Hiện không thể mở phòng chat cho đặt chỗ này.'}</p>
            <Link to="/my-journey" className={styles.retryBtn} style={{ display: 'inline-block', marginTop: 12, textAlign: 'center' }}>
              Về Chuyến đi của tôi
            </Link>
          </div>
        ) : (
          <TourChatThread
            bookingId={bookingId}
            currentUser={user}
            members={context?.members || []}
            messages={messages}
            setMessages={setMessages}
            canChat={!!context?.canChat}
            emptyHint="Chưa có tin nhắn. Nhấn @ để gắn tên (có Flora), thả icon hoặc trả lời tin như Zalo."
            onError={setLoadErr}
          />
        )}
      </div>
    </div>
  );
};

export default GroupChat;
