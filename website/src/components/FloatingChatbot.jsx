import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Send } from 'lucide-react';
import { sendChatbotMessage } from '../api/chatbot';
import { postFloraNearbyRecommendations } from '../api/flora';
import { useAuth } from '../context/AuthContext';
import { FLORA_OPEN_EVENT, FLORA_QUICK_ACTIONS } from '../config/navConfig';
import { bookingIdFromPath } from '../hooks/useFloraBookingId';
import FloraAvatar from './FloraAvatar';
import styles from './FloatingChatbot.module.css';

const WELCOME_MSG = {
  role: 'bot',
  text: 'Hi, mình là Flora. Hỏi lịch, mưa gió, chỗ ăn, mua quà tại chỗ hay chính sách tour đều được nha. Thử "Đang ở Big C, mua quà cho mẹ 500 baht".',
};

function formatPrice(n) {
  if (n == null) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

const FloatingChatbot = ({ bookingId: bookingIdProp, pageSource = 'flora' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const bookingId = bookingIdProp || bookingIdFromPath(pathname) || undefined;
  const bookingIdRef = useRef(bookingId);
  bookingIdRef.current = bookingId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef('fe-' + Math.random().toString(36).slice(2, 11));
  const [lastState, setLastState] = useState(null);
  const gpsRef = useRef({ latitude: null, longitude: null });

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!open || typeof navigator === 'undefined' || !navigator.geolocation) return undefined;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  }, [open]);

  useEffect(() => {
    const onOpenFlora = (e) => {
      const prompt = e.detail?.prompt;
      if (e.detail?.bookingId) bookingIdRef.current = e.detail.bookingId;
      setMenuOpen(false);
      setOpen(true);
      if (prompt) {
        window.setTimeout(() => handleSend(prompt), 100);
      }
    };
    window.addEventListener(FLORA_OPEN_EVENT, onOpenFlora);
    return () => window.removeEventListener(FLORA_OPEN_EVENT, onOpenFlora);
  }, []);

  const handleSend = async (textToSend = null) => {
    const content = (textToSend ?? input).trim();
    if (!content) return;

    setInput(textToSend ? input : '');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: content }]);
    setLoading(true);

    try {
      const res = await sendChatbotMessage({
        content,
        sessionId: sessionIdRef.current,
        userId: user?.id || undefined,
        state: lastState || undefined,
        bookingId: bookingIdRef.current,
        locale: 'vi',
        source: pageSource,
        latitude: gpsRef.current.latitude ?? undefined,
        longitude: gpsRef.current.longitude ?? undefined,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Không nhận được phản hồi');
      }

      const { reply, tours, quickReplies, suggestedActions, state: nextState } = res.data;
      const tourList = Array.isArray(tours) ? tours : [];
      const quickReplyList = Array.isArray(quickReplies) ? quickReplies : [];
      const actionList = Array.isArray(suggestedActions) ? suggestedActions : [];
      if (nextState) setLastState(nextState);

      setMessages(prev => [...prev, {
        role: 'bot',
        text: reply,
        tours: tourList.length ? tourList.map(t => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          price: t.price,
          durationDays: t.durationDays,
          imageUrl: t.imageUrl,
          actions: Array.isArray(t.actions) ? t.actions : [],
        })) : undefined,
        quickReplies: quickReplyList.length ? quickReplyList : undefined,
        suggestedActions: actionList.length ? actionList : undefined,
      }]);
    } catch (err) {
      setError(err.message || `Lỗi kết nối API (${import.meta.env.VITE_API_URL || 'chưa cấu hình'})`);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ hotline nhé.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedAction = async (action) => {
    if (action?.type === 'OPEN_MAP' && action.payload) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(action.payload)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    if (action?.type !== 'OPEN_NEARBY_RECOMMENDATIONS') return;
    const id = action.payload || bookingIdRef.current;
    if (!id) {
      navigate('/my-journey');
      return;
    }
    const shopping = /mua sắm|shopping/i.test(action.label || '');
    setLoading(true);
    setError(null);
    try {
      let body = {};
      if (gpsRef.current.latitude != null && gpsRef.current.longitude != null) {
        body = {
          latitude: gpsRef.current.latitude,
          longitude: gpsRef.current.longitude,
          locationConsent: true,
        };
      } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 60000,
            });
          });
          body = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationConsent: true,
          };
          gpsRef.current = { latitude: body.latitude, longitude: body.longitude };
        } catch {
          body = {};
        }
      }
      if (shopping) body.categories = ['SHOPPING'];
      const res = await postFloraNearbyRecommendations(id, body);
      const recs = Array.isArray(res.data?.recommendations) ? res.data.recommendations : [];
      const warning = Array.isArray(res.data?.warnings) ? res.data.warnings[0] : null;
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: recs.length
          ? (shopping ? 'Chỗ mua sắm gần bạn:' : 'Gợi ý gần bạn:')
          : (warning || 'Chưa có gợi ý trong khu vực này.'),
        nearby: recs.length ? recs : undefined,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: err.message || 'Không tải được gợi ý gần đây.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (payload) => {
    if (!payload) return;
    handleSend(payload);
  };

  const handleQuickAction = (action) => {
    setMenuOpen(false);
    if (action.href) {
      navigate(action.href);
      return;
    }
    setOpen(true);
    if (action.prompt) {
      window.setTimeout(() => handleSend(action.prompt), 100);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Mở Flora AI"
        aria-expanded={menuOpen}
      >
        <FloraAvatar className={styles.fabAvatar} alt="" />
        <span className={styles.fabLabel}>Flora AI</span>
      </button>

      {menuOpen && !open && (
        <>
          <button
            type="button"
            className={styles.menuBackdrop}
            aria-label="Đóng menu Flora"
            onClick={() => setMenuOpen(false)}
          />
          <div className={styles.quickMenu}>
            <div className={styles.quickMenuHeader}>
              <FloraAvatar className={styles.quickMenuAvatar} alt="" />
              <span>Flora AI</span>
            </div>
            {FLORA_QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className={styles.quickMenuItem}
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </button>
            ))}
            <button
              type="button"
              className={styles.quickMenuChat}
              onClick={() => {
                setMenuOpen(false);
                setOpen(true);
              }}
            >
              Mở chat đầy đủ
            </button>
          </div>
        </>
      )}

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <FloraAvatar className={styles.headerAvatar} alt="" />
              Flora AI
            </div>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng">
              <X className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? styles.msgUser : styles.msgBot}>
                {m.role === 'bot' && <FloraAvatar className={styles.msgBotAvatar} alt="Flora" />}
                <div className={m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}>
                  <p>{m.text}</p>
                  {m.tours && m.tours.length > 0 && (
                    <div className={styles.tourCards}>
                      {m.tours.map((t) => (
                        <div key={t.id} className={styles.tourCardWrap}>
                          <Link
                            to={`/tours/${t.id}`}
                            className={styles.tourCard}
                            onClick={() => setOpen(false)}
                          >
                            <img src={t.imageUrl || 'https://placehold.co/80/eee/999?text=Tour'} alt="" />
                            <div className={styles.tourCardInfo}>
                              <strong>{t.title}</strong>
                              <span>
                                {t.durationDays ? `${t.durationDays} ngày` : ''}
                                {t.durationDays && t.price ? ' · ' : ''}
                                {t.price ? formatPrice(t.price) : ''}
                              </span>
                            </div>
                          </Link>
                          {t.actions && t.actions.length > 0 && (
                            <div className={styles.tourCardActions}>
                              {t.actions.map((a, ai) => (
                                <button
                                  key={ai}
                                  type="button"
                                  className={styles.tourCardActionBtn}
                                  onClick={() => handleQuickReply(a.payload || a.label)}
                                >
                                  {a.label || a.payload}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className={styles.quickReplies}>
                      {m.quickReplies.map((q, qi) => (
                        <button
                          key={qi}
                          type="button"
                          className={styles.quickReplyBtn}
                          onClick={() => handleQuickReply(q.payload || q.label)}
                        >
                          {q.label || q.payload}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.nearby && m.nearby.length > 0 && (
                    <div className={styles.tourCards}>
                      {m.nearby.map((item) => (
                        <div key={item.id} className={styles.tourCardWrap}>
                          <div className={styles.tourCard}>
                            <div className={styles.tourCardInfo}>
                              <strong>{item.name}</strong>
                              <span>
                                {item.category}
                                {item.straightLineDistanceMeters != null ? ` · ${item.straightLineDistanceMeters}m` : ''}
                                {item.fitsSchedule ? ' · còn kịp giờ tập trung' : ''}
                              </span>
                            </div>
                          </div>
                          {item.mapAction?.latitude != null && item.mapAction?.longitude != null && (
                            <div className={styles.tourCardActions}>
                              <a
                                className={styles.tourCardActionBtn}
                                href={`https://www.google.com/maps/search/?api=1&query=${item.mapAction.latitude},${item.mapAction.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Mở bản đồ
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className={styles.quickReplies}>
                      {m.suggestedActions.map((a, ai) => (
                        <button
                          key={ai}
                          type="button"
                          className={styles.quickReplyBtn}
                          onClick={() => handleSuggestedAction(a)}
                        >
                          {a.label || 'Xem gợi ý gần đây'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.msgBot}>
                <FloraAvatar className={styles.msgBotAvatar} alt="Flora" />
                <div className={styles.bubbleBot}>
                  <p className={styles.typing}>Đang suy nghĩ...</p>
                </div>
              </div>
            )}
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="VD: Đang ở Big C, mua quà cho mẹ 500 baht"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={loading}
            >
              <Send className={styles.sendIcon} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
