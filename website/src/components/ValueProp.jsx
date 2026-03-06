import React from 'react';
import { Users, Bot, Camera, Star } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import styles from './ValueProp.module.css';
import image1 from '../assets/1.png';
import image2 from '../assets/2..png';

const ValueProp = () => {
    return (
        <section className={styles.section}>
            {/* SVG Gradient Definition for Instagram Icon */}
            <svg width="0" height="0">
                <linearGradient id="instaGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop stopColor="#f09433" offset="0%" />
                    <stop stopColor="#e6683c" offset="25%" />
                    <stop stopColor="#dc2743" offset="50%" />
                    <stop stopColor="#cc2366" offset="75%" />
                    <stop stopColor="#bc1888" offset="100%" />
                </linearGradient>
            </svg>

            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* Left Content */}
                    <div className={styles.leftContent}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot}></span>
                            Cá nhân hóa bởi AI 🤖
                        </div>

                        <h2 className={styles.title}>
                            Khám phá thế giới, chinh phục những điểm đến hot hit và kết bạn mới.
                        </h2>

                        <h3 className={styles.subtitle}>
                            Flourish Tourism thiết kế các tour riêng cho Genz với lịch trình linh hoạt và AI Assistant của chúng tôi hiểu gu của bạn hơn cả người yêu cũ.
                        </h3>

                        <p className={styles.description}>
                            Không còn cảnh mệt mỏi cầm bản đồ, AI sẽ gợi ý những quán cafe local, góc phố 'nghệ' chỉ dành riêng cho bạn. Giúp bạn có một trải nghiệm 'local' đích thực, đảm bảo bạn có những kỷ niệm 'khó quên' và những bức ảnh triệu like.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIconWrapper}>
                                    <Users className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h4 className={styles.featureTitle}>Hành trình cùng Đồng đội</h4>
                                    <p className={styles.featureText}>Kết bạn mới và cùng khám phá</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIconWrapper}>
                                    <Bot className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h4 className={styles.featureTitle}>Gợi ý Góc Phố 'Nghệ' & Quán Cafe Local</h4>
                                    <p className={styles.featureText}>AI cá nhân hóa trải nghiệm</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIconWrapper}>
                                    <Camera className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h4 className={styles.featureTitle}>Trải nghiệm Local Đích thực</h4>
                                    <p className={styles.featureText}>Kỷ niệm khó quên, Ảnh 'Triệu Like'</p>
                                </div>
                            </div>
                        </div>

                        <button className={styles.ctaBtn}>
                            Trải nghiệm 'Local' Ngay
                        </button>
                    </div>

                    {/* Right Image Collage */}
                    <div className={styles.collageContainer}>
                        {/* Main Image */}
                        <div className={styles.mainImageWrapper}>
                            <img
                                src={image1}
                                alt="Friends traveling"
                                className={styles.mainImage}
                            />
                        </div>





                        {/* Phone mockup image or second small image */}
                        <div className={styles.smallCard}>
                            <img
                                src={image2}
                                alt="Hoi An"
                                className={styles.smallCardImg}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ValueProp;

