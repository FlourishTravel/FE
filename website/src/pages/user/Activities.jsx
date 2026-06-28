import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Ticket, Sparkles } from 'lucide-react';
import { listCatalogTickets } from '../../api/catalog';
import { resolveMediaUrl } from '../../api/config';
import styles from './Activities.module.css';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

const TYPE_TO_CATEGORY = {
  ticket: 'attraction',
  event: 'show',
  combo: 'combo',
};

const CATEGORIES = [
  { key: '', label: 'Tất cả' },
  { key: 'attraction', label: 'Điểm tham quan' },
  { key: 'show', label: 'Show & vui chơi' },
  { key: 'transport', label: 'Di chuyển' },
  { key: 'combo', label: 'Combo' },
];

const Activities = () => {
  const [searchParams] = useSearchParams();
  const typeFromQuery = searchParams.get('type') || '';
  const initialCategory = TYPE_TO_CATEGORY[typeFromQuery] ?? '';
  const [category, setCategory] = useState(initialCategory);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const mapped = TYPE_TO_CATEGORY[typeFromQuery] ?? '';
    setCategory(mapped);
  }, [typeFromQuery]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const rows = await listCatalogTickets({ category: category || undefined });
        if (alive) setTickets(rows);
      } catch (e) {
        if (alive) {
          setTickets([]);
          setError(e.message || 'Không tải được danh sách vé.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [category]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <Ticket size={32} strokeWidth={2.2} />
          Vé & Hoạt động
        </h1>
        <p className={styles.subtitle}>
          Vé tham quan, show và di chuyển tại Thái Lan — kết hợp linh hoạt với tour Flourish.
        </p>
        <div className={styles.filters}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`${styles.chip} ${category === c.key ? styles.chipActive : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {loading && <p className={styles.state}>Đang tải vé & hoạt động...</p>}
      {error && <p className={`${styles.state} ${styles.stateError}`}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {tickets.map((t) => (
            <Link
              key={t.id || t.slug}
              to={t.slug ? `/activities/${encodeURIComponent(t.slug)}` : '/activities'}
              className={styles.cardLink}
            >
            <article className={styles.card}>
              <div className={styles.imageWrap}>
                <img
                  src={resolveMediaUrl(t.imageUrl) || PLACEHOLDER}
                  alt={t.name}
                  className={styles.image}
                />
                {t.featured && (
                  <span className={styles.badge}>
                    <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    {' '}Nổi bật
                  </span>
                )}
                {t.eTicket && !t.featured && <span className={styles.badge}>Vé điện tử</span>}
              </div>
              <div className={styles.body}>
                <h2 className={styles.cardTitle}>{t.name}</h2>
                <p className={styles.location}>
                  <MapPin size={14} />
                  {t.destinationCity || t.locationLabel || 'Thái Lan'}
                </p>
                <p className={styles.desc}>{t.shortDescription || t.routeLabel || ''}</p>
                <div className={styles.footer}>
                  <span className={styles.price}>{t.priceLabel || 'Liên hệ'}</span>
                  {t.rating != null && (
                    <span className={styles.rating}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      {t.rating}
                    </span>
                  )}
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && !error && (
        <p className={styles.state}>
          Chưa có vé trong danh mục này. Admin có thể thêm tại <strong>Danh mục Vé</strong>.
        </p>
      )}

      <div className={styles.cta}>
        <Link to="/tours" className={styles.ctaLink}>Xem tour trọn gói</Link>
      </div>
    </div>
  );
};

export default Activities;
