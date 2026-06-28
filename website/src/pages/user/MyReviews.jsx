import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listMyReviews } from '../../api/reviews';
import styles from './UserAccount.module.css';

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
}

function renderStars(rating) {
    const n = Math.min(5, Math.max(0, Number(rating) || 0));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
}

const MyReviews = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return undefined;
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const rows = await listMyReviews();
                if (alive) setReviews(rows);
            } catch (e) {
                if (alive) {
                    setReviews([]);
                    setError(e.message || 'Không tải được đánh giá.');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [user]);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <Star size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Đánh giá của tôi
                    </h1>
                    <p className={styles.subtitle}>Các đánh giá bạn đã gửi sau chuyến đi.</p>
                </header>

                {loading && <p className={styles.state}>Đang tải...</p>}
                {error && <p className={`${styles.state} ${styles.stateError}`}>{error}</p>}

                {!loading && !error && reviews.length === 0 && (
                    <div className={styles.empty}>
                        <p>Bạn chưa có đánh giá nào.</p>
                        <Link to="/my-journey" className={styles.linkBtn}>
                            Xem chuyến đi <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {!loading && reviews.map((r) => (
                    <div key={r.id} className={styles.card}>
                        <div className={styles.cardTitle}>
                            {r.tourTitle || 'Tour'}
                            {r.tourId && (
                                <Link to={`/tours/${r.tourId}`} style={{ marginLeft: 8, fontSize: 13, fontWeight: 500 }}>
                                    Xem tour
                                </Link>
                            )}
                        </div>
                        <div className={styles.stars}>{renderStars(r.rating)}</div>
                        {r.comment && <p style={{ marginTop: 8, color: '#374151' }}>{r.comment}</p>}
                        <div className={styles.cardMeta} style={{ marginTop: 8 }}>
                            <span>{formatDate(r.createdAt)}</span>
                            <span className={r.isPublished ? styles.badge : `${styles.badge} ${styles.badgeMuted}`}>
                                {r.isPublished ? 'Đã hiển thị công khai' : 'Đang chờ duyệt'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyReviews;
