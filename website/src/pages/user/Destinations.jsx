import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import styles from './Destinations.module.css';
import { listDestinations } from '../../api/destinations';
import { resolveMediaUrl } from '../../api/config';

const FALLBACK_DESTINATIONS = [
    {
        id: 1,
        title: 'Bangkok – Pattaya',
        country: 'Thái Lan',
        duration: '5 ngày 4 đêm',
        description: 'Thành phố biển thư giãn, đền chùa lộng lẫy và ẩm thực đường phố đỉnh cao.',
        image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=800&q=80',
        tourId: 1,
    },
    {
        id: 2,
        title: 'Siem Reap – Angkor Thom – Phnom Penh',
        country: 'Campuchia',
        duration: '4 ngày 3 đêm',
        description: 'Hành trình khám phá đế chế Khmer, đền Angkor Wat và thủ đô sông nước.',
        image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?auto=format&fit=crop&w=800&q=80',
        tourId: 2,
    },
    {
        id: 3,
        title: 'Hội An – Huế – Đà Nẵng',
        country: 'Việt Nam',
        duration: '7 ngày 6 đêm',
        description: 'Road trip miền Trung: phố cổ, cung đình và bãi biển trải dài.',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
        tourId: 3,
    },
    {
        id: 4,
        title: 'Bali – Trải nghiệm làng quê',
        country: 'Indonesia',
        duration: '4 ngày 3 đêm',
        description: 'Sống cùng người dân địa phương, học nghề thủ công và khám phá đền thiêng.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        tourId: 4,
    },
    {
        id: 5,
        title: 'Rừng nhiệt đới Monteverde',
        country: 'Costa Rica',
        duration: '7 ngày',
        description: 'Nhà trên cây, hái lượm cùng cộng đồng và tái kết nối với thiên nhiên.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        tourId: 1,
    },
    {
        id: 6,
        title: 'Bờ biển Dalmatian',
        country: 'Croatia',
        duration: '5 ngày',
        description: 'Đảo hoang sơ, âm nhạc và nghệ thuật giữa biển xanh.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
        tourId: 2,
    },
];

function formatDestinationDuration(destination) {
    if (destination?.durationText) return destination.durationText;
    if (destination?.durationDays && destination?.durationNights != null) {
        return `${destination.durationDays} ngày ${destination.durationNights} đêm`;
    }
    if (destination?.durationDays) return `${destination.durationDays} ngày`;
    if (destination?.idealDaysMin && destination?.idealDaysMax) {
        return `${destination.idealDaysMin}–${destination.idealDaysMax} ngày`;
    }
    if (destination?.idealDaysMin) return `${destination.idealDaysMin} ngày`;
    return 'Nhiều lịch trình';
}

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const list = await listDestinations();
                if (!alive) return;
                setDestinations(Array.isArray(list) ? list : []);
            } catch {
                if (!alive) return;
                setDestinations([]);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const viewData = useMemo(() => {
        if (destinations.length > 0) {
            return destinations.map((item, index) => ({
                id: item.id || item.slug || index,
                title: item.title || item.name || item.slug || 'Điểm đến',
                country: item.country || item.region || item.locationLabel || 'Flourish',
                duration: formatDestinationDuration(item),
                description: item.description || item.summary || 'Khám phá hành trình độc đáo cùng Flourish.',
                image: resolveMediaUrl(item.heroImageUrl || item.thumbnailUrl || item.imageUrl) || FALLBACK_DESTINATIONS[0].image,
                slug: item.slug || '',
            }));
        }
        return FALLBACK_DESTINATIONS.map((item) => ({ ...item, slug: '' }));
    }, [destinations]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 className={styles.title}>Điểm đến</h1>
                    <p className={styles.subtitle}>
                        Khám phá những hành trình đặc sắc, từ châu Á đến châu Âu, do Flourish Tourism thiết kế.
                    </p>
                </div>

                <div className={styles.grid}>
                    {viewData.map((dest) => (
                        <Link
                            key={dest.id}
                            to={dest.slug ? `/destinations/${encodeURIComponent(dest.slug)}` : `/tours?destination=${encodeURIComponent(dest.title)}`}
                            className={styles.cardLink}
                        >
                            <div className={styles.card}>
                                <img
                                    src={dest.image}
                                    alt={dest.title}
                                    className={styles.cardImage}
                                />
                                <div className={styles.cardContent}>
                                    <span className={styles.country}>{dest.country}</span>
                                    <h2 className={styles.cardTitle}>{dest.title}</h2>
                                    <p className={styles.cardDesc}>{dest.description}</p>
                                    <div className={styles.meta}>
                                        <span className={styles.metaItem}>
                                            <Calendar className={styles.metaIcon} />
                                            {dest.duration}
                                        </span>
                                        <span className={styles.metaItem}>
                                            <MapPin className={styles.metaIcon} />
                                            Xem tour
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Destinations;
