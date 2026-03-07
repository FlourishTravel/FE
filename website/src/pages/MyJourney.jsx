import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass, Calendar, ChevronRight } from 'lucide-react';
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
    },
    {
        id: 2,
        tourTitle: 'Siem Reap – Angkor Thom – Phnom Penh',
        startDate: '22/05/2025',
        endDate: '25/05/2025',
        status: 'Chờ thanh toán',
        image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?auto=format&fit=crop&w=400&q=80',
        tourId: 2,
    },
];

const MyJourney = () => {
    const hasBookings = true; // Data cứng: hiển thị 2 chuyến mẫu (đổi false khi gắn API)

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
                    <div className={styles.bookingList}>
                        {MOCK_BOOKINGS.map((booking) => (
                            <Link
                                key={booking.id}
                                to={`/tours/${booking.tourId}`}
                                className={styles.bookingCard}
                            >
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
                        ))}
                    </div>
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
