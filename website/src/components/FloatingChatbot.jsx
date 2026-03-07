import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import styles from './FloatingChatbot.module.css';

const AI_SUGGESTION_TOURS = [
    { id: 1, title: 'Bangkok – Pattaya', price: '8.999.000', duration: '5N4Đ', image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?w=200&q=80' },
    { id: 2, title: 'Đảo Coral & Biển', price: '5.490.000', duration: '3N2Đ', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80' },
    { id: 4, title: 'Suối Nước Nóng & Trek', price: '4.990.000', duration: '5N4Đ', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80' },
];

const FloatingChatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Xin chào! Tôi là trợ lý AI của Flourish. Bạn có thể nhập ví dụ: "Gợi ý tour biển tuần sau tầm 5 triệu" để tôi gợi ý tour phù hợp.' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: 'Dựa trên yêu cầu của bạn, đây là một số tour phù hợp:',
                tours: AI_SUGGESTION_TOURS
            }]);
        }, 800);
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
                                    {m.tours && (
                                        <div className={styles.tourCards}>
                                            {m.tours.map((t) => (
                                                <Link
                                                    key={t.id}
                                                    to={`/tours/${t.id}`}
                                                    className={styles.tourCard}
                                                    onClick={() => setOpen(false)}
                                                >
                                                    <img src={t.image} alt="" />
                                                    <div className={styles.tourCardInfo}>
                                                        <strong>{t.title}</strong>
                                                        <span>{t.duration} · {t.price} VND</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            placeholder="VD: Gợi ý tour biển tầm 5 triệu..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className={styles.input}
                        />
                        <button type="button" className={styles.sendBtn} onClick={handleSend}>
                            <Send className={styles.sendIcon} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingChatbot;
