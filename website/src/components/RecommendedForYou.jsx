import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, MapPin } from 'lucide-react';
import styles from './RecommendedForYou.module.css';

const RECOMMENDED_TOURS = [
    { id: 1, title: 'Bangkok – Pattaya', location: 'Thái Lan', duration: '5N4Đ', price: 8999000, image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?w=400&q=80', reason: 'Phù hợp lịch sử tìm kiếm "tour biển"' },
    { id: 4, title: 'Suối Nước Nóng & Trek', location: 'Costa Rica', duration: '5N4Đ', price: 7200000, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', reason: 'Gợi ý từ mô hình dựa trên sở thích bền vững' },
    { id: 5, title: 'Đền Cổ & Ruộng Bậc Thang', location: 'Bali', duration: '6N5Đ', price: 5800000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80', reason: 'Tour văn hóa được đề xuất cho bạn' },
];

const RecommendedForYou = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Sparkles className={styles.headerIcon} />
                    <h2 className={styles.title}>Dành riêng cho bạn</h2>
                    <p className={styles.subtitle}>
                        Gợi ý tour từ mô hình đề xuất dựa trên lịch sử tìm kiếm và sở thích của bạn.
                    </p>
                </div>
                <div className={styles.grid}>
                    {RECOMMENDED_TOURS.map((tour) => (
                        <Link key={tour.id} to={`/tours/${tour.id}`} className={styles.card}>
                            <div className={styles.cardImageWrap}>
                                <img src={tour.image} alt="" className={styles.cardImage} />
                                <span className={styles.badge}>Đề xuất</span>
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{tour.title}</h3>
                                <p className={styles.cardMeta}>
                                    <MapPin className={styles.metaIcon} />
                                    {tour.location}
                                    <span className={styles.metaSep}>·</span>
                                    <Calendar className={styles.metaIcon} />
                                    {tour.duration}
                                </p>
                                <p className={styles.cardReason}>{tour.reason}</p>
                                <p className={styles.cardPrice}>{tour.price.toLocaleString('vi-VN')} VND</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecommendedForYou;
