import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Help.module.css';
import {
    FaPlaneDeparture,
    FaPassport,
    FaMapMarkedAlt,
    FaCreditCard,
    FaEnvelope,
    FaComments,
    FaPhoneAlt,
    FaUsers
} from 'react-icons/fa';

const Help = () => {
    const categories = [
        {
            icon: <FaPlaneDeparture />,
            title: 'Đặt Tour & Lịch Trình',
            description: 'Thông tin về các gói tour Thái Lan, chính sách hoàn hủy và thay đổi ngày khởi hành.',
            articles: 15,
            iconClass: styles.iconTeal
        },
        {
            icon: <FaPassport />,
            title: 'Thủ Tục Visa & Nhập Cảnh',
            description: 'Hướng dẫn giấy tờ, tờ khai hải quan và quy định nhập cảnh Thái Lan mới nhất.',
            articles: 8,
            iconClass: styles.iconEmerald
        },
        {
            icon: <FaMapMarkedAlt />,
            title: 'Cẩm Nang Du Lịch Thái Lan',
            description: 'Mẹo di chuyển (BTS/MRT), văn hóa địa phương, gợi ý ẩm thực đường phố và mua sắm.',
            articles: 32,
            iconClass: styles.iconOrange
        },
        {
            icon: <FaCreditCard />,
            title: 'Thanh Toán & Hóa Đơn',
            description: 'Phương thức thanh toán an toàn, quy đổi ngoại tệ (Baht) và xuất hóa đơn dịch vụ.',
            articles: 6,
            iconClass: styles.iconBlue
        }
    ];

    const popularArticles = [
        {
            title: 'Quy định nhập cảnh Thái Lan không cần Visa (Mới nhất)',
            updated: 'Cập nhật 2 ngày trước'
        },
        {
            title: 'Hướng dẫn sử dụng tàu điện BTS & MRT tại Bangkok',
            updated: 'Cập nhật 1 tuần trước'
        },
        {
            title: 'Chính sách hoàn hủy và thay đổi tour của Flourish Travel',
            updated: 'Cập nhật 3 tuần trước'
        },
        {
            title: 'Top 10 món ăn đường phố không thể bỏ lỡ tại Chiang Mai',
            updated: 'Cập nhật 1 tháng trước'
        }
    ];

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <img 
                    src="/images/thailand_help_hero.png" 
                    alt="Cảnh đẹp Thái Lan" 
                    className={styles.heroBackground} 
                />
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Flourish có thể giúp gì cho chuyến đi Thái Lan của bạn?</h1>
                    <p className={styles.heroSubtitle}>
                        Tìm kiếm câu trả lời về đặt tour, thủ tục nhập cảnh, mẹo du lịch địa phương <br className="hidden md:block" /> và hướng dẫn điểm đến tại xứ sở Chùa Vàng.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContainer}>
                {/* Categories */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitleCenter}>Khám phá theo chủ đề</h2>
                    <p className={styles.sectionSubtitle}>Những chủ đề được quan tâm nhiều nhất cho chuyến đi Thái Lan</p>
                </div>
                
                <div className={styles.categoriesGrid}>
                    {categories.map((category, index) => (
                        <div key={index} className={styles.categoryCard}>
                            <div className={`${styles.categoryIconWrapper} ${category.iconClass}`}>
                                {category.icon}
                            </div>
                            <h3 className={styles.categoryTitle}>{category.title}</h3>
                            <p className={styles.categoryDesc}>{category.description}</p>
                            <Link to="#" className={styles.categoryLink}>
                                Xem {category.articles} bài viết &rarr;
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className={styles.bottomSection}>
                    {/* Left: Popular Articles */}
                    <div className={styles.articlesColumn}>
                        <div className={styles.articlesCard}>
                            <h2 className={styles.sectionTitle}>Bài viết phổ biến</h2>
                            <div className={styles.articlesList}>
                                {popularArticles.map((article, index) => (
                                    <div key={index} className={styles.articleItem}>
                                        <div className={styles.articleIconCircle}>
                                            <FaMapMarkedAlt className={styles.articleIconSmall} />
                                        </div>
                                        <div className={styles.articleText}>
                                            <h4 className={styles.articleHeading}>{article.title}</h4>
                                            <p className={styles.articleMeta}>{article.updated}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Support Sidebar */}
                    <div className={styles.sidebarColumn}>
                        <div className={styles.supportCard}>
                            <h3 className={styles.sidebarTitle}>Bạn vẫn cần hỗ trợ?</h3>
                            <p className={styles.sidebarDesc}>
                                Đội ngũ chuyên gia du lịch Thái Lan của Flourish luôn sẵn sàng hỗ trợ bạn 24/7.
                            </p>
                            
                            <div className={styles.contactList}>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIconContainer}>
                                        <FaEnvelope />
                                    </div>
                                    <div className={styles.contactDetails}>
                                        <span className={styles.contactLabel}>EMAIL HỖ TRỢ</span>
                                        <span className={styles.contactValue}>support@flourishtravel.com</span>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIconContainer}>
                                        <FaComments />
                                    </div>
                                    <div className={styles.contactDetails}>
                                        <span className={styles.contactLabel}>LIVE CHAT</span>
                                        <span className={styles.contactValue}>Bắt đầu trò chuyện</span>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <div className={styles.contactIconContainer}>
                                        <FaPhoneAlt />
                                    </div>
                                    <div className={styles.contactDetails}>
                                        <span className={styles.contactLabel}>HOTLINE (24/7)</span>
                                        <span className={styles.contactValue}>+84 398 34 83 87</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.communityCard}>
                            <div className={styles.communityIconCircle}>
                                <FaUsers />
                            </div>
                            <h3 className={styles.communityTitle}>Cộng đồng yêu Thái Lan</h3>
                            <p className={styles.communityDesc}>
                                Kết nối và chia sẻ kinh nghiệm khám phá xứ sở Chùa Vàng cùng hàng ngàn du khách khác.
                            </p>
                            <a 
                                href="https://www.facebook.com/share/1GuVzzwYdG/?mibextid=wwXIfr" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`${styles.communityBtn} block text-center`}
                            >
                                Tham gia ngay
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
