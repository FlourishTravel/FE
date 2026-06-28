import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { getDestination } from '../../api/destinations';
import { resolveMediaUrl } from '../../api/config';
import styles from './Destinations.module.css';

const PLACEHOLDER =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

const DestinationDetail = () => {
    const { slug } = useParams();
    const [dest, setDest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getDestination(slug);
                if (alive) setDest(data);
            } catch (e) {
                if (alive) {
                    setDest(null);
                    setError(e.message || 'Không tải được điểm đến.');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container}><p className={styles.subtitle}>Đang tải...</p></div>
            </div>
        );
    }

    if (error || !dest) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container}>
                    <p className={styles.subtitle}>{error || 'Không tìm thấy điểm đến.'}</p>
                    <Link to="/destinations">← Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    const hero = resolveMediaUrl(dest.heroImageUrl) || PLACEHOLDER;
    const duration =
        dest.idealDaysMin && dest.idealDaysMax
            ? `${dest.idealDaysMin}–${dest.idealDaysMax} ngày`
            : dest.idealDaysMin
                ? `${dest.idealDaysMin} ngày`
                : 'Linh hoạt';

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.hero} style={{ textAlign: 'left', marginBottom: 24 }}>
                    <img src={hero} alt={dest.name} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }} />
                    <h1 className={styles.title}>{dest.name}</h1>
                    {dest.locationLabel && (
                        <p className={styles.subtitle}><MapPin size={16} style={{ display: 'inline' }} /> {dest.locationLabel}</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, color: '#6b7280' }}>
                        <span><Calendar size={16} style={{ display: 'inline' }} /> {duration}</span>
                        {dest.bestTimeLabel && <span>Thời điểm: {dest.bestTimeLabel}</span>}
                        {dest.rating != null && (
                            <span><Star size={16} fill="#f59e0b" color="#f59e0b" style={{ display: 'inline' }} /> {dest.rating}</span>
                        )}
                    </div>
                </div>

                {dest.summary && <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: 16 }}>{dest.summary}</p>}
                {dest.description && <p style={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{dest.description}</p>}

                {dest.suggestedTours?.length > 0 && (
                    <section style={{ marginTop: 40 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Tour gợi ý</h2>
                        <div className={styles.grid}>
                            {dest.suggestedTours.map((t) => (
                                <Link key={t.id} to={`/tours/${t.id}`} className={styles.cardLink}>
                                    <div className={styles.card}>
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.cardTitle}>{t.title || t.name}</h3>
                                            <span className={styles.metaItem}>Xem chi tiết <ArrowRight size={14} /></span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div style={{ marginTop: 32 }}>
                    <Link to={`/tours?destination=${encodeURIComponent(dest.slug || dest.name)}`} className={styles.cardLink}>
                        Xem tất cả tour tại {dest.name} →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;
