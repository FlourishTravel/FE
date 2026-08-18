import React from 'react';
import { ANDROID_APK_HREF } from '../../config/appDownload';
import styles from './About.module.css';

const DownloadApp = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tải app Flourish Tourism</h1>
                <p className={styles.subtitle}>
                    App Android cho khách: xem tour, đặt chỗ, theo dõi chuyến đi. Mở trang này trên điện thoại rồi bấm tải.
                </p>
            </div>
            <div className={styles.container}>
                <section className={styles.section}>
                    <a className={styles.ctaBtn} href={ANDROID_APK_HREF} download="FlourishTravel.apk">
                        Tải APK Android
                    </a>
                </section>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Cài trên điện thoại</h2>
                    <p className={styles.body}>
                        1. Bấm Tải APK Android, chờ file xong rồi mở để cài.
                    </p>
                    <p className={styles.body}>
                        2. Nếu máy hỏi nguồn không xác định / cài từ trình duyệt — cho phép một lần cho Chrome hoặc Files.
                    </p>
                    <p className={styles.body}>
                        3. Bản này là file cài trực tiếp, chưa lên CH Play.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default DownloadApp;
