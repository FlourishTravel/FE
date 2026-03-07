import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Globe } from 'lucide-react';
import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Về chúng tôi</h1>
                <p className={styles.subtitle}>
                    Flourish Tourism ra đời với mong muốn mang đến hành trình trải nghiệm có ý nghĩa, bền vững và gắn kết con người với thiên nhiên, văn hóa.
                </p>
            </div>
            <div className={styles.container}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Sứ mệnh</h2>
                    <p className={styles.body}>
                        Chúng tôi tin du lịch không chỉ là đi và xem — mà là học, cảm nhận và kết nối. Mỗi tour của Flourish được thiết kế để bạn trải nghiệm đời sống địa phương, tôn trọng môi trường và cộng đồng, đồng thời mở rộng góc nhìn về thế giới.
                    </p>
                </section>
                <section className={styles.values}>
                    <h2 className={styles.sectionTitle}>Giá trị cốt lõi</h2>
                    <div className={styles.valueGrid}>
                        <div className={styles.valueCard}>
                            <Compass className={styles.valueIcon} />
                            <h3 className={styles.valueTitle}>Trải nghiệm thật</h3>
                            <p className={styles.valueText}>Tour nhóm nhỏ, điểm đến chọn lọc, hoạt động gắn với văn hóa và thiên nhiên địa phương.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <Heart className={styles.valueIcon} />
                            <h3 className={styles.valueTitle}>Bền vững</h3>
                            <p className={styles.valueText}>Ưu tiên homestay, giao thông xanh và tôn trọng cộng đồng bản địa, giảm tác động môi trường.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <Globe className={styles.valueIcon} />
                            <h3 className={styles.valueTitle}>Kết nối toàn cầu</h3>
                            <p className={styles.valueText}>Mạng lưới đối tác và hướng dẫn viên địa phương giúp mỗi chuyến đi an toàn và đáng nhớ.</p>
                        </div>
                    </div>
                </section>
                <div className={styles.cta}>
                    <Link to="/tours" className={styles.ctaBtn}>Khám phá tour</Link>
                </div>
            </div>
        </div>
    );
};

export default About;
