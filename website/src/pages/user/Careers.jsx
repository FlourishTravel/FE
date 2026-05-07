import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import styles from './Careers.module.css';

const JOBS = [
    {
        id: 1,
        title: 'Travel Experience Designer',
        location: 'Hồ Chí Minh (hybrid)',
        type: 'Full-time',
        excerpt: 'Thiết kế và phát triển các tour trải nghiệm mới, làm việc với đối tác địa phương và đội nội dung.',
    },
    {
        id: 2,
        title: 'Customer Success Specialist',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        excerpt: 'Hỗ trợ khách hàng trước, trong và sau chuyến đi; xử lý đặt tour và phản hồi trải nghiệm.',
    },
    {
        id: 3,
        title: 'Content & Community Lead',
        location: 'Remote',
        type: 'Full-time',
        excerpt: 'Viết bài cẩm nang, quản lý mạng xã hội và cộng đồng du lịch trải nghiệm của Flourish.',
    },
];

const Careers = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Tuyển dụng</h1>
                <p className={styles.subtitle}>
                    Cùng Flourish xây dựng những hành trình ý nghĩa. Chúng tôi đang tìm kiếm con người đam mê du lịch bền vững và trải nghiệm.
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
                    <div className={styles.jobList}>
                        {JOBS.map((job) => (
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
                                <button type="button" className={styles.applyBtn}>
                                    Ứng tuyển <ArrowRight className={styles.arrowIcon} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                <p className={styles.note}>
                    Chưa thấy vị trí phù hợp? Gửi CV về <a href="mailto:careers@flourishtravel.com" className={styles.mailLink}>careers@flourishtravel.com</a> để chúng tôi lưu hồ sơ cho các đợt tuyển sau.
                </p>
            </div>
        </div>
    );
};

export default Careers;
