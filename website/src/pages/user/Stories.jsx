import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Quote } from 'lucide-react';
import styles from './Stories.module.css';

const STORIES = [
    {
        id: 1,
        author: 'Minh Anh',
        tour: 'Bangkok – Pattaya',
        quote: 'Lần đầu mình đi tour “sống chậm” như vậy. Không vội, được ăn uống cùng người dân và ngắm hoàng hôn trên biển. Cảm giác rất khác so với đi tự túc gấp gáp.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        author: 'Tuấn',
        tour: 'Rừng nhiệt đới Monteverde',
        quote: 'Ở trong nhà trên cây, sáng dậy nghe chim và đi bộ cùng hướng dẫn viên địa phương. Mình hiểu thêm về bảo tồn và du lịch có trách nhiệm.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        author: 'Hương',
        tour: 'Hội An – Huế – Đà Nẵng',
        quote: 'Road trip 7 ngày với nhóm nhỏ, vừa chill vừa học được nhiều về lịch sử và ẩm thực miền Trung. Team Flourish chu đáo từ khâu đặt tour đến khi kết thúc.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
    },
];

const Stories = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Câu chuyện từ hành trình</h1>
                <p className={styles.subtitle}>
                    Chia sẻ thật từ khách đã đi tour Flourish — trải nghiệm, cảm nhận và kỷ niệm.
                </p>
            </div>
            <div className={styles.container}>
                <div className={styles.storyGrid}>
                    {STORIES.map((story) => (
                        <article key={story.id} className={styles.storyCard}>
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
