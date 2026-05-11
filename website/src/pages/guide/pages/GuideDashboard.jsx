import React, { useState } from 'react';
import styles from './GuideDashboard.module.css';

const TODOS = [
    { id: 1, text: 'Xác nhận số lượng xe đón đoàn 45 chỗ', time: 'Trước 07:00', done: true },
    { id: 2, text: 'Kiểm tra danh sách khách VIP ăn chay', tag: 'Quan trọng', done: false },
    { id: 3, text: 'Gọi điện nhà hàng xác nhận thực đơn bữa trưa', time: 'Trước 10:30', done: false },
];

const GuideDashboard = () => {
    const [todos, setTodos] = useState(TODOS);
    const today = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    // Calendar helpers
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start

    const calendarDays = [];
    for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    // Dots for certain days (sample tour schedule)
    const tourDays = [1, 3, 4, 5, today.getDate(), today.getDate() + 1];

    return (
        <div className={styles.page}>
            {/* Top Section */}
            <div className={styles.topSection}>
                <div className={styles.greeting}>
                    <h1 className={styles.greetTitle}>Xin chào, Quang! 👋</h1>
                    <p className={styles.greetSub}>Chúc bạn một ngày dẫn tour thuận lợi và tràn đầy năng lượng.</p>
                </div>
                <div className={styles.dateDisplay}>
                    <span className={styles.dateLabel}>Hôm nay</span>
                    <span className={styles.dateValue}>{dayNames[today.getDay()]}, {today.getDate()} {monthNames[currentMonth]}, {currentYear}</span>
                </div>
            </div>

            {/* Current Tour + Stats */}
            <div className={styles.mainGrid}>
                {/* Current Tour Card */}
                <div className={styles.currentTour}>
                    <div className={styles.tourHeader}>
                        <div className={styles.tourBadge}>
                            <span className="material-icons-round" style={{ fontSize: '14px' }}>schedule</span>
                            Đang diễn ra
                        </div>
                        <span className={styles.tourCode}>Mã Tour: FLR-VT-2410</span>
                    </div>
                    <h2 className={styles.tourName}>Khám Phá Vịnh Hạ Long 2 Ngày 1 Đêm</h2>
                    <div className={styles.tourTime}>
                        <span className="material-icons-round" style={{ fontSize: '16px', color: '#6b7280' }}>schedule</span>
                        <span>08:00, 24/10 - 17:00, 25/10 (Còn 32 giờ)</span>
                    </div>

                    <div className={styles.tourInfoRow}>
                        <div className={styles.tourInfoItem}>
                            <span className={styles.tourInfoLabel}>Số lượng khách</span>
                            <div className={styles.tourInfoValue}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#059669' }}>groups</span>
                                <strong>24/25</strong>
                            </div>
                        </div>
                        <div className={styles.tourInfoItem}>
                            <span className={styles.tourInfoLabel}>Điểm đến tiếp theo</span>
                            <div className={styles.tourInfoValue}>
                                <span className="material-icons-round" style={{ fontSize: '18px', color: '#059669' }}>location_on</span>
                                <strong>Hang Sửng Sốt</strong>
                            </div>
                        </div>
                    </div>

                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span>Tiến độ lịch trình</span>
                            <span className={styles.progressValue}>45%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsColumn}>
                    <div className={styles.statCard}>
                        <div>
                            <span className={styles.statLabel}>Tour đã dẫn (Tháng này)</span>
                            <span className={styles.statValue}>12</span>
                        </div>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <span className="material-icons-round">flag</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div>
                            <span className={styles.statLabel}>Tổng khách phục vụ</span>
                            <span className={styles.statValue}>345</span>
                        </div>
                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                            <span className="material-icons-round">group_add</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div>
                            <span className={styles.statLabel}>Điểm đánh giá TB</span>
                            <div className={styles.ratingRow}>
                                <span className={styles.statValue}>4.9</span>
                                <span className="material-icons-round" style={{ fontSize: '22px', color: '#fbbf24' }}>star</span>
                            </div>
                        </div>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <span className="material-icons-round">rate_review</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Calendar + Todos */}
            <div className={styles.bottomGrid}>
                {/* Calendar */}
                <div className={styles.calendarCard}>
                    <div className={styles.calendarHeader}>
                        <h3 className={styles.calendarTitle}>Lịch trình cá nhân</h3>
                        <div className={styles.monthSelector}>
                            <span>{monthNames[currentMonth]}</span>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>expand_more</span>
                        </div>
                    </div>
                    <div className={styles.calendarGrid}>
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                            <div key={d} className={styles.calDayName}>{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => (
                            <div
                                key={idx}
                                className={`${styles.calDay} ${day === today.getDate() ? styles.calToday : ''} ${!day ? styles.calEmpty : ''}`}
                            >
                                {day || ''}
                                {day && tourDays.includes(day) && <span className={styles.calDot}></span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Todos */}
                <div className={styles.todoCard}>
                    <div className={styles.todoHeader}>
                        <h3 className={styles.todoTitle}>Việc cần làm hôm nay</h3>
                        <button className={styles.addTodoBtn}>
                            <span className="material-icons-round">add</span>
                        </button>
                    </div>
                    <div className={styles.todoList}>
                        {todos.map(todo => (
                            <div key={todo.id} className={`${styles.todoItem} ${todo.done ? styles.todoDone : ''}`}>
                                <button
                                    className={`${styles.todoCheck} ${todo.done ? styles.todoChecked : ''}`}
                                    onClick={() => toggleTodo(todo.id)}
                                >
                                    {todo.done && <span className="material-icons-round" style={{ fontSize: '16px' }}>check</span>}
                                </button>
                                <div className={styles.todoContent}>
                                    <span className={`${styles.todoText} ${todo.done ? styles.todoTextDone : ''}`}>{todo.text}</span>
                                    {todo.time && <span className={styles.todoTime}>{todo.time}</span>}
                                    {todo.tag && <span className={styles.todoTag}><span className="material-icons-round" style={{ fontSize: '12px' }}>warning</span> {todo.tag}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDashboard;
