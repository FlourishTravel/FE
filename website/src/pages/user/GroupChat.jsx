import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import styles from './GroupChat.module.css';
import { useAuth } from '../../context/AuthContext';
import { getAccessToken } from '../../api/auth';
import {
  getTourChatContext,
  listBookingChatMessages,
  sendBookingChatMessage,
} from '../../api/tourChat';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function formatMsgTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function senderLabel(msg) {
  const r = (msg.senderRole || '').toUpperCase();
  if (r === 'TOUR_GUIDE') {
    return msg.senderName ? `${msg.senderName} (HDV)` : 'Hướng dẫn viên';
  }
  if (r === 'ADMIN') return msg.senderName || 'Quản trị';
  return msg.senderName || 'Thành viên';
}

const GroupChat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadContext = useCallback(async () => {
    if (!bookingId || !UUID_RE.test(bookingId)) {
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
      const ctx = await getTourChatContext(bookingId);
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
    if (!bookingId || !UUID_RE.test(bookingId)) return;
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!context?.canChat || !bookingId || !input.trim() || sending) return;
    setSending(true);
    try {
      const dto = await sendBookingChatMessage(bookingId, input.trim());
      setInput('');
      if (dto && dto.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === dto.id)) return prev;
          return [...prev, dto];
        });
      } else {
        await refreshMessages();
      }
    } catch (e) {
      setLoadErr(e.message || 'Gửi tin nhắn thất bại.');
    } finally {
      setSending(false);
    }
  };

  const tourTitle = context?.tourTitle || 'Tour';
  const range = formatSessionRange(context?.sessionStartDate, context?.sessionEndDate);
  const guideLine = context?.guideName ? `HDV: ${context.guideName}` : null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatLayout}>
        <header className={styles.header}>
          <Link to="/my-journey" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Quay lại
          </Link>
          <div className={styles.headerInfo}>
            <MessageCircle className={styles.headerIcon} />
            <div>
              <h1 className={styles.roomTitle}>Phòng chat: {tourTitle}</h1>
              <p className={styles.roomMeta}>
                Khởi hành {range}
                {guideLine ? ` · ${guideLine}` : ''}
              </p>
            </div>
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
          <>
            <div className={styles.messages}>
              {messages.length === 0 ? (
                <p className={styles.emptyHint}>Chưa có tin nhắn. Hãy chào HDV và đoàn!</p>
              ) : (
                messages.map((m) => {
                  const isMe = user && String(user.id) === String(m.senderId);
                  return (
                    <div key={m.id} className={isMe ? styles.msgRowMe : styles.msgRow}>
                      <div className={isMe ? styles.bubbleMe : styles.bubble}>
                        <span className={styles.bubbleSender}>
                          {isMe ? 'Bạn' : senderLabel(m)}
                          {m.isPinned ? ' · Đã ghim' : ''}
                        </span>
                        <p className={styles.bubbleText}>{m.content}</p>
                        <span className={styles.bubbleTime}>{formatMsgTime(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputBar}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className={styles.input}
                disabled={sending || !context?.canChat}
              />
              <button
                type="button"
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={sending || !context?.canChat || !input.trim()}
              >
                <Send className={styles.sendIcon} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
