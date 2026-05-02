import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ icon, label, value, trend, trendValue, color = 'green' }) => {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={`${styles.iconWrap} ${styles[`icon${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
                    <span className="material-icons-round">{icon}</span>
                </div>
                {trend && (
                    <span className={`${styles.trend} ${trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                        <span className="material-icons-round" style={{ fontSize: '16px' }}>
                            {trend === 'up' ? 'trending_up' : 'trending_down'}
                        </span>
                        {trendValue}
                    </span>
                )}
            </div>
            <div className={styles.cardBody}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{value}</span>
            </div>
        </div>
    );
};

export default StatCard;
