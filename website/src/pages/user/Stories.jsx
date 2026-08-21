import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Eye } from 'lucide-react';
import styles from './Stories.module.css';
import { useSiteContent } from '../../hooks/useSiteContent';

function getFakeViews(item) {
    if (!item) return '1.850';
    if (item.views != null && item.views > 0) {
        return item.views.toLocaleString('vi-VN');
    }
    const str = String(item.id || item.slug || item.title || '1');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 37 + str.charCodeAt(i)) % 10000;
    }
    const views = 1420 + (Math.abs(hash) % 4200);
    return views.toLocaleString('vi-VN');
}

const Stories = () => {
    const { items, loading } = useSiteContent('story');

    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Câu chuyện & Góc nhìn</h1>
                <p className={styles.subtitle}>
                    Câu chuyện thương hiệu, góc nhìn về du lịch và hành trình của Flourish Tourism.
                </p>
            </div>
            <div className={styles.container}>
                {loading && <p>Đang tải...</p>}
                {!loading && items.length === 0 && (
                    <p>Chưa có câu chuyện. Bài đã đăng ở Admin → Nội dung → Câu chuyện sẽ hiện tại đây.</p>
                )}
                <div className={styles.storyGrid}>
                    {items.map((item) => (
                        <article key={item.id} className={styles.storyCard}>
                            <Link to={item.slug ? `/content/${item.slug}` : '#'} className={styles.storyCardLink}>
                                <img src={item.image} alt={item.title} className={styles.storyImage} />
                                <div className={styles.storyContent}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                                        {item.category ? (
                                            <span className={styles.authorName} style={{ display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                                                <MapPin size={13} />
                                                {item.category}
                                            </span>
                                        ) : <span />}
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                                            <Eye size={13} />
                                            {getFakeViews(item)} lượt xem
                                        </span>
                                    </div>
                                    <h2 className={styles.quote} style={{ fontStyle: 'normal', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                        {item.title}
                                    </h2>
                                    {item.excerpt && (
                                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>
                                            {item.excerpt.length > 120 ? item.excerpt.slice(0, 120) + '…' : item.excerpt}
                                        </p>
                                    )}
                                    <span className={styles.tourName} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 600, fontSize: 13 }}>
                                        Đọc thêm <ArrowRight size={13} />
                                    </span>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
                <div className={styles.cta}>
                    <Link to="/tours" className={styles.ctaBtn}>Khám phá tour và viết câu chuyện của bạn</Link>
                </div>
            </div>
        </div>
    );
};

export default Stories;
