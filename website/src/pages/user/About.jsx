import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Globe, MapPin, Users, Star } from 'lucide-react';
import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroImageWrapper}>
                    <img 
                        src="/images/thailand_hero.png" 
                        alt="Đền thờ Thái Lan" 
                        className={styles.heroImage} 
                    />
                    <div className={styles.heroOverlay}></div>
                </div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Về Chúng Tôi</h1>
                    <p className={styles.heroSubtitle}>
                        Khám phá vẻ đẹp đích thực của Thái Lan cùng Flourish Travel - Nơi mỗi hành trình là một trải nghiệm văn hóa sâu sắc.
                    </p>
                </div>
            </div>

            <div className={styles.container}>
                {/* Story Section */}
                <section className={styles.storySection}>
                    <div className={styles.storyContent}>
                        <h2 className={styles.sectionTitle}>Câu chuyện của chúng tôi</h2>
                        <p className={styles.bodyText}>
                            Flourish Travel được sinh ra từ tình yêu mãnh liệt với "Xứ sở nụ cười". Chúng tôi không chỉ cung cấp những tour du lịch thông thường, mà mang đến cho bạn cơ hội đắm mình vào những nét văn hóa rực rỡ, thưởng thức ẩm thực đường phố tuyệt hảo và khám phá những vùng biển đảo hoang sơ tuyệt đẹp của Thái Lan.
                        </p>
                        <p className={styles.bodyText}>
                            Từ những con phố nhộn nhịp của Bangkok đến bờ biển yên bình ở Phi Phi, chúng tôi thiết kế mỗi hành trình bằng sự tận tâm, giúp bạn có những trải nghiệm đáng nhớ và chân thật nhất.
                        </p>
                    </div>
                    <div className={styles.storyImageContainer}>
                        <img 
                            src="/images/thailand_story.png" 
                            alt="Quần đảo Phi Phi Thái Lan" 
                            className={styles.storyImage} 
                        />
                    </div>
                </section>

                {/* Values Section */}
                <section className={styles.valuesSection}>
                    <h2 className={styles.sectionTitleCenter}>Giá trị cốt lõi</h2>
                    <p className={styles.sectionSubtitle}>Những nguyên tắc định hướng mọi hành trình của chúng tôi tại Thái Lan</p>
                    
                    <div className={styles.valueGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.iconWrapper}>
                                <Compass className={styles.valueIcon} />
                            </div>
                            <h3 className={styles.valueTitle}>Trải nghiệm Chân thực</h3>
                            <p className={styles.valueText}>
                                Thoát khỏi những lộ trình du lịch rập khuôn. Chúng tôi đưa bạn đến những khu chợ truyền thống, những ngôi chùa linh thiêng và những ngôi làng ít người biết đến.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.iconWrapper}>
                                <Heart className={styles.valueIcon} />
                            </div>
                            <h3 className={styles.valueTitle}>Du lịch Bền vững</h3>
                            <p className={styles.valueText}>
                                Cam kết bảo vệ môi trường và hỗ trợ cộng đồng địa phương. Chúng tôi hợp tác với các nhà cung cấp dịch vụ tôn trọng thiên nhiên và động vật hoang dã.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.iconWrapper}>
                                <Star className={styles.valueIcon} />
                            </div>
                            <h3 className={styles.valueTitle}>Dịch vụ Đẳng cấp</h3>
                            <p className={styles.valueText}>
                                Từ khách sạn lưu trú đến phương tiện di chuyển, mọi chi tiết đều được lựa chọn kỹ lưỡng để mang lại sự thoải mái và tiện nghi tối đa cho bạn.
                            </p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.iconWrapper}>
                                <Users className={styles.valueIcon} />
                            </div>
                            <h3 className={styles.valueTitle}>Chuyên gia Bản địa</h3>
                            <p className={styles.valueText}>
                                Đội ngũ hướng dẫn viên người bản xứ am hiểu văn hóa sâu sắc, sẵn sàng chia sẻ những câu chuyện lịch sử và bí quyết khám phá mà không có trên sách vở.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Culture Section */}
                <section className={styles.cultureSection}>
                    <div className={styles.cultureImageContainer}>
                        <img 
                            src="/images/thailand_culture.png" 
                            alt="Văn hóa ẩm thực đường phố Thái Lan" 
                            className={styles.cultureImage} 
                        />
                    </div>
                    <div className={styles.cultureContent}>
                        <h2 className={styles.sectionTitle}>Sứ mệnh của Flourish</h2>
                        <div className={styles.missionPoints}>
                            <div className={styles.missionPoint}>
                                <MapPin className={styles.missionIcon} />
                                <div>
                                    <h4 className={styles.missionTitle}>Khám phá không giới hạn</h4>
                                    <p className={styles.missionText}>Mở rộng chân trời trải nghiệm của du khách với những điểm đến độc đáo nhất Thái Lan.</p>
                                </div>
                            </div>
                            <div className={styles.missionPoint}>
                                <Globe className={styles.missionIcon} />
                                <div>
                                    <h4 className={styles.missionTitle}>Kết nối văn hóa</h4>
                                    <p className={styles.missionText}>Làm cầu nối giữa du khách quốc tế và lòng hiếu khách tuyệt vời của người dân Thái Lan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <div className={styles.ctaSection}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>Sẵn sàng cho chuyến đi để đời?</h2>
                        <p className={styles.ctaText}>
                            Hãy để chúng tôi lên kế hoạch cho kỳ nghỉ hoàn hảo của bạn tại Thái Lan.
                        </p>
                        <Link to="/tours" className={styles.ctaBtn}>
                            Khám phá các Tour Thái Lan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
