import React from 'react';
import styles from './CompanyDetails.module.css';

const CompanyDetails = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Du lịch với <span className={styles.heroTitleHighlight}>Mục đích</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Chúng tôi kết nối đam mê khám phá và trải nghiệm văn hóa sâu sắc. Flourish Travel
                        đồng hành cùng bạn trên hành trình khám phá Thái Lan, mở rộng thế giới quan và
                        phát triển bản thân qua những chuyến đi đầy cảm hứng.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className={styles.missionSection}>
                <div className={styles.missionContainer}>
                    <div className={styles.missionImageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80"
                            alt="Du khách trong rừng Thái Lan"
                            className={styles.missionImage}
                        />
                        <img
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                            alt="Nhóm du khách"
                            className={styles.missionImage}
                        />
                    </div>
                    <div className={styles.missionContent}>
                        <span className={styles.missionLabel}>✦ Sứ mệnh của chúng tôi</span>
                        <h2 className={styles.missionTitle}>
                            Truyền cảm hứng cho thế hệ công dân toàn cầu tiếp theo.
                        </h2>
                        <p className={styles.missionText}>
                            Tại Flourish Travel, chúng tôi tin rằng du lịch là hình thức học hỏi tuyệt vời nhất. 
                            Sứ mệnh của chúng tôi là mang đến những chuyến du lịch quốc tế dễ tiếp cận, giàu tính giáo dục và 
                            bền vững cho du khách. Chúng tôi thiết kế các trải nghiệm không chỉ đơn thuần 
                            là ngắm cảnh, mà còn là sự hòa mình vào văn hóa và sự phát triển cá nhân.
                        </p>
                        <ul className={styles.missionFeatures}>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Thực hành du lịch bền vững, tôn trọng cộng đồng địa phương.
                            </li>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Chương trình hỗ trợ trải nghiệm văn hóa bản địa chân thực.
                            </li>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Đặt sự an toàn lên hàng đầu với đội ngũ hỗ trợ toàn cầu 24/7.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Đối tác tại Thái Lan</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>12k</div>
                        <div className={styles.statLabel}>Du khách đồng hành</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>15</div>
                        <div className={styles.statLabel}>Tỉnh thành khám phá</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>100%</div>
                        <div className={styles.statLabel}>Phản hồi tích cực</div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className={styles.impactSection}>
                <div className={styles.impactContainer}>
                    <h2 className={styles.impactTitle}>Tác động của chúng tôi</h2>
                    <p className={styles.impactSubtitle}>
                        Chúng tôi đo lường thành công không chỉ bằng số dặm đã bay, mà bằng những trải nghiệm 
                        đáng giá. Xem cách Flourish Travel đang tạo ra sự khác biệt.
                    </p>
                    <div className={styles.impactGrid}>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"
                                    alt="Sáng kiến bù đắp Carbon"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Môi trường</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Sáng kiến bù đắp Carbon</h3>
                                <p className={styles.impactCardText}>
                                    Với mỗi chuyến bay được đặt, chúng tôi trồng 5 cây xanh ở 
                                    các khu vực bị tàn phá rừng, đảm bảo chuyến đi của bạn để lại 
                                    dấu chân xanh.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Tìm hiểu thêm →
                                </a>
                            </div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
                                    alt="Hỗ trợ cộng đồng"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Cộng đồng</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Hỗ trợ cộng đồng</h3>
                                <p className={styles.impactCardText}>
                                    Chúng tôi hợp tác với các trường học địa phương tại mỗi điểm đến 
                                    để tạo điều kiện giao lưu văn hóa và cung cấp tài nguyên giáo dục.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Tìm hiểu thêm →
                                </a>
                            </div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                                    alt="Bảo tồn văn hóa"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Văn hóa</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Bảo tồn văn hóa</h3>
                                <p className={styles.impactCardText}>
                                    Các tour du lịch của chúng tôi được thiết kế để hỗ trợ các nghệ nhân 
                                    địa phương và bảo tồn các di sản văn hóa phi vật thể.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Tìm hiểu thêm →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className={styles.contactContainer}>
                    <div className={styles.contactLeft}>
                        <h2>Liên hệ với chúng tôi</h2>
                        <p>
                            Bạn có câu hỏi về các chương trình tour hoặc cần hỗ trợ? 
                            Đội ngũ của chúng tôi luôn sẵn sàng 24/7 để đồng hành cùng bạn.
                        </p>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Trụ sở chính</h4>
                                    <p>Tòa nhà Bitexco Financial Tower<br />Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Gửi Email</h4>
                                    <p>
                                        <a href="mailto:support@flourishtravel.com">support@flourishtravel.com</a><br />
                                        <a href="mailto:partnerships@flourishtravel.com">partnerships@flourishtravel.com</a>
                                    </p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Gọi cho chúng tôi</h4>
                                    <p><a href="tel:+8419001234">+84 1900 1234</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.companyInfoCard}>
                        <h3 className={styles.companyInfoTitle}>Thông tin công ty</h3>
                        <div className={styles.companyInfoGrid}>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Tên pháp lý</span>
                                <span className={styles.companyInfoValue}>Công ty Cổ phần Flourish Travel</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Mã số thuế</span>
                                <span className={styles.companyInfoValue}>0312345678</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Năm thành lập</span>
                                <span className={styles.companyInfoValue}>2022</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Người đại diện</span>
                                <span className={styles.companyInfoValue}>Nguyễn Văn Demo, Giám đốc</span>
                            </div>
                            <div className={`${styles.companyInfoItem} ${styles.companyInfoFull}`}>
                                <span className={styles.companyInfoLabel}>Giấy phép hoạt động</span>
                                <span className={styles.companyInfoValue}>
                                    Giấy phép kinh doanh dịch vụ lữ hành quốc tế (GP: 79-999/2023/TCDL-GPLHQT). 
                                    Được chứng nhận bởi Hội đồng Du lịch Bền vững Toàn cầu.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CompanyDetails;
