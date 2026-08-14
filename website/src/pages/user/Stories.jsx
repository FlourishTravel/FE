import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Quote } from 'lucide-react';
import styles from './Stories.module.css';
import { useSiteContent } from '../../hooks/useSiteContent';

const Stories = () => {
    const { items: raw, loading } = useSiteContent('story');
    const stories = raw.map((item) => ({
        id: item.id,
        slug: item.slug,
        author: item.category || 'Khách Flourish',
        tour: item.title,
        quote: item.body || item.excerpt,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        image: item.image,
    }));

    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Câu chuyện từ hành trình</h1>
                <p className={styles.subtitle}>
                    Chia sẻ thật từ khách đã đi tour Flourish — trải nghiệm, cảm nhận và kỷ niệm.
                </p>
            </div>
            <div className={styles.container}>
                {loading && <p>Đang tải...</p>}
                {!loading && stories.length === 0 && (
                    <p>Chưa có câu chuyện. Bài đã đăng ở Admin → Nội dung → Câu chuyện sẽ hiện tại đây.</p>
                )}
                <div className={styles.storyGrid}>
                    {stories.map((story) => (
                        <article key={story.id} className={styles.storyCard}>
                            {story.slug ? (
                                <Link to={`/content/${story.slug}`} className={styles.storyCardLink}>
                                    <img src={story.image} alt="" className={styles.storyImage} />
                                    <div className={styles.storyContent}>
                                        <Quote className={styles.quoteIcon} />
                                        <p className={styles.quote}>{story.quote}</p>
                                        <div className={styles.authorRow}>
                                            <img src={story.avatar} alt="" className={styles.avatar} />
                                            <div>
                                                <span className={styles.authorName}>{story.author}</span>
                                                <span className={styles.tourName}>
                                                    <MapPin className={styles.tourIcon} />
                                                    {story.tour}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <>
                                    <img src={story.image} alt="" className={styles.storyImage} />
                                    <div className={styles.storyContent}>
                                        <Quote className={styles.quoteIcon} />
                                        <p className={styles.quote}>{story.quote}</p>
                                        <div className={styles.authorRow}>
                                            <img src={story.avatar} alt="" className={styles.avatar} />
                                            <div>
                                                <span className={styles.authorName}>{story.author}</span>
                                                <span className={styles.tourName}>
                                                    <MapPin className={styles.tourIcon} />
                                                    {story.tour}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
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
