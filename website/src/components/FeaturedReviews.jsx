import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { listFeaturedReviews } from '../api/reviews';
import styles from './FeaturedReviews.module.css';

const FeaturedReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await listFeaturedReviews(6);
        if (alive) setReviews(rows);
      } catch {
        if (alive) setReviews([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Khách nói gì về Flourish</h2>
        <p className={styles.subtitle}>Đánh giá thật từ những chuyến đi đã hoàn thành</p>
        <div className={styles.grid}>
          {reviews.map((r) => (
            <article key={r.id} className={styles.card}>
              <Quote className={styles.quoteIcon} size={20} />
              <p className={styles.comment}>{r.comment || 'Trải nghiệm tuyệt vời!'}</p>
              <div className={styles.footer}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (r.rating || 5) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className={styles.author}>{r.userName || 'Khách Flourish'}</span>
                {r.tourTitle && <span className={styles.tour}>{r.tourTitle}</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedReviews;
