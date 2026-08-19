import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, BookOpen } from 'lucide-react';
import { getSiteContentBySlug } from '../../api/content';
import { resolveMediaUrl } from '../../api/config';
import styles from './ContentDetail.module.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80';

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
  news:   { href: '/news',          label: 'Tin tức' },
  story:  { href: '/stories',       label: 'Câu chuyện' },
  career: { href: '/careers',       label: 'Tuyển dụng' },
  help:   { href: '/help',          label: 'Trợ giúp' },
  guide:  { href: '/travel-guide',  label: 'Cẩm nang' },
  video:  { href: '/videos',        label: 'Video' },
};

const TYPE_LABELS = {
  news:   'Tin tức',
  story:  'Câu chuyện',
  career: 'Tuyển dụng',
  help:   'Trợ giúp',
  guide:  'Cẩm nang du lịch',
  video:  'Video',
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
  const imgSrc = item?.imageUrl ? (resolveMediaUrl(item.imageUrl) || FALLBACK_IMAGE) : FALLBACK_IMAGE;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateWrap}>
          <p className={styles.muted}>Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.page}>
        <div className={styles.stateWrap}>
          <p className={styles.error}>{error || 'Không tìm thấy nội dung.'}</p>
          <Link to="/" className={styles.backLink} style={{ marginTop: 12 }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = formatDate(item.publishedAt || item.createdAt);
  const readingMins = Math.max(1, Math.ceil((item.body || '').split(' ').length / 200));

  return (
    <div className={styles.page}>
      {/* Back link */}
      <div className={styles.backBar}>
        <Link to={back.href} className={styles.backLink}>
          <ArrowLeft size={16} />
          Quay lại {back.label}
        </Link>
      </div>

      {/* Hero image full-width */}
      <div className={styles.heroWrap}>
        <img src={imgSrc} alt={item.title} className={styles.heroImage} />
      </div>

      {/* 2-column layout */}
      <div className={styles.layout}>
        {/* Main article */}
        <article className={styles.article}>
          <div className={styles.metaRow}>
            {item.category && (
              <span className={styles.category}>{item.category}</span>
            )}
            {dateStr && (
              <span className={styles.date}>
                <Calendar size={13} />
                {dateStr}
              </span>
            )}
          </div>

          <h1 className={styles.title}>{item.title}</h1>

          {item.summary && (
            <p className={styles.summary}>{item.summary}</p>
          )}

          <div className={styles.body}>
            {(item.body || '').split('\n').map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : null
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Reading info */}
          <div className={styles.sideCard}>
            <p className={styles.sideTitle}>Thông tin bài viết</p>
            <div className={styles.sideInfo}>
              {dateStr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Calendar size={14} color="#9ca3af" />
                  <span>{dateStr}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <BookOpen size={14} color="#9ca3af" />
                <span>~{readingMins} phút đọc</span>
              </div>
              {item.type && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={14} color="#9ca3af" />
                  <span>{TYPE_LABELS[item.type] || item.type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {item.category && (
            <div className={styles.sideCard}>
              <p className={styles.sideTitle}>Chuyên mục</p>
              <span className={styles.sideTag}>{item.category}</span>
            </div>
          )}

          {/* Back CTA */}
          <div className={styles.sideCard} style={{ background: '#1b4332', border: 'none' }}>
            <p className={styles.sideTitle} style={{ color: '#52b788' }}>Khám phá thêm</p>
            <p style={{ fontSize: 13, color: '#d8f3dc', lineHeight: 1.6, marginBottom: 12 }}>
              Xem thêm {back.label.toLowerCase()} khác từ Flourish Tourism.
            </p>
            <Link
              to={back.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#40916c', color: '#fff', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Xem tất cả <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContentDetail;
