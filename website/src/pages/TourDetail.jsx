import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    MapPin, Star, Clock, Users, Sun, Globe, ChevronRight,
    Calendar, ChevronDown, Map, CheckCircle, Layers, Image
} from 'lucide-react';
import styles from './TourDetail.module.css';

const TOUR_DATA = {
    1: {
        title: 'Costa Rica - Trek Rừng Sinh Thái',
        breadcrumb: ['Trang chủ', 'Costa Rica', 'Trek Rừng Sinh Thái'],
        location: 'Arenal đến Monteverde, Costa Rica',
        rating: 4.9,
        reviewCount: 128,
        tags: ['Chứng nhận Bền vững', 'Vận động cao'],
        price: 1299,
        discountPercent: 15,
        images: {
            main: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
            secondary: [
                'https://images.unsplash.com/photo-1474511320723-9a56873571b7?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=600&q=80',
            ],
        },
        overview: 'Đắm mình trong sự đa dạng sinh học đảng kinh ngạc của Costa Rica. Chuyến trek bền vững 7 ngày sẽ đưa bạn đi khỏi lối mòn, từ suối nước nóng núi lửa Arenal đến rừng mây huyền bí của Monteverde. Kết nối với cộng đồng địa phương, quan sát động vật hoang dã quý hiếm và trải nghiệm bảo tồn thiên nhiên, tất cả trong khi giảm thiểu tác động môi trường.',
        highlights: [
            { icon: 'clock', label: 'Thời gian', value: '7 Ngày / 6 Đêm' },
            { icon: 'users', label: 'Quy mô nhóm', value: 'Tối đa 12 người' },
            { icon: 'sun', label: 'Thời điểm tốt', value: 'Tháng 12 - Tháng 4' },
            { icon: 'globe', label: 'Ngôn ngữ', value: 'Tiếng Anh, Tiếng Tây Ban Nha' },
        ],
        itinerary: [
            {
                day: 1,
                title: 'Đến San José & Tiệc Chào Mừng',
                location: 'San José, Costa Rica',
                description: 'Gặp hướng dẫn viên và các bạn đồng hành. Buổi tối học hỏi theo sau bởi bữa tối chào mừng với ẩm thực Costa Rica từ nông trại đến bàn ăn.',
            },
            {
                day: 2,
                title: 'Hành Trình Đến Arenal & Suối Nước Nóng',
                location: 'Vườn Quốc Gia Núi Lửa Arenal',
                description: 'Di chuyển bằng xe buýt sinh thái đến Arenal. Buổi chiều đi bộ quanh chân núi lửa tìm hiểu hệ sinh thái. Buổi tối thư giãn trong suối nước nóng địa nhiệt tự nhiên.',
            },
            {
                day: 3,
                title: 'Khu Bảo Tồn Lười & Trang Trại Hữu Cơ',
                location: 'Khu vực La Fortuna',
                description: 'Buổi sáng tham quan trung tâm bảo tồn lười. Buổi chiều trải nghiệm thực tế tại trang trại cà phê và cacao hữu cơ, hỗ trợ nông nghiệp bền vững địa phương.',
            },
        ],
        included: [
            '6 đêm lưu trú tại nhà nghỉ sinh thái',
            'Tất cả vé vào của và hoạt động đã liệt kê',
            'Tất cả bữa sáng, 4 bữa trưa, 3 bữa tối',
            'Bù đắp carbon cho tất cả phương tiện nội địa',
            'Hướng dẫn viên thiên nhiên chuyên gia',
            'Sử dụng trang bị trek chuyên dụng',
        ],
    },
};

// Fallback for any tour ID
const DEFAULT_TOUR = TOUR_DATA[1];

