import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Star, Ticket, Sparkles } from 'lucide-react';
import { getCatalogTicket } from '../../api/catalog';
import { resolveMediaUrl } from '../../api/config';
import styles from './Activities.module.css';

const PLACEHOLDER =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

const CATEGORY_LABELS = {
    attraction: 'Điểm tham quan',
    show: 'Show & vui chơi',
    transport: 'Di chuyển',
    combo: 'Combo',
};

const TicketDetail = () => {
    const { slug } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getCatalogTicket(slug);
                if (alive) setTicket(data);
            } catch (e) {
                if (alive) {
                    setTicket(null);
                    setError(e.message || 'Không tải được vé.');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [slug]);

    if (loading) {
        return <div className={styles.page}><p className={styles.state}>Đang tải...</p></div>;
    }

    if (error || !ticket) {
        return (
            <div className={styles.page}>
                <p className={`${styles.state} ${styles.stateError}`}>{error || 'Không tìm thấy vé.'}</p>
                <Link to="/activities" className={styles.ctaLink}>← Quay lại</Link>
            </div>
        );
    }

    const price =
        ticket.priceLabel ||
        (ticket.priceVnd != null ? `${Number(ticket.priceVnd).toLocaleString('vi-VN')} ₫` : 'Liên hệ');

    return (
        <div className={styles.page}>
            <header className={styles.hero} style={{ textAlign: 'left' }}>
                <Link to="/activities" style={{ fontSize: 14, color: '#059669' }}>← Vé & Hoạt động</Link>
                <h1 className={styles.title} style={{ marginTop: 12 }}>
                    <Ticket size={28} /> {ticket.name}
                </h1>
                <p className={styles.location}>
                    <MapPin size={14} />
                    {ticket.locationLabel || ticket.destinationCity || 'Thái Lan'}
                </p>
            </header>

            <article className={styles.card} style={{ maxWidth: 800, margin: '0 auto' }}>
                <div className={styles.imageWrap}>
                    <img
                        src={resolveMediaUrl(ticket.imageUrl) || PLACEHOLDER}
                        alt={ticket.name}
                        className={styles.image}
                        style={{ height: 320 }}
                    />
                    {ticket.featured && (
                        <span className={styles.badge}><Sparkles size={12} /> Nổi bật</span>
                    )}
                </div>
                <div className={styles.body}>
                    {ticket.category && (
                        <span className={styles.chip}>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                    )}
                    <p className={styles.desc}>{ticket.shortDescription || ticket.routeLabel || ''}</p>
                    {ticket.showTimeLabel && <p><strong>Giờ show:</strong> {ticket.showTimeLabel}</p>}
                    {ticket.routeLabel && <p><strong>Lộ trình:</strong> {ticket.routeLabel}</p>}
                    <div className={styles.footer}>
                        <span className={styles.price}>{price}</span>
                        {ticket.rating != null && (
                            <span className={styles.rating}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" /> {ticket.rating}
                            </span>
                        )}
                    </div>
                    {ticket.eTicket && <p style={{ marginTop: 12, color: '#059669' }}>✓ Hỗ trợ vé điện tử</p>}
                </div>
            </article>

            <div className={styles.cta}>
                <Link to="/tours" className={styles.ctaLink}>Kết hợp với tour trọn gói</Link>
            </div>
        </div>
    );
};

export default TicketDetail;
