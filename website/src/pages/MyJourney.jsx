import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass, Calendar, ChevronRight, MessageCircle } from 'lucide-react';
import styles from './MyJourney.module.css';

const MOCK_BOOKINGS = [
    {
        id: 1,
        tourTitle: 'Bangkok – Pattaya: Thư giãn & Văn hóa',
        startDate: '15/04/2025',
        endDate: '19/04/2025',
        status: 'Đã xác nhận',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=400&q=80',
        tourId: 1,
        isUpcoming: true,
    },
    {
        id: 2,
        tourTitle: 'Siem Reap – Angkor Thom – Phnom Penh',
        startDate: '22/05/2025',
        endDate: '25/05/2025',
        status: 'Chờ thanh toán',
        image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?auto=format&fit=crop&w=400&q=80',
        tourId: 2,
        isUpcoming: true,
    },
    {
        id: 3,
        tourTitle: 'Hội An – Huế – Đà Nẵng',
        startDate: '10/12/2024',
        endDate: '16/12/2024',
        status: 'Đã hoàn thành',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80',
        tourId: 3,
        isUpcoming: false,
    },
];

const MyJourney = () => {
    const [tab, setTab] = useState('upcoming');
    const hasBookings = true;

    const upcoming = MOCK_BOOKINGS.filter((b) => b.isUpcoming);
    const past = MOCK_BOOKINGS.filter((b) => !b.isUpcoming);
    const list = tab === 'upcoming' ? upcoming : past;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Chuyến đi của tôi</h1>
                    <p className={styles.subtitle}>
                        Xem lại hành trình đã đặt, ngày khởi hành và thông tin chi tiết.
                    </p>
                </div>

                {hasBookings ? (
                    <>
                        <div className={styles.tabs}>
                            <button type="button" className={tab === 'upcoming' ? styles.tabActive : styles.tab} onClick={() => setTab('upcoming')}>
                                Sắp đi
                            </button>
                            <button type="button" className={tab === 'past' ? styles.tabActive : styles.tab} onClick={() => setTab('past')}>
                                Đã đi
                            </button>
                        </div>
                        <div className={styles.bookingList}>
                            {list.map((booking) => (
                                <div key={booking.id} className={styles.bookingCardWrap}>
                                    <Link to={`/tours/${booking.tourId}`} className={styles.bookingCard}>
                                        <img src={booking.image} alt="" className={styles.bookingImage} />
                                        <div className={styles.bookingContent}>
                                            <span className={styles.bookingStatus}>{booking.status}</span>
                                            <h2 className={styles.bookingTitle}>{booking.tourTitle}</h2>
                                            <p className={styles.bookingDates}>
                                                <Calendar className={styles.dateIcon} />
                                                {booking.startDate} – {booking.endDate}
                                            </p>
                                            <span className={styles.bookingLink}>
                                                Xem chi tiết <ChevronRight className={styles.chevron} />
                                            </span>
                                        </div>
                                    </Link>
                                    {booking.isUpcoming && (
                                        <Link to={`/chat/${booking.id}`} className={styles.chatBtn}>
                                            <MessageCircle className={styles.chatBtnIcon} />
                                            Vào phòng chat
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <MapPin className={styles.icon} />
                        </div>
                        <h2 className={styles.emptyTitle}>Bạn chưa có chuyến đi nào</h2>
                        <p className={styles.emptyText}>
                            Đăng nhập để xem các tour đã đặt, hoặc khám phá tour trải nghiệm và lên kế hoạch cho hành trình tiếp theo.
                        </p>
                        <div className={styles.actions}>
                            <Link to="/login" className={styles.primaryBtn}>
                                Đăng nhập
                            </Link>
                            <Link to="/tours" className={styles.secondaryBtn}>
                                <Compass className={styles.btnIcon} />
                                Khám phá tour
                            </Link>
                        </div>
                        <div className={styles.tip}>
                            <Calendar className={styles.tipIcon} />
                            <span>Sau khi đặt tour, mục này sẽ hiển thị lịch trình và hướng dẫn của bạn.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJourney;
