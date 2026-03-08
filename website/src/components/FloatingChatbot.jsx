import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { sendChatbotMessage } from '../api/chatbot';
import styles from './FloatingChatbot.module.css';

const WELCOME_MSG = {
  role: 'bot',
  text: 'Xin chào! Tôi là trợ lý AI của Flourish. Bạn có thể hỏi "Tour biển 3 ngày", "Chính sách hủy tour?" hoặc "5 ngày Đà Nẵng + Hội An" để tôi gợi ý.',
};

function formatPrice(n) {
  if (n == null) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef('fe-' + Math.random().toString(36).slice(2, 11));
  const [lastState, setLastState] = useState(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

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
        state: lastState || undefined,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Không nhận được phản hồi');
      }

      const { reply, tours = [], quickReplies = [], state: nextState } = res.data;
      if (nextState) setLastState(nextState);

      setMessages(prev => [...prev, {
        role: 'bot',
        text: reply,
        tours: tours.length ? tours.map(t => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          price: t.price,
          durationDays: t.durationDays,
          imageUrl: t.imageUrl,
          actions: t.actions || [],
        })) : undefined,
        quickReplies: quickReplies.length ? quickReplies : undefined,
      }]);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối. Kiểm tra backend đang chạy tại ' + (import.meta.env.VITE_API_URL || 'http://localhost:8080'));
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ hotline nhé.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (payload) => {
    if (!payload) return;
    handleSend(payload);
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Mở AI Chatbot"
      >
        <MessageCircle className={styles.fabIcon} />
        <span className={styles.fabLabel}>AI Gợi ý tour</span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Bot className={styles.botIcon} />
              Trợ lý AI Flourish
            </div>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Đóng">
              <X className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? styles.msgUser : styles.msgBot}>
                {m.role === 'bot' && <Bot className={styles.msgBotAvatar} />}
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
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.msgBot}>
                <Bot className={styles.msgBotAvatar} />
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
              placeholder="VD: Tour biển 3 ngày, Chính sách hủy tour..."
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