const TourDetail = () => {
    const { id } = useParams();
    const tour = TOUR_DATA[id] || DEFAULT_TOUR;

    const [selectedDate, setSelectedDate] = useState('18/11 – 24/11/2024');
    const [travelers, setTravelers] = useState(2);

    const totalPrice = tour.price * travelers;

    const getHighlightIcon = (iconName) => {
        switch (iconName) {
            case 'clock': return <Clock className={styles.highlightIconSvg} />;
            case 'users': return <Users className={styles.highlightIconSvg} />;
            case 'sun': return <Sun className={styles.highlightIconSvg} />;
            case 'globe': return <Globe className={styles.highlightIconSvg} />;
            default: return <Clock className={styles.highlightIconSvg} />;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                {/* Breadcrumb + Tags */}
                <div className={styles.topBar}>
                    <nav className={styles.breadcrumb}>
                        {tour.breadcrumb.map((item, idx) => (
                            <span key={idx} className={styles.breadcrumbItem}>
                                {idx > 0 && <ChevronRight className={styles.breadcrumbSep} />}
                                <span className={idx === tour.breadcrumb.length - 1 ? styles.breadcrumbActive : ''}>
                                    {item}
                                </span>
                            </span>
                        ))}
                    </nav>
                    <div className={styles.topTags}>
                        {tour.tags.map((tag, idx) => (
                            <span key={idx} className={styles.topTag}>
                                <CheckCircle className={styles.topTagIcon} />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Title Section */}
                <div className={styles.titleSection}>
                    <h1 className={styles.tourTitle}>{tour.title}</h1>
                    <div className={styles.titleMeta}>
                        <span className={styles.locationBadge}>
                            <MapPin className={styles.locationIconSmall} />
                            {tour.location}
                        </span>
                        <span className={styles.ratingBadge}>
                            <Star className={styles.starIcon} />
                            {tour.rating} ({tour.reviewCount} đánh giá)
                        </span>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className={styles.gallery}>
                    <div className={styles.galleryMain}>
                        <img src={tour.images.main} alt={tour.title} className={styles.galleryImage} />
                    </div>
                    <div className={styles.gallerySide}>
                        {tour.images.secondary.map((img, idx) => (
                            <div key={idx} className={styles.gallerySideItem}>
                                <img src={img} alt={`${tour.title} ${idx + 2}`} className={styles.galleryImage} />
                                {idx === 1 && (
                                    <button className={styles.viewAllBtn}>
                                        <Layers className={styles.viewAllIcon} />
                                        Xem tất cả ảnh
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two Column Body */}
                <div className={styles.bodyLayout}>
                    {/* Left: Main Info */}
                    <div className={styles.mainInfo}>
                        {/* Trip Overview */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Tổng Quan Chuyến Đi</h2>
                            <p className={styles.overviewText}>{tour.overview}</p>
                            <div className={styles.highlightsGrid}>
                                {tour.highlights.map((h, idx) => (
                                    <div key={idx} className={styles.highlightCard}>
                                        <div className={styles.highlightIconCircle}>
                                            {getHighlightIcon(h.icon)}
                                        </div>
                                        <div className={styles.highlightLabel}>{h.label}</div>
                                        <div className={styles.highlightValue}>{h.value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Detailed Itinerary */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Lịch Trình Chi Tiết</h2>
                            <div className={styles.timeline}>
                                {tour.itinerary.map((day, idx) => (
                                    <div key={idx} className={styles.timelineItem}>
                                        <div className={styles.timelineLine}>
                                            <div className={styles.timelineDot}>
                                                D{day.day}
                                            </div>
                                            {idx < tour.itinerary.length - 1 && (
                                                <div className={styles.timelineConnector}></div>
                                            )}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <h3 className={styles.dayTitle}>{day.title}</h3>
                                            <span className={styles.dayLocation}>
                                                <MapPin className={styles.dayLocationIcon} />
                                                {day.location}
                                            </span>
                                            <p className={styles.dayDesc}>{day.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.viewFullBtn}>
                                Xem toàn bộ lịch trình →
                            </button>
                        </section>

                        {/* What's Included */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitleGreen}>Bao Gồm</h2>
                            <div className={styles.includedGrid}>
                                {tour.included.map((item, idx) => (
                                    <div key={idx} className={styles.includedItem}>
                                        <CheckCircle className={styles.includedIcon} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right: Booking Widget */}
                    <div className={styles.stickyCol}>
                        {/* Booking Card */}
                        <div className={styles.bookingCard}>
                            <div className={styles.priceRow}>
                                <div>
                                    <span className={styles.fromLabel}>Từ</span>
                                    <div className={styles.priceMain}>
                                        <span className={styles.priceAmount}>${tour.price.toLocaleString()}</span>
                                        <span className={styles.pricePer}>/ người</span>
                                    </div>
                                </div>
                                {tour.discountPercent && (
                                    <span className={styles.saveBadge}>Tiết kiệm {tour.discountPercent}%</span>
                                )}
                            </div>

                            {/* Select Dates */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Chọn Ngày</label>
                                <div className={styles.fieldInput}>
                                    <Calendar className={styles.fieldIcon} />
                                    <input
                                        type="text"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={styles.fieldText}
                                        readOnly
                                    />
                                    <ChevronDown className={styles.fieldChevron} />
                                </div>
                            </div>

                            {/* Travelers */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Số Khách</label>
                                <div className={styles.fieldInput}>
                                    <Users className={styles.fieldIcon} />
                                    <select
                                        value={travelers}
                                        onChange={(e) => setTravelers(Number(e.target.value))}
                                        className={styles.fieldText}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <option key={n} value={n}>{n} Người lớn</option>
                                        ))}
                                    </select>
                                    <ChevronDown className={styles.fieldChevron} />
                                </div>
                            </div>

                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Tổng giá</span>
                                <span className={styles.totalAmount}>${totalPrice.toLocaleString()}</span>
                            </div>

                            <button className={styles.bookNowBtn}>
                                Đặt Ngay
                            </button>
                            <p className={styles.bookNote}>Không cần thanh toán để giữ chỗ của bạn.</p>
                        </div>

                        {/* Tour Route Map */}
                        <div className={styles.mapCard}>
                            <h3 className={styles.mapTitle}>
                                <Map className={styles.mapTitleIcon} />
                                Tuyến Đường Tour
                            </h3>
                            <div className={styles.mapPlaceholder}>
                                <Map className={styles.mapIcon} />
                                <span className={styles.mapText}>Bản đồ tương tác (sẽ cập nhật)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourDetail;
