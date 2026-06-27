import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getSiteContentBySlug } from '../../api/content';
import { resolveMediaUrl } from '../../api/config';
import styles from './ContentDetail.module.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

const BACK_LINKS = {
  news: { href: '/news', label: 'Tin tức' },
  story: { href: '/stories', label: 'Câu chuyện' },
  career: { href: '/careers', label: 'Tuyển dụng' },
  help: { href: '/help', label: 'Trợ giúp' },
  guide: { href: '/travel-guide', label: 'Cẩm nang' },
};

const ContentDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const row = await getSiteContentBySlug(slug);
        if (alive) setItem(row);
      } catch (e) {
        if (alive) {
          setItem(null);
          setError(e.message || 'Không tải được nội dung.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const back = BACK_LINKS[item?.type] || { href: '/', label: 'Trang chủ' };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to={back.href} className={styles.backLink}>
          <ArrowLeft size={18} />
          Quay lại {back.label}
        </Link>

        {loading && <p className={styles.muted}>Đang tải...</p>}
        {error && !loading && <p className={styles.error}>{error}</p>}

        {item && !loading && (
          <article className={styles.article}>
            {item.imageUrl && (
              <img
                src={resolveMediaUrl(item.imageUrl) || FALLBACK_IMAGE}
                alt=""
                className={styles.heroImage}
              />
            )}
            <div className={styles.metaRow}>
              {item.category && <span className={styles.category}>{item.category}</span>}
              {(item.publishedAt || item.createdAt) && (
                <span className={styles.date}>
                  <Calendar size={14} />
                  {formatDate(item.publishedAt || item.createdAt)}
                </span>
              )}
            </div>
            <h1 className={styles.title}>{item.title}</h1>
            {item.summary && <p className={styles.summary}>{item.summary}</p>}
            <div className={styles.body}>
              {(item.body || '').split('\n').map((para, i) => (
                para.trim() ? <p key={i}>{para}</p> : null
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default ContentDetail;
