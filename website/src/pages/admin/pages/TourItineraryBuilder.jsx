import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TourItineraryBuilder.module.css';

const TourItineraryBuilder = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();

    const [days, setDays] = useState([
        {
            id: 1,
            title: 'Khám phá Thủ đô',
            activities: [
                { id: 101, time: '09:00 - 10:30', location: 'Văn Miếu Quốc Tử Giám', desc: 'Tham quan trường đại học đầu tiên của Việt Nam.' },
                { id: 102, time: '11:00 - 12:30', location: 'Hồ Hoàn Kiếm', desc: 'Dạo quanh hồ và viếng đền Ngọc Sơn.' },
                { id: 103, time: '12:30 - 14:00', location: 'Nghỉ trưa & Buffet', desc: 'Thưởng thức đặc sản địa phương.' }
            ]
        }
    ]);
    const [activeDayId, setActiveDayId] = useState(1);

    const activeDay = days.find(d => d.id === activeDayId);

    const handleAddDay = () => {
        const newId = days.length > 0 ? Math.max(...days.map(d => d.id)) + 1 : 1;
        setDays([...days, { id: newId, title: `Ngày ${newId}`, activities: [] }]);
        setActiveDayId(newId);
    };

    const handleAddActivity = (dayId) => {
        setDays(days.map(day => {
            if (day.id === dayId) {
                const newActId = Date.now();
                return {
                    ...day,
                    activities: [...day.activities, { id: newActId, time: '', location: '', desc: '' }]
                };
            }
            return day;
        }));
    };

    const handleUpdateActivity = (dayId, actId, field, value) => {
        setDays(days.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    activities: day.activities.map(act => 
                        act.id === actId ? { ...act, [field]: value } : act
                    )
                };
            }
            return day;
        }));
    };

    const handleDeleteActivity = (dayId, actId) => {
        setDays(days.map(day => {
            if (day.id === dayId) {
                return {
                    ...day,
                    activities: day.activities.filter(act => act.id !== actId)
                };
            }
            return day;
        }));
    };

    const handleUpdateDayTitle = (dayId, title) => {
        setDays(days.map(day => day.id === dayId ? { ...day, title } : day));
    };

    // Calculate totals
    const totalActivities = days.reduce((sum, day) => sum + day.activities.length, 0);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.titleArea}>
                    <button className={styles.backBtn} onClick={() => navigate('/admin/tours')}>
                        <span className="material-icons-round">arrow_back</span>
                    </button>
                    <div>
                        <h1 className={styles.pageTitle}>Xây dựng Lịch trình</h1>
                        <p className={styles.pageSubtitle}>Tùy chỉnh các hoạt động và điểm đến theo từng ngày khởi hành.</p>
                    </div>
                </div>
                <button className={styles.saveBtn} onClick={() => navigate('/admin/tours')}>
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>save</span>
                    Lưu Lịch Trình
                </button>
            </div>

            <div className={styles.builderLayout}>
                {/* Left Column - Form */}
                <div className={styles.itineraryCard}>
                    <div className={styles.dayTabs}>
                        {days.map((day, index) => (
                            <button 
                                key={day.id}
                                className={`${styles.dayTab} ${activeDayId === day.id ? styles.dayTabActive : ''}`}
                                onClick={() => setActiveDayId(day.id)}
                            >
                                Ngày {index + 1}
                            </button>
                        ))}
                        <button className={styles.addDayBtn} onClick={handleAddDay}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>add</span>
                            Thêm Ngày
                        </button>
                    </div>

                    {activeDay && (
                        <div className={styles.dayContent}>
                            <div className={styles.dayHeader}>
                                <input 
                                    type="text" 
                                    value={activeDay.title} 
                                    onChange={(e) => handleUpdateDayTitle(activeDay.id, e.target.value)}
                                    placeholder="Tiêu đề ngày (VD: Khám phá Thủ đô)"
                                />
                            </div>

                            <div className={styles.activityList}>
                                {activeDay.activities.map(act => (
                                    <div key={act.id} className={styles.activityItem}>
                                        <div className={styles.activityDot}></div>
                                        <button 
                                            className={styles.deleteActivity} 
                                            onClick={() => handleDeleteActivity(activeDay.id, act.id)}
                                            title="Xóa hoạt động"
                                        >
                                            <span className="material-icons-round" style={{ fontSize: '16px' }}>close</span>
                                        </button>

                                        <div className={styles.activityHeader}>
                                            <div className={styles.inputGroup}>
                                                <div className={styles.inputIcon}><span className="material-icons-round" style={{ fontSize: '18px' }}>schedule</span></div>
                                                <input 
                                                    type="text" 
                                                    className={styles.activityInput}
                                                    placeholder="Thời gian (VD: 09:00 - 10:30)" 
                                                    value={act.time}
                                                    onChange={e => handleUpdateActivity(activeDay.id, act.id, 'time', e.target.value)}
                                                />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <div className={styles.inputIcon}><span className="material-icons-round" style={{ fontSize: '18px' }}>place</span></div>
                                                <input 
                                                    type="text" 
                                                    className={styles.activityInput}
                                                    placeholder="Địa điểm tham quan" 
                                                    value={act.location}
                                                    onChange={e => handleUpdateActivity(activeDay.id, act.id, 'location', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <textarea 
                                            className={styles.activityDesc}
                                            placeholder="Mô tả chi tiết hoạt động tại đây..."
                                            value={act.desc}
                                            onChange={e => handleUpdateActivity(activeDay.id, act.id, 'desc', e.target.value)}
                                        ></textarea>
                                    </div>
                                ))}
                            </div>
                            
                            <button className={styles.addActivityBtn} onClick={() => handleAddActivity(activeDay.id)}>
                                <span className="material-icons-round">add_circle_outline</span>
                                Thêm hoạt động mới
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>Tóm tắt Lịch trình</h3>
                    
                    <div className={styles.statList}>
                        <div className={styles.statItem}>
                            <div className={styles.statIcon}>
                                <span className="material-icons-round">calendar_today</span>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Tổng thời gian</span>
                                <span className={styles.statValue}>{days.length} Ngày</span>
                            </div>
                        </div>
                        
                        <div className={styles.statItem}>
                            <div className={styles.statIcon}>
                                <span className="material-icons-round">map</span>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Quãng đường dự kiến</span>
                                <span className={styles.statValue}>~45 km</span>
                            </div>
                        </div>
                        
                        <div className={styles.statItem}>
                            <div className={styles.statIcon}>
                                <span className="material-icons-round">location_on</span>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Số điểm tham quan</span>
                                <span className={styles.statValue}>{totalActivities} Địa điểm</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tourInfo}>
                        <img 
                            src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80" 
                            alt="Tour Preview" 
                            className={styles.tourImage} 
                        />
                        <span className={styles.tourCode}>Mã Tour: TEMP-{tourId}</span>
                        <h4 className={styles.tourName}>Tour Mới Khởi Tạo</h4>
                        <p className={styles.statLabel}>Vui lòng hoàn thành lịch trình trước khi công bố tour này.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourItineraryBuilder;
