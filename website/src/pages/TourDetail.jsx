import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    MapPin, Star, Clock, Users, Sun, Globe, ChevronRight,
    Calendar, ChevronDown, Map, CheckCircle, Layers, Image, X
} from 'lucide-react';
import bangkokImgNew from '../assets/di-chuyen-di-lai-thai-lan-2.webp';
import bangkokImg2 from '../assets/366426-tour-thai-lan-5n4d-bangkok-pattaya.jpg';
import pattayaImg from '../assets/pattaya.png';
import styles from './TourDetail.module.css';

const TOUR_DATA = {
    1: {
        title: 'BANGKOK - PATAYA',
        breadcrumb: ['Trang chủ', 'Thái Lan', 'Bangkok - Pattaya'],
        location: 'Bangkok - Pattaya, Thái Lan',
        rating: 4.8,
        reviewCount: 345,
        tags: ['Tour Bán Chạy', 'Năng Động', 'Ẩm Thực'],
        price: 299,
        discountPercent: 10,
        images: {
            main: bangkokImgNew,
            secondary: [
                bangkokImg2,
                pattayaImg,
            ],
        },
        overview: 'Hành trình 5 ngày 4 đêm chữa lành chậm rãi giữa lòng Thái Lan. Từ thành phố biển Pattaya thư giãn đến thủ đô Bangkok tráng lệ. Khám phá những quán cafe cực chill ngắm hoàng hôn, trải nghiệm thưởng thức hải sản trên đảo Coral, dành thời gian thong thả ngắm Wat Arun, và lang thang giữa không gian nghệ thuật đương đại tĩnh lặng tại MOCA. Một chuyến đi không vội vã, để bạn thực sự tận hưởng từng khoảnh khắc.',
        highlights: [
            { icon: 'clock', label: 'Thời gian', value: '5 Ngày / 4 Đêm' },
            { icon: 'users', label: 'Quy mô nhóm', value: 'Tối đa 20 người' },
            { icon: 'sun', label: 'Thời điểm tốt', value: 'Quanh năm' },
            { icon: 'globe', label: 'Ngôn ngữ', value: 'Tiếng Việt, Tiếng Anh' },
        ],
        itinerary: [
            {
                day: 1,
                title: 'TP.HCM – BANGKOK – PATTAYA (Ăn Tối)',
                location: 'TP.HCM - Bangkok - Pattaya',
                description: [
                    'Trưa: Đáp chuyến bay đến Bangkok, xe đón đoàn đi thẳng về Pattaya.',
                    'Chiều: Check-in khách sạn, sau đó đi thẳng đến The Sky Gallery hoặc Tutu Beach.',
                    'Trải nghiệm: Ngồi ghế lười ngắm hoàng hôn, uống một ly nước dừa mát lạnh và nghe tiếng sóng. Không vội vã, không check-in vội.',
                    'Tối: Tự do dạo bộ ngắm phố phường hoặc trải nghiệm massage chân kiểu Thái để hồi phục năng lượng.',
                ],
            },
            {
                day: 2,
                title: 'ĐẢO CORAL – VỀ LẠI BANGKOK "CHILL" ĐÊM (Ăn Sáng, Trưa)',
                location: 'Pattaya - Đảo Coral - Bangkok',
                description: [
                    'Sáng: Đi cano ra đảo Coral. Thay vì chơi tất cả các trò chơi, hãy dành thời gian nằm dưới tán cây đọc sách hoặc bơi lội tự do.',
                    'Trưa: Ăn trưa hải sản tươi sống ngay tại đảo.',
                    'Chiều: Về lại đất liền, di chuyển về Bangkok.',
                    'Tối: Check-in khách sạn. Buổi tối không có lịch trình cố định. Đoàn có thể tự do dạo quanh khu vực khách sạn hoặc ghé một quán Rooftop Bar nhẹ nhàng để ngắm nhìn ánh đèn thành phố từ xa.',
                ],
            },
            {
                day: 3,
                title: 'CHẬM RÃI GIỮA LÒNG BANGKOK (Ăn Sáng, Trưa)',
                location: 'Bangkok',
                description: [
                    'Sáng: Tham quan Wat Arun. Chỉ tập trung duy nhất vào điểm này để khách có đủ 2-3 tiếng thong thả chụp ảnh với cổ phục mà không lo bị giục lên xe.',
                    'Trưa: Ăn trưa món Thái tại một nhà hàng ven sông.',
                    'Chiều: Ghé The Commons (Thonglor). Đây là không gian mở cực chill với nhiều quán cafe specialty và cộng đồng nghệ thuật. Khách có thể ngồi đây cả buổi chiều để quan sát nhịp sống của giới trẻ thượng lưu Bangkok.',
                    'Tối: Ghé Chợ đêm Jodd Fairs chỉ để ăn uống và nghe nhạc sống, không áp lực mua sắm.',
                ],
            },
            {
                day: 4,
                title: 'NGHỆ THUẬT & TẦM NHÌN (Ăn Sáng, Trưa)',
                location: 'Bangkok',
                description: [
                    'Sáng: Dành trọn buổi sáng tại MOCA (Bảo tàng Nghệ thuật Đương đại). Không gian yên tĩnh, máy lạnh mát rượi và những tác phẩm nghệ thuật sẽ giúp khách "chữa lành" tâm hồn.',
                    'Chiều: Lên sàn kính Mahanakhon Skywalk. Chúng ta sẽ đến đây vào lúc 16:30 để đón cả khoảnh khắc hoàng hôn lẫn lúc thành phố lên đèn.',
                    'Tối: Tự do khám phá ẩm thực đường phố tại khu vực Siam hoặc Pratunam.',
                ],
            },
            {
                day: 5,
                title: 'TẠM BIỆT THÁI LAN (Ăn Sáng)',
                location: 'Bangkok - TP.HCM',
                description: [
                    'Sáng: Một buổi sáng hoàn toàn tự do. Khách có thể ngủ nướng, đi dạo công viên Lumpini hoặc ghé tiệm cafe yêu thích gần khách sạn.',
                    'Trưa: Xe đưa đoàn ra sân bay làm thủ tục về lại TP.HCM.',
                ],
            },
        ],
        included: [
            '4 đêm lưu trú tại khách sạn 4 sao (Bangkok & Pattaya)',
            'Vé máy bay khứ hồi (gồm hành lý ký gửi)',
            'Các bữa ăn theo chương trình (5 bữa sáng, 4 bữa trưa, 1 bữa tối)',
            'Vé tham quan MOCA, Mahanakhon Skywalk, Wat Arun & Đảo Coral',
            'Hướng dẫn viên suốt tuyến, trẻ trung, kinh nghiệm, trendy, nhiệt tình,....',
            'Bảo hiểm du lịch quốc tế',
            'Có xe đoàn đưa đón',
            'Trợ lí AI Assistant không lo lạc lối',
        ],
    },
    99: {
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [showFullItinerary, setShowFullItinerary] = useState(false);

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
                        <img
                            src={tour.images.main}
                            alt={tour.title}
                            className={styles.galleryImage}
                            onClick={() => setSelectedImage(tour.images.main)}
                        />
                    </div>
                    <div className={styles.gallerySide}>
                        {tour.images.secondary.map((img, idx) => (
                            <div key={idx} className={styles.gallerySideItem}>
                                <img
                                    src={img}
                                    alt={`${tour.title} ${idx + 2}`}
                                    className={styles.galleryImage}
                                    onClick={() => setSelectedImage(img)}
                                />
                                {idx === 1 && (
                                    <button className={styles.viewAllBtn} onClick={() => setSelectedImage(tour.images.main)}>
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
                                {(showFullItinerary ? tour.itinerary : tour.itinerary.slice(0, 3)).map((day, idx, arr) => (
                                    <div key={idx} className={styles.timelineItem}>
                                        <div className={styles.timelineLine}>
                                            <div className={styles.timelineDot}>
                                                D{day.day}
                                            </div>
                                            {idx < arr.length - 1 && (
                                                <div className={styles.timelineConnector}></div>
                                            )}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <h3 className={styles.dayTitle}>{day.title}</h3>
                                            <span className={styles.dayLocation}>
                                                <MapPin className={styles.dayLocationIcon} />
                                                {day.location}
                                            </span>
                                            <ul className={styles.dayDescList}>
                                                {Array.isArray(day.description) ? (
                                                    day.description.map((item, i) => {
                                                        const parts = item.split(': ');
                                                        return (
                                                            <li key={i} className={styles.dayDescItem}>
                                                                {parts.length > 1 ? (
                                                                    <>
                                                                        <strong>{parts[0]}: </strong>
                                                                        {parts.slice(1).join(': ')}
                                                                    </>
                                                                ) : (
                                                                    item
                                                                )}
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    <li className={styles.dayDescItem}>{day.description}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {tour.itinerary.length > 3 && (
                                <button
                                    className={styles.viewFullBtn}
                                    onClick={() => setShowFullItinerary(!showFullItinerary)}
                                >
                                    {showFullItinerary ? 'Thu gọn lịch trình ↑' : 'Xem toàn bộ lịch trình ↓'}
                                </button>
                            )}
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

                {/* Image Modal */}
                {selectedImage && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeModalBtn} onClick={() => setSelectedImage(null)}>
                                <X className={styles.closeIcon} />
                            </button>
                            <img src={selectedImage} alt="Phóng to" className={styles.modalImage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TourDetail;
