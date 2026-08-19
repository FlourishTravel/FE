import React from 'react';
import { ANDROID_APK_HREF, APKPURE_APP_HREF } from '../../config/appDownload';
import styles from './About.module.css';

const DownloadApp = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tải app Flourish Tourism</h1>
                <p className={styles.subtitle}>
                    App Android cho khách: xem tour, đặt chỗ, theo dõi chuyến đi. Mở trang này trên điện thoại rồi chọn cách tải.
                </p>
            </div>
            <div className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.ctaGroup}>
                        <a
                            className={styles.ctaBtn}
                            href={APKPURE_APP_HREF}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Tải trên APKPure
                        </a>
                        <a
                            className={styles.ctaBtnSecondary}
                            href={ANDROID_APK_HREF}
                            download="FlourishTravel.apk"
                        >
                            Tải APK trực tiếp
                        </a>
                    </div>
                    <p className={styles.ctaHint}>
                        Khuyên dùng APKPure trên điện thoại — cài app APKPure rồi tìm Flourish Tourism, hoặc tải APK ngay trên trang đó.
                    </p>
                </section>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Cài trên điện thoại</h2>
                    <p className={styles.body}>
                        <strong>Qua APKPure:</strong> bấm Tải trên APKPure → cài app APKPure (nếu chưa có) → tải Flourish Tourism từ trang app.
                    </p>
                    <p className={styles.body}>
                        <strong>Tải trực tiếp:</strong> bấm Tải APK trực tiếp, chờ file xong rồi mở để cài. Nếu máy hỏi nguồn không xác định — cho phép một lần cho Chrome hoặc Files.
                    </p>
                    <p className={styles.body}>
                        CH Play đang thử nghiệm kín, search công khai chưa ra. Khi lên CH Play, gỡ bản cài từ APKPure/APK rồi cài lại từ Google Play để nhận cập nhật.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default DownloadApp;
