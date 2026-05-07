import React, { useState } from 'react';
import GuideAssignmentModal from '../components/GuideAssignmentModal';
import styles from './TourDispatch.module.css';

const MOCK_TOURS_BY_DATE = {
    15: [
        { id: 'T1', name: 'Tour Đồng Nai - Rừng Nam Cát Tiên', code: 'DN-NCT-01', status: 'issue', currentGuide: 'Lê Minh Tâm', avatar: 'LT' },
        { id: 'T2', name: 'Sài Gòn Discovery', code: 'SG-DIS-02', status: 'ok', currentGuide: 'Nguyễn Trần Minh', avatar: 'NM' },
        { id: 'T3', name: 'Đà Lạt Retreat 3N2Đ', code: 'DL-RET-03', status: 'ok', currentGuide: 'Trần Hương Ly', avatar: 'HL' },
    ],
    18: [
        { id: 'T4', name: 'Nha Trang Biển Gọi', code: 'NT-BG-01', status: 'ok', currentGuide: 'Phạm Thanh Mai', avatar: 'PM' },
    ],
    20: [
        { id: 'T5', name: 'Đà Nẵng - Hội An', code: 'DN-HA-05', status: 'ok', currentGuide: 'Hoàng Văn Tuấn', avatar: 'HT' },
        { id: 'T6', name: 'Sapa Misty Peaks', code: 'SP-MP-03', status: 'ok', currentGuide: 'Lê Hoàng Hải', avatar: 'HH' },
    ]
};

