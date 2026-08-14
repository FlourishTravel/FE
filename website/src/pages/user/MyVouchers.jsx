import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import { listActivePromotions } from '../../api/promotions';
import styles from './UserAccount.module.css';

function formatDiscount(p) {
    if (p.discountType === 'PERCENT' || p.discountType === 'percent') {
        return `Giảm ${p.discountValue}%`;
    }
    const v = Number(p.discountValue);
    if (Number.isFinite(v)) return `Giảm ${v.toLocaleString('vi-VN')} ₫`;
    return 'Ưu đãi đặc biệt';
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
}

const MyVouchers = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const rows = await listActivePromotions();
                if (alive) setPromos(rows);
            } catch (e) {
                if (alive) {
                    setPromos([]);
                    setError(e.message || 'Không tải được mã khuyến mãi.');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <Tag size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Voucher & Mã giảm giá
                    </h1>
                    <p className={styles.subtitle}>
                        Mã công khai hiện trên trang chủ và trang này. Voucher tặng riêng chỉ tài khoản của bạn mới thấy — nhập khi thanh toán tour.
                    </p>
                </header>

                {loading && <p className={styles.state}>Đang tải...</p>}
                {error && <p className={`${styles.state} ${styles.stateError}`}>{error}</p>}

                {!loading && !error && promos.length === 0 && (
                    <div className={styles.empty}>
                        <p>Hiện chưa có mã khuyến mãi dành cho bạn.</p>
                        <Link to="/tours" className={styles.linkBtn}>
                            Xem tour <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {!loading && promos.map((p) => (
                    <div key={p.id || p.code} className={styles.card}>
                        <div className={styles.cardTitle}>{p.name || p.code}</div>
                        <div className={styles.codeBox}>{p.code}</div>
                        <div className={styles.cardMeta} style={{ marginTop: 12 }}>
                            <span className={styles.badge}>{formatDiscount(p)}</span>
                            {(p.gifted || p.isPublic === false) && (
                                <span className={`${styles.badge} ${styles.badgeGift}`}>Tặng riêng</span>
                            )}
                            {p.upcoming && (
                                <span className={`${styles.badge} ${styles.badgeMuted}`}>Sắp có hiệu lực</span>
                            )}
                            <span>HSD: {formatDate(p.validTo)}</span>
                            {p.minOrderAmount != null && (
                                <span>Đơn tối thiểu {Number(p.minOrderAmount).toLocaleString('vi-VN')} ₫</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyVouchers;
