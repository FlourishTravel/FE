import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';
import styles from './Careers.module.css';

const JOBS = [
    {
        id: 1,
        title: 'Chuyên Viên Thiết Kế Tour Thái Lan',
        location: 'Hồ Chí Minh (hybrid)',
        type: 'Full-time',
        excerpt: 'Thiết kế và phát triển các tour trải nghiệm chuyên sâu về văn hóa, ẩm thực Thái Lan, làm việc với đối tác địa phương tại Bangkok, Chiang Mai.',
    },
    {
        id: 2,
        title: 'Chuyên Viên Chăm Sóc Khách Hàng',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        excerpt: 'Hỗ trợ khách hàng trong suốt hành trình du lịch Thái Lan; xử lý đặt tour, giải đáp thắc mắc và đảm bảo trải nghiệm tuyệt vời nhất.',
    },
    {
        id: 3,
        title: 'Content & Community Lead (Thailand Niche)',
        location: 'Remote',
        type: 'Full-time',
        excerpt: 'Viết bài cẩm nang du lịch Thái Lan, quản lý mạng xã hội và phát triển cộng đồng đam mê khám phá xứ sở Chùa Vàng.',
    },
];

const Careers = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <div className={styles.heroBackground}>
                    <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1920&q=80" alt="Thailand travel background" />
                </div>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Tuyển dụng</h1>
                    <p className={styles.subtitle}>
                        Cùng Flourish xây dựng những hành trình khám phá Thái Lan đầy ý nghĩa. Chúng tôi đang tìm kiếm những người đam mê văn hóa và du lịch xứ sở Chùa Vàng.
                    </p>
                </div>
            </div>
            <div className={styles.container}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Vì sao gia nhập Flourish?</h2>
                    <div className={styles.perksContainer}>
                        <img src="https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80" alt="Team at work" className={styles.perksImage} />
                        <ul className={styles.perks}>
                            <li>Môi trường linh hoạt, tôn trọng work-life balance</li>
                            <li>Cơ hội đi famtrip đến Thái Lan hàng năm để khảo sát và đóng góp ý tưởng sản phẩm</li>
                            <li>Lương thưởng cạnh tranh, phúc lợi rõ ràng và lộ trình thăng tiến mở rộng</li>
                            <li>Làm việc cùng đội ngũ đam mê du lịch và am hiểu sâu sắc về văn hóa Thái Lan</li>
                        </ul>
                    </div>
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
