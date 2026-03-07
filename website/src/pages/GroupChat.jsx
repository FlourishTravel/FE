import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Bell } from 'lucide-react';
import styles from './GroupChat.module.css';

const MOCK_ROOMS = {
    1: { tourTitle: 'Bangkok – Pattaya', startDate: '15/04/2025' },
    2: { tourTitle: 'Siem Reap – Phnom Penh', startDate: '22/05/2025' },
};

const MOCK_MESSAGES = [
    { id: 1, sender: 'Hướng dẫn viên', text: 'Chào cả đoàn, mình là HDV cho tour Bangkok – Pattaya. Mọi người chuẩn bị vali nhé!', time: '10:30', isMe: false },
    { id: 2, sender: 'Bạn', text: 'Dạ em đã sẵn sàng ạ.', time: '10:32', isMe: true },
    { id: 3, sender: 'Minh Anh', text: 'Cho mình hỏi điểm tập trung ở sân bay cụ thể là gate nào ạ?', time: '10:35', isMe: false },
    { id: 4, sender: 'Hướng dẫn viên', text: 'Cả đoàn tập trung tại Gate A, quầy A15 – mình sẽ cầm bảng Flourish Tourism.', time: '10:38', isMe: false },
];

const GroupChat = () => {
    const { bookingId } = useParams();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [input, setInput] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const messagesEndRef = useRef(null);
    const room = MOCK_ROOMS[bookingId] || MOCK_ROOMS[1];

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        const t = setTimeout(() => {
            setShowNotification(true);
            setMessages((prev) => [...prev, {
                id: prev.length + 1,
                sender: 'Hệ thống',
                text: 'Tin nhắn mới từ Hướng dẫn viên: "Lịch bay đã xác nhận, gửi mọi người file PDF đính kèm."',
                time: 'Vừa xong',
                isMe: false,
            }]);
        }, 4000);
        return () => clearTimeout(t);
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, {
            id: prev.length + 1,
            sender: 'Bạn',
            text: input.trim(),
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        }]);
        setInput('');
    };

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
                            <h1 className={styles.roomTitle}>Phòng chat: {room.tourTitle}</h1>
                            <p className={styles.roomMeta}>Khởi hành {room.startDate}</p>
                        </div>
                    </div>
                </header>

                <div className={styles.messages}>
                    {messages.map((m) => (
                        <div key={m.id} className={m.isMe ? styles.msgRowMe : styles.msgRow}>
                            <div className={m.isMe ? styles.bubbleMe : styles.bubble}>
                                <span className={styles.bubbleSender}>{m.sender}</span>
                                <p className={styles.bubbleText}>{m.text}</p>
                                <span className={styles.bubbleTime}>{m.time}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.inputBar}>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className={styles.input}
                    />
                    <button type="button" className={styles.sendBtn} onClick={sendMessage}>
                        <Send className={styles.sendIcon} />
                    </button>
                </div>
            </div>

            {showNotification && (
                <div className={styles.popup} role="alert">
                    <Bell className={styles.popupIcon} />
                    <div>
                        <strong>Tin nhắn mới</strong>
                        <p>Hướng dẫn viên đã gửi tin nhắn trong phòng chat.</p>
                    </div>
                    <button type="button" className={styles.popupClose} onClick={() => setShowNotification(false)}>×</button>
                </div>
            )}
        </div>
    );
};

export default GroupChat;