const TourDispatch = () => {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTourForModal, setSelectedTourForModal] = useState(null);

    // Local state to track assignments
    const [tourAssignments, setTourAssignments] = useState(MOCK_TOURS_BY_DATE);

    // Dynamic calendar calculations
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const monthName = `Tháng ${month + 1}, ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

    const handlePrevMonth = () => {
        setCurrentMonthDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentMonthDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const handleToday = () => {
        setCurrentMonthDate(new Date());
        setSelectedDate(new Date().getDate());
    };

    // Generate calendar grid
    const renderCalendarDays = () => {
        const days = [];
        // Empty cells before start of month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayDisabled}`}></div>);
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        // Days of month
        for (let d = 1; d <= daysInMonth; d++) {
            const hasTours = tourAssignments[d] && tourAssignments[d].length > 0;
            const isToday = isCurrentMonth && d === today.getDate();
            const isActive = selectedDate === d;

            days.push(
                <div
                    key={`day-${d}`}
                    className={`${styles.dayCell} ${isToday ? styles.dayToday : ''} ${isActive ? styles.dayCellActive : ''}`}
                    onClick={() => setSelectedDate(d)}
                >
                    <span className={styles.dayNumber}>{d}</span>
                    {hasTours && (
                        <div className={styles.tourDots}>
                            {tourAssignments[d].map((t, idx) => (
                                <div key={idx} className={styles.tourBadge} style={{
                                    backgroundColor: t.status === 'issue' ? '#fef2f2' : '#ecfdf5',
                                    color: t.status === 'issue' ? '#ef4444' : '#065f46',
                                    border: t.status === 'issue' ? '1px solid #fecaca' : 'none'
                                }}>
                                    {t.name.split(' ')[1]} {t.name.split(' ')[2]}...
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const handleOpenAssignModal = (tour) => {
        setSelectedTourForModal({
            id: tour.id,
            name: tour.name,
            date: `${selectedDate}/05/2026`,
            currentGuide: tour.currentGuide
        });
        setIsModalOpen(true);
    };

    const handleAssignGuide = (tourId, newGuideName) => {
        // Update the state to reflect the new guide
        const updatedTours = { ...tourAssignments };
        const dayTours = updatedTours[selectedDate];

        const tourIndex = dayTours.findIndex(t => t.id === tourId);
        if (tourIndex !== -1) {
            dayTours[tourIndex] = {
                ...dayTours[tourIndex],
                currentGuide: newGuideName,
                avatar: newGuideName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                status: 'ok' // Reset status to ok after reassignment
            };
        }

        setTourAssignments(updatedTours);
    };

    const selectedDayTours = selectedDate ? tourAssignments[selectedDate] || [] : [];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Điều Hành Tour Tháng</h1>
                    <p className={styles.pageSubtitle}>Theo dõi lịch trình và giám sát việc phân công hướng dẫn viên.</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.viewToggle}>
                        <button className={`${styles.toggleBtn} ${styles.toggleActive}`}>Lịch</button>
                        <button className={styles.toggleBtn}>Danh sách</button>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Calendar View */}
                <div className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                        <h2 className={styles.currentMonth}>{monthName}</h2>
                        <div className={styles.monthNav}>
                            <button className={styles.navBtn} onClick={handlePrevMonth}><span className="material-icons-round">chevron_left</span></button>
                            <button className={styles.navBtn} onClick={handleToday}>Hôm nay</button>
                            <button className={styles.navBtn} onClick={handleNextMonth}><span className="material-icons-round">chevron_right</span></button>
                        </div>
                    </div>

                    <div className={styles.weekDays}>
                        <div className={styles.weekDay}>CN</div>
                        <div className={styles.weekDay}>T2</div>
                        <div className={styles.weekDay}>T3</div>
                        <div className={styles.weekDay}>T4</div>
                        <div className={styles.weekDay}>T5</div>
                        <div className={styles.weekDay}>T6</div>
                        <div className={styles.weekDay}>T7</div>
                    </div>

                    <div className={styles.daysGrid}>
                        {renderCalendarDays()}
                    </div>
                </div>

                {/* Right Side Panel - Active Day Details */}
                {selectedDate && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h3 className={styles.panelTitle}>Tour ngày {selectedDate}/05</h3>
                                <p className={styles.panelSubtitle}>{selectedDayTours.length} tour khởi hành</p>
                            </div>
                            <button className={styles.closePanelBtn} onClick={() => setSelectedDate(null)}>
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className={styles.panelContent}>
                            {selectedDayTours.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className={`material-icons-round ${styles.emptyIcon}`}>event_busy</span>
                                    <p>Không có tour nào khởi hành vào ngày này.</p>
                                </div>
                            ) : (
                                selectedDayTours.map(tour => (
                                    <div key={tour.id} className={styles.tourCard} style={{ borderColor: tour.status === 'issue' ? '#fca5a5' : '#e5e7eb' }}>
                                        <div className={styles.tourCardHeader}>
                                            <div>
                                                <h4 className={styles.tourCardName}>{tour.name}</h4>
                                                <span className={styles.tourCardCode}>{tour.code}</span>
                                            </div>
                                            {tour.status === 'ok' ? (
                                                <span className={styles.statusOk} title="Đã phân công xong">
                                                    <span className="material-icons-round" style={{ fontSize: '14px' }}>check_circle</span>
                                                    OK
                                                </span>
                                            ) : (
                                                <span className={styles.statusIssue} title="Cần điều phối lại">
                                                    <span className="material-icons-round" style={{ fontSize: '14px' }}>warning</span>
                                                    Sự cố
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.guideInfo}>
                                            <div className={styles.guideAvatar}>{tour.avatar}</div>
                                            <div className={styles.guideDetails}>
                                                <div className={styles.guideLabel}>Hướng dẫn viên (Auto-fill)</div>
                                                <div className={styles.guideName}>{tour.currentGuide}</div>
                                            </div>
                                        </div>

                                        <button
                                            className={styles.assignBtn}
                                            onClick={() => handleOpenAssignModal(tour)}
                                            style={{
                                                backgroundColor: tour.status === 'issue' ? '#ef4444' : 'white',
                                                color: tour.status === 'issue' ? 'white' : '#374151',
                                                borderColor: tour.status === 'issue' ? '#ef4444' : '#d1d5db'
                                            }}
                                        >
                                            {tour.status === 'issue' ? 'Điều phối khẩn cấp' : 'Đổi người / Điều phối lại'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <GuideAssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tour={selectedTourForModal}
                onAssign={handleAssignGuide}
            />
        </div>
    );
};

export default TourDispatch;
