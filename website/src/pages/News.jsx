import React from 'react';
import { Calendar } from 'lucide-react';
import styles from './News.module.css';

const NEWS_ITEMS = [
    {
        id: 1,
        title: 'Flourish Tourism ra mắt chuỗi tour “Sống chậm” tại Thái Lan và Bali',
        date: '15/02/2025',
        excerpt: 'Các tour 5–7 ngày tập trung vào trải nghiệm địa phương, homestay và ẩm thực, hướng tới du khách muốn tạm rời nhịp sống nhanh.',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        title: 'Hợp tác với cộng đồng bản địa Costa Rica cho tour rừng nhiệt đới',
        date: '28/01/2025',
        excerpt: 'Flourish ký kết hợp tác với các hướng dẫn viên và gia đình địa phương tại Monteverde để mang đến trải nghiệm bền vững và chân thực.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        title: 'Thông báo chính sách hủy tour và hoàn tiền mới từ 01/03/2025',
        date: '10/01/2025',
        excerpt: 'Chính sách hủy tour và hoàn tiền được cập nhật để rõ ràng hơn, hỗ trợ khách trong trường hợp bất khả kháng.',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    },
];

const News = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tin tức & Báo chí</h1>
                <p className={styles.subtitle}>
                    Cập nhật về Flourish Tourism, tour mới, đối tác và các thông báo quan trọng.
                </p>
            </div>
            <div className={styles.container}>
                <div className={styles.newsList}>
                    {NEWS_ITEMS.map((item) => (
                        <article key={item.id} className={styles.newsCard}>
                            <img src={item.image} alt="" className={styles.newsImage} />
                            <div className={styles.newsContent}>
                                <span className={styles.newsDate}>
                                    <Calendar className={styles.dateIcon} />
                                    {item.date}
                                </span>
                                <h2 className={styles.newsTitle}>{item.title}</h2>
                                <p className={styles.newsExcerpt}>{item.excerpt}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;
