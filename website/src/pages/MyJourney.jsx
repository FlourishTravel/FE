import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Users, CheckCircle, Eye,
    Trash2, Luggage, ArrowRight, MessageCircle
} from 'lucide-react';
import bangkokImg from '../assets/di-chuyen-di-lai-thai-lan-2.webp';
import styles from './MyJourney.module.css';

const MyJourney = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('flourish_bookings') || '[]');
        // Sort by most recent first
        saved.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
        setBookings(saved);
    }, []);

    const handleDelete = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        navigate('/cancellation-policy', { state: { booking } });
    };

    const formatDate = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getImage = (booking) => {
        if (booking.tourImage && booking.tourImage.startsWith('http')) {
            return booking.tourImage;
        }
        // Fallback to local image
        return bangkokImg;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.pageTitle}>Chỗ Đã Đặt</h1>
                        <p className={styles.pageSubtitle}>Quản lý các tour du lịch bạn đã đặt</p>
                    </div>
                    {bookings.length > 0 && (
                        <span className={styles.bookingCount}>
                            {bookings.length} đặt chỗ
                        </span>
                    )}
                </div>

                {/* Booking List */}
                {bookings.length > 0 ? (
                    <div className={styles.bookingList}>
                        {bookings.map((booking, idx) => (
                            <div
                                key={booking.id}
                                className={styles.bookingCard}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <img
                                    src={getImage(booking)}
                                    alt={booking.tourTitle}
                                    className={styles.cardImage}
                                />
                                <div className={styles.cardBody}>
                                    <div>
                                        <div className={styles.cardTop}>
                                            <div>
                                                <h3 className={styles.tourTitle}>{booking.tourTitle}</h3>
                                                <span className={styles.tourLocation}>
                                                    <MapPin className={styles.locationIcon} />
                                                    {booking.tourLocation}
                                                </span>
                                            </div>
                                            <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
                                                <CheckCircle className={styles.statusIcon} />
                                                Đã xác nhận
                                            </span>
                                        </div>

                                        <div className={styles.cardMeta}>
                                            <span className={styles.metaItem}>
                                                <Calendar className={styles.metaIcon} />
                                                {booking.date}
                                            </span>
                                            <span className={styles.metaItem}>
                                                <Users className={styles.metaIcon} />
                                                {booking.travelers} người lớn
                                            </span>
                                            {booking.tourDuration && (
                                                <span className={styles.metaItem}>
                                                    <Luggage className={styles.metaIcon} />
                                                    {booking.tourDuration}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.cardBottom}>
                                        <div className={styles.priceArea}>
                                            <span className={styles.priceLabel}>Tổng thanh toán</span>
                                            <span className={styles.priceValue}>
                                                {booking.totalPrice.toLocaleString('de-DE')} VND
                                            </span>
                                            <span className={styles.bookedDate}>
                                                Đặt ngày {formatDate(booking.bookedAt)}
                                            </span>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <Link
                                                to={`/chat/${booking.id}`}
                                                className={styles.btnChat}
                                            >
                                                <MessageCircle className={styles.btnChatIcon} />
                                                Vào phòng chat
                                            </Link>
                                            <Link
                                                to={`/tours/${booking.tourId}`}
                                                className={styles.btnViewTour}
                                            >
                                                <Eye className={styles.btnViewIcon} />
                                                Xem tour
                                            </Link>
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => handleDelete(booking.id)}
                                            >
                                                <Trash2 style={{ width: 15, height: 15 }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconCircle}>
                            <Luggage className={styles.emptyIcon} />
                        </div>
                        <h2 className={styles.emptyTitle}>Chưa có đặt chỗ nào</h2>
                        <p className={styles.emptyText}>
                            Bạn chưa đặt tour nào. Hãy khám phá các tour hấp dẫn và bắt đầu chuyến hành trình của bạn!
                        </p>
                        <Link to="/tours" className={styles.emptyBtn}>
                            Khám phá tour
                            <ArrowRight style={{ width: 18, height: 18 }} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyJourney;
