import React from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import styles from './Guide.module.css';

const GUIDE_ARTICLES = [
    {
        id: 1,
        title: 'Chuẩn bị vali cho tour trải nghiệm 5–7 ngày',
        excerpt: 'Mách bạn cách sắp xếp đồ gọn nhẹ, đồ dùng cần thiết và những món không nên mang khi đi tour nhóm.',
        readTime: '5 phút',
        category: 'Chuẩn bị',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        title: 'Du lịch bền vững: Ý nghĩa và cách thực hành',
        excerpt: 'Hiểu về du lịch có trách nhiệm, tôn trọng văn hóa bản địa và giảm tác động môi trường khi đi tour.',
        readTime: '7 phút',
        category: 'Bền vững',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        title: 'Ăn gì, ngủ đâu khi đi tour Thái Lan lần đầu',
        excerpt: 'Gợi ý món ăn đường phố, homestay và khách sạn phù hợp túi tiền cho hành trình Bangkok – Pattaya.',
        readTime: '6 phút',
        category: 'Điểm đến',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 4,
        title: 'Làm quen bạn đồng hành trong tour nhóm nhỏ',
        excerpt: 'Cách hòa nhập nhanh, tôn trọng không gian riêng và tạo kỷ niệm đáng nhớ với đoàn.',
        readTime: '4 phút',
        category: 'Trải nghiệm',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 5,
        title: 'Visa và giấy tờ cần thiết cho tour Campuchia',
        excerpt: 'Hướng dẫn làm e-Visa, thời hạn passport và lưu ý khi nhập cảnh Siem Reap, Phnom Penh.',
        readTime: '5 phút',
        category: 'Thủ tục',
        image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 6,
        title: 'Chọn tour phù hợp với phong cách của bạn',
        excerpt: 'Tour bền vững, tour văn hóa hay tour khám phá – cách nhận diện và lựa chọn đúng nhu cầu.',
        readTime: '6 phút',
        category: 'Gợi ý',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    },
];

const Guide = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Cẩm nang</h1>
                    <p className={styles.subtitle}>
                        Mẹo chuẩn bị, thủ tục và kinh nghiệm du lịch trải nghiệm do đội ngũ Flourish biên soạn.
                    </p>
                </div>

                <div className={styles.grid}>
                    {GUIDE_ARTICLES.map((article) => (
                        <article key={article.id} className={styles.card}>
                            <div className={styles.cardImageWrap}>
                                <img
                                    src={article.image}
                                    alt=""
                                    className={styles.cardImage}
                                />
                                <span className={styles.category}>{article.category}</span>
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>{article.title}</h2>
                                <p className={styles.cardExcerpt}>{article.excerpt}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.readTime}>
                                        <Clock className={styles.clockIcon} />
                                        {article.readTime}
                                    </span>
                                    <span className={styles.readMore}>
                                        Đọc tiếp
                                        <ArrowRight className={styles.arrowIcon} />
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Guide;
