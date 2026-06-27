import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PromotionManagement.module.css';

const AdminSettings = () => {
  const cards = [
    {
      key: 'siteName',
      icon: 'language',
      title: 'Ten website',
      value: 'Flourish Travel',
      hint: 'Cap nhat trong Quan ly Noi dung',
    },
    {
      key: 'supportEmail',
      icon: 'support_agent',
      title: 'Email ho tro hien thi',
      value: 'support@flourishtravel.vn',
      hint: 'Cap nhat trong Quan ly Noi dung',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Cai Dat He Thong</h1>
          <p className={styles.pageSubtitle}>Trang cau hinh co ban, hien tai su dung gia tri placeholder</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {cards.map((card) => (
          <div key={card.key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div className={styles.nameCell}>
              <div className={styles.nameIcon}><span className="material-icons-round">{card.icon}</span></div>
              <div>
                <div className={styles.nameTitle}>{card.title}</div>
                <div className={styles.subText}>{card.value}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#4b5563' }}>{card.hint}</div>
            <Link to="/admin/content" style={{ marginTop: 10, display: 'inline-flex', gap: 6, alignItems: 'center', color: '#059669', fontWeight: 600, fontSize: 13 }}>
              Mo Quan ly Noi dung
              <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
