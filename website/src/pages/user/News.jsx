import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import styles from './News.module.css';
import { useSiteContent } from '../../hooks/useSiteContent';

const NEWS_FALLBACK = [
    {
        id: 1,
        title: 'Flourish Tourism ra mắt chuỗi tour "Sống chậm" tại Thái Lan và Bali',
        date: '15/02/2025',
        excerpt: 'Các tour 5–7 ngày tập trung vào trải nghiệm địa phương, homestay và ẩm thực.',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
    },
];

const News = () => {
    const { items, loading } = useSiteContent('news', NEWS_FALLBACK);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tin tức & Báo chí</h1>
                <p className={styles.subtitle}>
                    Cập nhật về Flourish Tourism, tour mới, đối tác và các thông báo quan trọng.
                </p>
            </div>
            <div className={styles.container}>
                {loading && <p className={styles.loading}>Đang tải tin tức...</p>}
                <div className={styles.newsList}>
                    {items.map((item) => (
                        <article key={item.id} className={styles.newsCard}>
                            {item.slug ? (
                                <Link to={`/content/${item.slug}`} className={styles.newsCardLink}>
                                    <img src={item.image} alt="" className={styles.newsImage} />
                                    <div className={styles.newsContent}>
                                        <span className={styles.newsDate}>
                                            <Calendar className={styles.dateIcon} />
                                            {item.date || '—'}
                                        </span>
                                        <h2 className={styles.newsTitle}>{item.title}</h2>
                                        <p className={styles.newsExcerpt}>{item.excerpt}</p>
                                        <span className={styles.readMore}>Đọc thêm <ArrowRight size={14} /></span>
                                    </div>
                                </Link>
                            ) : (
                                <>
                                    <img src={item.image} alt="" className={styles.newsImage} />
                                    <div className={styles.newsContent}>
                                        <span className={styles.newsDate}>
                                            <Calendar className={styles.dateIcon} />
                                            {item.date || '—'}
                                        </span>
                                        <h2 className={styles.newsTitle}>{item.title}</h2>
                                        <p className={styles.newsExcerpt}>{item.excerpt}</p>
                                    </div>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;
