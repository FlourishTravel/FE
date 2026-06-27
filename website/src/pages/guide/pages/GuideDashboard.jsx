import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './GuideDashboard.module.css';
import {
  useGuideSessions,
  sessionDayOfMonth,
  formatViDateRange,
  statusLabel,
} from '../hooks/useGuideSessions';

const GuideDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessions, loading, error, ongoing, upcoming, completed } = useGuideSessions();

  const today = new Date();
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const featured = ongoing || upcoming[0] || null;

  const stats = useMemo(() => {
    const thisMonth = sessions.filter((s) => {
      if (!s.startDate) return false;
      const d = new Date(s.startDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthTours = thisMonth.filter((s) => s.status === 'completed' || s.status === 'ongoing').length;
    const totalGuests = sessions.reduce((sum, s) => sum + (s.currentParticipants || 0), 0);
    return { monthTours, totalGuests };
  }, [sessions, currentMonth, currentYear]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const calendarDays = [];
  for (let i = 0; i < adjustedFirstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const tourDays = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => {
      const day = sessionDayOfMonth(s.startDate);
      if (day != null) {
        const d = new Date(s.startDate);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          set.add(day);
        }
      }
    });
    return set;
  }, [sessions, currentMonth, currentYear]);

  const todos = useMemo(() => {
    const items = [];
    if (featured) {
      items.push({
        id: 'guests',
        text: `Kiểm tra danh sách khách — ${featured.tourTitle || 'Tour'}`,
        done: false,
        action: () => navigate(`/guide/tours/${featured.sessionId}`),
      });
      if ((featured.checkedInParticipants || 0) < (featured.currentParticipants || 0)) {
        items.push({
          id: 'checkin',
          text: `Điểm danh tập trung (${featured.checkedInParticipants || 0}/${featured.currentParticipants || 0})`,
          tag: 'Quan trọng',
          done: false,
          action: () => navigate('/guide/guests'),
        });
      }
    }
    if (upcoming[0] && !ongoing) {
      items.push({
        id: 'prep',
        text: `Chuẩn bị tour sắp tới: ${upcoming[0].tourTitle}`,
        time: formatViDateRange(upcoming[0].startDate, upcoming[0].endDate),
        done: false,
        action: () => navigate(`/guide/tours/${upcoming[0].sessionId}`),
      });
    }
    if (items.length === 0) {
      items.push({
        id: 'empty',
        text: 'Chưa có tour được giao trong tháng này',
        done: true,
      });
    }
    return items;
  }, [featured, ongoing, upcoming, navigate]);

  const progressPercent = featured
    ? Math.min(100, Math.round(((featured.checkedInParticipants || 0) / Math.max(featured.currentParticipants || 1, 1)) * 100))
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.topSection}>
        <div className={styles.greeting}>
          <h1 className={styles.greetTitle}>Xin chào, {user?.name?.split(' ').pop() || 'HDV'}! 👋</h1>
          <p className={styles.greetSub}>Chúc bạn một ngày dẫn tour thuận lợi và tràn đầy năng lượng.</p>
        </div>
        <div className={styles.dateDisplay}>
          <span className={styles.dateLabel}>Hôm nay</span>
          <span className={styles.dateValue}>
            {dayNames[today.getDay()]}, {today.getDate()} {monthNames[currentMonth]}, {currentYear}
          </span>
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: '#6b7280' }}>Đang tải lịch tour...</p>}

      <div className={styles.mainGrid}>
        <div className={styles.currentTour}>
          {featured ? (
            <>
              <div className={styles.tourHeader}>
                <div className={styles.tourBadge}>
                  <span className="material-icons-round" style={{ fontSize: '14px' }}>schedule</span>
                  {statusLabel(featured.status)}
                </div>
                <span className={styles.tourCode}>Mã: {featured.tourCode || featured.sessionId?.slice(0, 8)}</span>
              </div>
              <h2 className={styles.tourName}>{featured.tourTitle || 'Tour'}</h2>
              <div className={styles.tourTime}>
                <span className="material-icons-round" style={{ fontSize: '16px', color: '#6b7280' }}>schedule</span>
                <span>{formatViDateRange(featured.startDate, featured.endDate)}</span>
              </div>
              <div className={styles.tourInfoRow}>
                <div className={styles.tourInfoItem}>
                  <span className={styles.tourInfoLabel}>Số lượng khách</span>
                  <div className={styles.tourInfoValue}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#059669' }}>groups</span>
                    <strong>{featured.checkedInParticipants || 0}/{featured.currentParticipants || 0}</strong>
                  </div>
                </div>
                <div className={styles.tourInfoItem}>
                  <span className={styles.tourInfoLabel}>Điểm đến</span>
                  <div className={styles.tourInfoValue}>
                    <span className="material-icons-round" style={{ fontSize: '18px', color: '#059669' }}>location_on</span>
                    <strong>{featured.location || '—'}</strong>
                  </div>
                </div>
              </div>
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Check-in tập trung</span>
                  <span className={styles.progressValue}>{progressPercent}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <button
                type="button"
                className={styles.tourCode}
                style={{ marginTop: 12, background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => navigate(`/guide/tours/${featured.sessionId}`)}
              >
                Mở chi tiết tour
              </button>
            </>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              <h2 className={styles.tourName}>Chưa có tour đang chạy</h2>
              <p style={{ color: '#6b7280' }}>Xem danh sách tour được giao hoặc liên hệ điều hành.</p>
              <Link to="/guide/tours" style={{ color: '#059669', fontWeight: 600 }}>Danh sách tour →</Link>
            </div>
          )}
        </div>

        <div className={styles.statsColumn}>
          <div className={styles.statCard}>
            <div>
              <span className={styles.statLabel}>Tour tháng này</span>
              <span className={styles.statValue}>{stats.monthTours}</span>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <span className="material-icons-round">flag</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div>
              <span className={styles.statLabel}>Tổng khách (các tour)</span>
              <span className={styles.statValue}>{stats.totalGuests}</span>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <span className="material-icons-round">group_add</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div>
              <span className={styles.statLabel}>Đã hoàn thành</span>
              <span className={styles.statValue}>{completed.length}</span>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              <span className="material-icons-round">rate_review</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <h3 className={styles.calendarTitle}>Lịch tour tháng</h3>
            <div className={styles.monthSelector}>
              <span>{monthNames[currentMonth]}</span>
            </div>
          </div>
          <div className={styles.calendarGrid}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <div key={d} className={styles.calDayName}>{d}</div>
            ))}
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`${styles.calDay} ${day === today.getDate() ? styles.calToday : ''} ${!day ? styles.calEmpty : ''}`}
              >
                {day || ''}
                {day && tourDays.has(day) && <span className={styles.calDot} />}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.todoCard}>
          <div className={styles.todoHeader}>
            <h3 className={styles.todoTitle}>Việc cần làm</h3>
          </div>
          <div className={styles.todoList}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`${styles.todoItem} ${todo.done ? styles.todoDone : ''}`}
                role={todo.action ? 'button' : undefined}
                onClick={todo.action}
                style={todo.action ? { cursor: 'pointer' } : undefined}
              >
                <div className={`${styles.todoCheck} ${todo.done ? styles.todoChecked : ''}`}>
                  {todo.done && <span className="material-icons-round" style={{ fontSize: '16px' }}>check</span>}
                </div>
                <div className={styles.todoContent}>
                  <span className={`${styles.todoText} ${todo.done ? styles.todoTextDone : ''}`}>{todo.text}</span>
                  {todo.time && <span className={styles.todoTime}>{todo.time}</span>}
                  {todo.tag && (
                    <span className={styles.todoTag}>
                      <span className="material-icons-round" style={{ fontSize: '12px' }}>warning</span>
                      {todo.tag}
                    </span>
                  )}
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
