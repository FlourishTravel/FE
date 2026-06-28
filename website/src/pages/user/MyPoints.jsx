import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './UserAccount.module.css';

const MyPoints = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <Sparkles size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Điểm thưởng
                    </h1>
                    <p className={styles.subtitle}>
                        Chương trình tích điểm Flourish đang được triển khai.
                    </p>
                </header>

                <div className={styles.card}>
                    <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
                        Bạn sẽ nhận điểm khi hoàn tất tour và để lại đánh giá. Điểm có thể đổi voucher trong các đợt ưu đãi sắp tới.
                    </p>
                    <p className={styles.amount} style={{ marginTop: 16 }}>0 điểm</p>
                    <Link to="/my-vouchers" className={styles.linkBtn}>
                        Xem voucher hiện có <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MyPoints;
