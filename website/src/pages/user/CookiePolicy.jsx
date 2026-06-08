import React from 'react';
import styles from './CookiePolicy.module.css';
import heroImage from '../../assets/Cookies-policy.png';

const CookiePolicy = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Chính sách Cookie" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Chính sách Cookie</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: What are Cookies? */}
                <section id="what-are-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. COOKIE LÀ GÌ?</h2>
                    <p className={styles.sectionText}>
                        Cookie là các tệp dữ liệu nhỏ được lưu trữ trên trình duyệt hoặc thiết bị của bạn khi bạn truy cập Website Flourish Travel ("Website"). Cookie giúp Website ghi nhớ các hành động và tùy chọn của người dùng, đảm bảo hoạt động ổn định và an toàn, đồng thời cải thiện trải nghiệm người dùng.
                    </p>
                    <p className={styles.sectionText}>
                        Cookie không chứa virus, không truy cập dữ liệu cá nhân trên thiết bị của bạn và không tự động thu thập thông tin nhận dạng nhạy cảm.
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Ghi nhớ các hành động và tùy chọn của người dùng</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Đảm bảo hoạt động ổn định và an toàn</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Cải thiện trải nghiệm người dùng</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Để biết thêm thông tin về cookie, vui lòng truy cập: <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className={styles.textLink}>www.allaboutcookies.org</a>
                    </p>
                </section>

                {/* Section 2: Why do we use cookies? */}
                <section id="why-use-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. TẠI SAO CHÚNG TÔI SỬ DỤNG COOKIE?</h2>
                    <p className={styles.sectionText}>
                        Flourish sử dụng cookie cho các mục đích sau:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Đảm bảo Website hoạt động chính xác</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Nâng cao trải nghiệm người dùng</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Phân tích cách Website được sử dụng</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Tối ưu hóa nội dung và hiệu suất</span>
                        </li>
                    </ul>

                    <div className={styles.importantBox}>
                        <p className={styles.importantText}>
                            👉 Flourish không sử dụng cookie cho các mục đích quảng cáo vi phạm quyền riêng tư.
                        </p>
                    </div>
                </section>

                {/* Section 3: Types of Cookies */}
                <section id="types-of-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. CÁC LOẠI COOKIE CHÚNG TÔI SỬ DỤNG</h2>

                    <h3 className={styles.subsectionTitle}>3.1. Cookie Bắt buộc (Strictly Necessary Cookies)</h3>
                    <p className={styles.sectionText}>
                        Đây là những cookie bắt buộc giúp Website hoạt động bình thường. Chúng duy trì phiên duyệt web, ghi nhớ trạng thái đăng nhập và bảo mật hệ thống.
                    </p>

                    <div className={styles.dangerBox}>
                        <p className={styles.dangerText}>
                            ❗ Các cookie này không thể bị vô hiệu hóa vì điều này sẽ khiến Website hoạt động không bình thường.
                        </p>
                    </div>

                    <h3 className={styles.subsectionTitle}>3.2. Cookie Chức năng (Functional Cookies)</h3>
                    <p className={styles.sectionText}>
                        Những cookie này giúp ghi nhớ các tùy chọn của người dùng (ngôn ngữ, khu vực), cá nhân hóa trải nghiệm xem nội dung và cải thiện sự thuận tiện khi sử dụng Website.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.3. Cookie Phân tích & Hiệu suất (Analytics & Performance Cookies)</h3>
                    <p className={styles.sectionText}>
                        Flourish sử dụng cookie phân tích để theo dõi lượt truy cập trang web, hiểu cách người dùng tương tác với trang web, phát hiện lỗi và tối ưu hóa hiệu suất. Dữ liệu thu thập được ẩn danh, tổng hợp và không được sử dụng để nhận dạng cá nhân.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.4. Cookie của Bên thứ ba (Third-Party Cookies)</h3>
                    <p className={styles.sectionText}>
                        Trong một số trường hợp, trang web có thể sử dụng cookie từ các bên thứ ba đáng tin cậy, chẳng hạn như các công cụ bản đồ, công cụ đo lường hiệu suất và dịch vụ cơ sở hạ tầng kỹ thuật. Flourish không trực tiếp kiểm soát cookie của bên thứ ba và việc sử dụng chúng tuân theo chính sách của riêng họ.
                    </p>
                </section>

                {/* Section 4: What are cookies NOT used for? */}
                <section id="not-used-for" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. COOKIE KHÔNG ĐƯỢC SỬ DỤNG ĐỂ LÀM GÌ?</h2>
                    <p className={styles.sectionText}>
                        Flourish cam kết <strong>KHÔNG</strong> sử dụng cookie để:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Theo dõi người dùng bên ngoài Website</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Bán hoặc chia sẻ dữ liệu với các nhà quảng cáo</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thu thập thông tin nhạy cảm (CMND/CCCD, hộ chiếu, thông tin tài chính)</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Xây dựng hồ sơ quảng cáo cá nhân</span>
                        </li>
                    </ul>
                </section>

                {/* Section 5: Managing cookies */}
                <section id="managing-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. QUẢN LÝ VÀ KIỂM SOÁT COOKIE</h2>
                    <p className={styles.sectionText}>
                        Bạn có quyền chấp nhận tất cả cookie, từ chối các cookie không cần thiết hoặc xóa cookie đã lưu. Bạn có thể thay đổi cài đặt cookie thông qua trình duyệt web (Chrome, Edge, Safari, Firefox…) hoặc biểu ngữ cookie hiển thị trong lần đầu tiên truy cập Website (nếu có).
                    </p>

                    <div className={styles.warningBox}>
                        <p className={styles.warningText}>
                            ⚠️ Lưu ý: Việc tắt một số cookie có thể ảnh hưởng đến trải nghiệm trang web của bạn.
                        </p>
                    </div>
                </section>

                {/* Section 6: Storage Time */}
                <section id="storage-time" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. THỜI GIAN LƯU TRỮ COOKIE</h2>
                    <p className={styles.sectionText}>
                        Cookie có thể là:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Cookie Phiên (Session Cookies):</strong> tự động bị xóa khi bạn đóng trình duyệt</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Cookie Cố định (Persistent Cookies):</strong> được lưu trữ trong một khoảng thời gian cụ thể để ghi nhớ tùy chọn của bạn</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Thời gian lưu trữ phụ thuộc vào mục đích sử dụng của từng loại cookie.
                    </p>
                </section>

                {/* Section 7: Policy Changes */}
                <section id="policy-changes" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. THAY ĐỔI CHÍNH SÁCH COOKIE</h2>
                    <p className={styles.sectionText}>
                        Flourish có thể cập nhật Chính sách Cookie để thích ứng với các thay đổi pháp lý, cải thiện Website và điều chỉnh công nghệ được sử dụng. Các phiên bản mới sẽ được công bố trên Website và sẽ có hiệu lực ngay khi công bố.
                    </p>
                </section>

                {/* Section 8: Contact */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>8. LIÊN HỆ</h2>
                    <p className={styles.sectionText}>
                        Nếu bạn có bất kỳ câu hỏi nào liên quan đến Chính sách Cookie, vui lòng liên hệ:
                    </p>

                    <div className={styles.contactGrid}>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📧</span>
                            <div>
                                <div className={styles.contactLabel}>Email:</div>
                                <a href="mailto:privacy@flourishtravel.com" className={styles.contactLink}>
                                    privacy@flourishtravel.com
                                </a>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📍</span>
                            <div>
                                <div className={styles.contactLabel}>Địa chỉ:</div>
                                <span className={styles.contactAddress}>Flourish Tourism – Việt Nam</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CookiePolicy;
