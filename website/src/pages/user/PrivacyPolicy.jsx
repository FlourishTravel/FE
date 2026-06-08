import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PrivacyPolicy.module.css';
import heroImage from '../../assets/Privacy-Policy.jpg';

const PrivacyPolicy = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Chính sách bảo mật" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Chính sách bảo mật</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: Introduction */}
                <section id="introduction" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. GIỚI THIỆU</h2>
                    <p className={styles.sectionText}>
                        Chào mừng bạn đến với Flourish Travel. Tại Flourish, chúng tôi tin rằng du lịch giúp mở rộng tư duy và làm phong phú tâm hồn. 
                        Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn. Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về chính sách này, 
                        hoặc các hoạt động của chúng tôi liên quan đến thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi tại <a href="mailto:privacy@flourishtravel.com" className={styles.textLink}>privacy@flourishtravel.com</a>.
                    </p>
                    <p className={styles.sectionText}>
                        Khi bạn truy cập trang web của chúng tôi và sử dụng các dịch vụ của chúng tôi, bạn tin tưởng giao phó cho chúng tôi thông tin cá nhân của bạn. 
                        Chúng tôi rất coi trọng quyền riêng tư của bạn. Trong thông báo bảo mật này, chúng tôi mô tả chính sách bảo mật của mình. 
                        Chúng tôi cố gắng giải thích cho bạn một cách rõ ràng nhất có thể về những thông tin chúng tôi thu thập, cách chúng tôi sử dụng nó 
                        và những quyền bạn có liên quan đến nó.
                    </p>
                </section>

                {/* Section 2: Information We Collect */}
                <section id="information" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. THÔNG TIN CHÚNG TÔI THU THẬP</h2>

                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>Thông tin cá nhân</h3>
                        <p className={styles.infoCardText}>
                            Thông tin mà bạn tự nguyện cung cấp cho chúng tôi khi đăng ký tại Website, bày tỏ sự quan tâm đến việc nhận thông tin 
                            về chúng tôi hoặc các sản phẩm và dịch vụ của chúng tôi.
                        </p>
                        <ul className={styles.featureList}>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Tên và Dữ liệu Liên hệ (Email, Số điện thoại)</span>
                            </li>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Thông tin xác thực (Mật khẩu, Câu hỏi bảo mật)</span>
                            </li>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Dữ liệu Thanh toán (Được lưu trữ an toàn qua Stripe)</span>
                            </li>
                        </ul>
                    </div>

                    <p className={styles.sectionText}>
                        Chúng tôi tự động thu thập một số thông tin nhất định khi bạn truy cập, sử dụng hoặc điều hướng Website. 
                        Thông tin này không tiết lộ danh tính cụ thể của bạn (như tên hoặc thông tin liên hệ của bạn) nhưng có thể bao gồm 
                        thông tin về thiết bị và việc sử dụng, chẳng hạn như địa chỉ IP, trình duyệt và đặc điểm thiết bị, hệ điều hành, 
                        tùy chọn ngôn ngữ, URL giới thiệu, tên thiết bị, quốc gia, vị trí, thông tin về cách thức và thời điểm 
                        bạn sử dụng Website của chúng tôi và thông tin kỹ thuật khác.
                    </p>
                </section>

                {/* Section 3: How We Use Your Data */}
                <section id="usage" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. CÁCH CHÚNG TÔI SỬ DỤNG DỮ LIỆU CỦA BẠN</h2>
                    <p className={styles.sectionText}>
                        Chúng tôi sử dụng thông tin cá nhân thu thập qua Website cho nhiều mục đích kinh doanh được mô tả dưới đây. 
                        Chúng tôi xử lý thông tin cá nhân của bạn cho các mục đích này dựa trên lợi ích kinh doanh hợp pháp của chúng tôi, 
                        để ký kết hoặc thực hiện hợp đồng với bạn, với sự đồng ý của bạn và/hoặc để tuân thủ các nghĩa vụ pháp lý của chúng tôi.
                    </p>

                    <div className={styles.usageGrid}>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>QUẢN LÝ TÀI KHOẢN</h4>
                            <p className={styles.usageCardText}>Để tạo điều kiện thuận lợi cho quá trình tạo và đăng nhập tài khoản cũng như quản lý tài khoản người dùng.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>GIAO TIẾP</h4>
                            <p className={styles.usageCardText}>Để gửi cho bạn các thông tin tiếp thị và quảng cáo phù hợp với sở thích du lịch của bạn.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>THỰC HIỆN ĐƠN HÀNG</h4>
                            <p className={styles.usageCardText}>Để thực hiện và quản lý các đơn đặt hàng, thanh toán, hoàn trả và trao đổi của bạn.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>CẢI THIỆN DỊCH VỤ</h4>
                            <p className={styles.usageCardText}>Để yêu cầu phản hồi và liên hệ với bạn về việc bạn sử dụng Website của chúng tôi.</p>
                        </div>
                    </div>
                </section>

                {/* Section 4: Cookie Policy */}
                <section id="cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. CHÍNH SÁCH COOKIE</h2>
                    <p className={styles.sectionText}>
                        Chúng tôi có thể sử dụng cookie và các công nghệ theo dõi tương tự (như web beacon và pixel) để truy cập hoặc lưu trữ 
                        thông tin. Thông tin cụ thể về cách chúng tôi sử dụng các công nghệ đó và cách bạn có thể từ chối một số cookie nhất định 
                        được nêu trong <Link to="/cookie-policy" className={styles.textLink}>Chính sách Cookie</Link> của chúng tôi.
                    </p>

                    <div className={styles.noteBox}>
                        <span className={styles.noteIcon}>💡</span>
                        <p className={styles.noteText}>
                            <strong>Lưu ý:</strong> Bạn có thể thay đổi tùy chọn cookie của mình bất cứ lúc nào bằng cách nhấp vào liên kết "Cài đặt Cookie" ở cuối trang.
                        </p>
                    </div>
                </section>

                {/* Section 5: Sharing & Disclosure */}
                <section id="sharing" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. CHIA SẺ & TIẾT LỘ</h2>
                    <p className={styles.sectionText}>
                        Chúng tôi có thể chia sẻ thông tin của bạn trong các tình huống sau:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Với Nhà Cung Cấp Dịch Vụ:</strong> Chúng tôi có thể chia sẻ thông tin của bạn với các nhà cung cấp bên thứ ba cung cấp dịch vụ cho chúng tôi.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Chuyển Nhượng Doanh Nghiệp:</strong> Chúng tôi có thể chia sẻ hoặc chuyển giao thông tin của bạn liên quan đến việc sáp nhập hoặc mua lại.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Yêu Cầu Pháp Lý:</strong> Chúng tôi có thể tiết lộ thông tin của bạn khi luật pháp yêu cầu.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Với Sự Đồng Ý Của Bạn:</strong> Chúng tôi có thể chia sẻ thông tin cá nhân của bạn cho bất kỳ mục đích nào khác với sự đồng ý của bạn.</span>
                        </li>
                    </ul>
                </section>

                {/* Section 6: Data Security */}
                <section id="security" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. BẢO MẬT DỮ LIỆU</h2>
                    <p className={styles.sectionText}>
                        Chúng tôi đã triển khai các biện pháp bảo mật kỹ thuật và tổ chức phù hợp được thiết kế để bảo vệ 
                        tính bảo mật của bất kỳ thông tin cá nhân nào mà chúng tôi xử lý. Tuy nhiên, xin lưu ý rằng chúng tôi không thể 
                        đảm bảo bản thân internet an toàn 100%.
                    </p>
                </section>

                {/* Section 7: Contact Us */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. LIÊN HỆ VỚI CHÚNG TÔI</h2>
                    <p className={styles.sectionText}>
                        Nếu bạn có câu hỏi hoặc nhận xét về chính sách này, bạn có thể gửi email cho chúng tôi hoặc liên hệ qua đường bưu điện tại:
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
                                <div className={styles.contactLabel}>Văn phòng:</div>
                                <span className={styles.contactAddress}>
                                    Flourish Tourism – Việt Nam
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
