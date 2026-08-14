import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Copy, Check } from 'lucide-react';
import { listActivePromotions } from '../api/promotions';
import styles from './FeaturedPromotions.module.css';

function formatDiscount(p) {
  if (p.discountType === 'PERCENT' || p.discountType === 'percent') {
    return `Giảm ${p.discountValue}%`;
  }
  const v = Number(p.discountValue);
  if (Number.isFinite(v)) return `Giảm ${v.toLocaleString('vi-VN')} ₫`;
  return 'Ưu đãi';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

const FeaturedPromotions = () => {
  const [promos, setPromos] = useState([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await listActivePromotions();
        const publicRows = (rows || []).filter((p) => p.isPublic !== false && !p.gifted);
        if (alive) setPromos(publicRows);
      } catch {
        if (alive) setPromos([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  if (promos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Ưu đãi đang mở</h2>
            <p className={styles.subtitle}>Mã công khai — sao chép và nhập khi thanh toán tour</p>
          </div>
          <Link to="/my-vouchers" className={styles.allLink}>
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.grid}>
          {promos.map((p) => (
            <article key={p.id || p.code} className={styles.card}>
              <div className={styles.cardTop}>
                <Tag size={18} className={styles.cardIcon} />
                <span className={styles.discount}>{formatDiscount(p)}</span>
              </div>
              <h3 className={styles.cardName}>{p.name || p.code}</h3>
              <button type="button" className={styles.codeBtn} onClick={() => copyCode(p.code)}>
                <span className={styles.code}>{p.code}</span>
                {copied === p.code ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <p className={styles.meta}>
                {p.upcoming ? 'Sắp có hiệu lực · ' : ''}HSD {formatDate(p.validTo)}
                {p.minOrderAmount != null ? ` · Đơn từ ${Number(p.minOrderAmount).toLocaleString('vi-VN')} ₫` : ''}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPromotions;
