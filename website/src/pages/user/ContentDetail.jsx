import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, BookOpen, Eye } from 'lucide-react';
import { getSiteContentBySlug } from '../../api/content';
import { resolveMediaUrl } from '../../api/config';
import styles from './ContentDetail.module.css';

function getFakeViews(item) {
  if (!item) return '42';
  if (item.views != null && item.views > 0) {
    return item.views.toLocaleString('vi-VN');
  }
  const str = String(item.id || item.slug || item.title || '1');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33 + str.charCodeAt(i)) % 10000;
  }
  const views = 20 + (Math.abs(hash) % 31);
  return views.toLocaleString('vi-VN');
}

const FALLBACK_IMAGE = null; // dùng gradient CSS thay vì ảnh fallback

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function renderVideo(url) {
  if (!url) return null;
  const ytId = youtubeId(url);
  if (ytId) {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }
  // direct video file
  return (
    <video
      src={url}
      controls
      style={{ width: '100%', borderRadius: 12, marginBottom: '1.5rem', maxHeight: 480 }}
    />
  );
}

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
  const imgSrc = item?.imageUrl ? (resolveMediaUrl(item.imageUrl) || null) : null;

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
      <div className={styles.heroWrap} style={!imgSrc ? { background: 'linear-gradient(135deg, #1b4332 0%, #40916c 100%)', minHeight: 220 } : {}}>
        {imgSrc && (
          <img src={imgSrc} alt={item.title} className={styles.heroImage} />
        )}
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
            <span className={styles.date} style={{ color: '#059669', fontWeight: 600 }}>
              <Eye size={13} />
              {getFakeViews(item)} lượt xem
            </span>
          </div>

          <h1 className={styles.title}>{item.title}</h1>

          {item.summary && (
            <p className={styles.summary}>{item.summary}</p>
          )}

          {/* Ảnh bìa hiện lại trong body */}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={item.title}
              style={{ width: '100%', borderRadius: 10, marginBottom: '1.5rem', objectFit: 'cover', maxHeight: 400 }}
            />
          )}

          {item.videoUrl && renderVideo(item.videoUrl)}

          <div className={styles.body}>
            {(item.body || '').split('\n').map((para, i) => {
              if (!para.trim()) return null;
              // Render inline image tag [ảnh]url[/ảnh]
              const imgMatch = para.match(/^\[ảnh\](.*?)\[\/ảnh\]$/);
              if (imgMatch) {
                return (
                  <img
                    key={i}
                    src={imgMatch[1]}
                    alt=""
                    style={{ width: '100%', borderRadius: 10, margin: '0.75rem 0', objectFit: 'cover', maxHeight: 480 }}
                  />
                );
              }
              return <p key={i}>{para}</p>;
            })}
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
                <Eye size={14} color="#059669" />
                <span style={{ color: '#059669', fontWeight: 600 }}>{getFakeViews(item)} lượt xem</span>
              </div>
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
