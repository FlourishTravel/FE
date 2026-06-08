import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Quote } from 'lucide-react';
import styles from './Stories.module.css';

const STORIES = [
    {
        id: 1,
        author: 'Minh Anh',
        tour: 'Bangkok – Pattaya',
        quote: 'Lần đầu mình đi tour “sống chậm” tại Thái Lan. Không hối hả mua sắm, được ăn uống như người bản địa và ngắm hoàng hôn vịnh Pattaya tuyệt đẹp. Một góc nhìn rất khác về Thái Lan.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        author: 'Tuấn',
        tour: 'Chiang Mai – Chiang Rai',
        quote: 'Trải nghiệm homestay trên đồi, sáng dậy đón mây, tham gia lớp nấu ăn Thái và thăm trại voi tự nhiên. Flourish đã mang đến một Bắc Thái Lan thật thanh bình và ý nghĩa.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1513568720593-cb092a9443c2?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        author: 'Hương',
        tour: 'Phuket – Đảo Phi Phi',
        quote: 'Chuyến đi biển đáng nhớ nhất từ trước đến nay. Lịch trình linh hoạt giúp nhóm mình vừa được lặn ngắm san hô riêng tư, vừa thưởng thức hải sản địa phương siêu ngon.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=600&q=80',
    },
];

const Stories = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <div className={styles.heroBackground}>
                    <img src="https://images.unsplash.com/photo-1558281050-0c36a0fb43c0?auto=format&fit=crop&w=1920&q=80" alt="Thailand sunset background" />
                </div>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Câu chuyện từ hành trình Thái Lan</h1>
                    <p className={styles.subtitle}>
                        Chia sẻ chân thực từ những vị khách đã đi tour Flourish — khám phá văn hóa, ẩm thực và vẻ đẹp xứ sở Chùa Vàng theo cách riêng biệt.
                    </p>
                </div>
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
                    <Link to="/tours" className={styles.ctaBtn}>Khám phá tour và viết nên câu chuyện Thái Lan của bạn</Link>
                </div>
            </div>
        </div>
    );
};

export default Stories;
