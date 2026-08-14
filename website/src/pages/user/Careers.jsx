import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import styles from './Careers.module.css';
import { useSiteContent } from '../../hooks/useSiteContent';

const Careers = () => {
    const { items: raw, loading } = useSiteContent('career');
    const jobs = raw.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        location: item.category || 'TP.HCM',
        type: 'Toàn thời gian',
        excerpt: item.excerpt || item.body,
    }));

    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tuyển dụng</h1>
                <p className={styles.subtitle}>
                    Cùng Flourish xây dựng những hành trình ý nghĩa. Chúng tôi đang tìm kiếm con người đam mê du lịch bền vững.
                </p>
            </div>
            <div className={styles.container}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Vì sao gia nhập Flourish?</h2>
                    <ul className={styles.perks}>
                        <li>Môi trường linh hoạt, tôn trọng work-life balance</li>
                        <li>Được đi tour trải nghiệm và đóng góp ý tưởng sản phẩm</li>
                        <li>Lương cạnh tranh và chính sách phúc lợi rõ ràng</li>
                    </ul>
                </section>
                <section className={styles.jobsSection}>
                    <h2 className={styles.sectionTitle}>Vị trí đang tuyển</h2>
                    {loading && <p>Đang tải vị trí...</p>}
                    {!loading && jobs.length === 0 && (
                        <p>Chưa có vị trí tuyển dụng. Bài đã đăng ở Admin → Nội dung → Tuyển dụng sẽ hiện tại đây.</p>
                    )}
                    <div className={styles.jobList}>
                        {jobs.map((job) => (
                            <div key={job.id} className={styles.jobCard}>
                                <div className={styles.jobMain}>
                                    <h3 className={styles.jobTitle}>{job.title}</h3>
                                    <p className={styles.jobExcerpt}>{job.excerpt}</p>
                                    <div className={styles.jobMeta}>
                                        <span className={styles.jobMetaItem}>
                                            <MapPin className={styles.metaIcon} />
                                            {job.location}
                                        </span>
                                        <span className={styles.jobMetaItem}>
                                            <Briefcase className={styles.metaIcon} />
                                            {job.type}
                                        </span>
                                    </div>
                                </div>
                                {job.slug ? (
                                    <Link to={`/content/${job.slug}`} className={styles.applyBtn}>
                                        Xem chi tiết <ArrowRight className={styles.arrowIcon} />
                                    </Link>
                                ) : (
                                    <a href="mailto:careers@flourishtravel.com" className={styles.applyBtn}>
                                        Ứng tuyển <ArrowRight className={styles.arrowIcon} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
                <p className={styles.note}>
                    Chưa thấy vị trí phù hợp? Gửi CV về{' '}
                    <a href="mailto:careers@flourishtravel.com" className={styles.mailLink}>careers@flourishtravel.com</a>
                </p>
            </div>
        </div>
    );
};

export default Careers;
