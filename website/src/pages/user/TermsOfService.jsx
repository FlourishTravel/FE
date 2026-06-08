import React from 'react';
import styles from './TermsOfService.module.css';
import heroImage from '../../assets/Terms-Services.png';

const TermsOfService = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Điều khoản dịch vụ" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Điều khoản Dịch vụ</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: Introduction */}
                <section id="introduction" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. GIỚI THIỆU</h2>
                    <p className={styles.sectionText}>
                        Website Flourish Travel ("Website") được vận hành bởi <strong>Flourish Tourism</strong> nhằm cung cấp thông tin và hỗ trợ cho khách hàng đã, đang hoặc sẽ tham gia các tour của Flourish.
                    </p>
                    <p className={styles.sectionText}>
                        Website này không phải là sàn thương mại điện tử, không bán vé máy bay, không đặt phòng lưu trú và không xử lý thanh toán trực tuyến.
                    </p>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>Lưu ý quan trọng</h4>
                        <p className={styles.importantText}>
                            Bằng việc truy cập và sử dụng Website này, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với các Điều khoản Dịch vụ dưới đây.
                        </p>
                    </div>
                </section>

                {/* Section 2: Target Users */}
                <section id="target-users" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. ĐỐI TƯỢNG SỬ DỤNG</h2>
                    <p className={styles.sectionText}>
                        Website này dành cho:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Khách hàng đã mua tour của Flourish</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Cá nhân quan tâm đến thông tin tour Flourish</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Nhân viên nội bộ (trưởng đoàn, hướng dẫn viên, điều hành)</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>Quyền từ chối truy cập</h4>
                        <p className={styles.warningText}>
                            Flourish có quyền từ chối hoặc chấm dứt quyền truy cập nếu phát hiện có sự lạm dụng.
                        </p>
                    </div>
                </section>

                {/* Section 3: Scope of Services */}
                <section id="scope-of-services" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. PHẠM VI DỊCH VỤ TRÊN WEBSITE</h2>
                    <p className={styles.sectionText}>
                        Website cung cấp:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thông tin & lịch trình tour</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Nội dung giới thiệu điểm đến</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thông báo & cập nhật liên quan đến tour</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Các kênh liên hệ với Flourish</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Khu vực nội bộ (nếu được cấp quyền truy cập)</span>
                        </li>
                    </ul>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>👉 Xin lưu ý</h4>
                        <p className={styles.importantText}>
                            Website này chỉ nhằm mục đích cung cấp thông tin và hỗ trợ vận hành, không thay thế cho hợp đồng tour chính thức.
                        </p>
                    </div>
                </section>

                {/* Section 4: Account & Access Rights */}
                <section id="account-access" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. TÀI KHOẢN & QUYỀN TRUY CẬP</h2>
                    <p className={styles.sectionText}>
                        Một số nội dung trên Website có thể yêu cầu:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Tài khoản do Flourish cấp</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Mã tour hợp lệ</span>
                        </li>
                    </ul>

                    <p className={styles.sectionText} style={{ marginTop: '20px' }}>
                        <strong>Người dùng có trách nhiệm:</strong>
                    </p>
                    <ol className={styles.numberedList}>
                        <li>Bảo mật thông tin đăng nhập</li>
                        <li>Không chia sẻ tài khoản với bên thứ ba</li>
                        <li>Thông báo ngay cho Flourish nếu phát hiện truy cập trái phép</li>
                    </ol>
                </section>

                {/* Section 5: Content & Accuracy */}
                <section id="content-accuracy" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. ĐỘ CHÍNH XÁC CỦA NỘI DUNG & THÔNG TIN</h2>
                    <p className={styles.sectionText}>
                        Flourish cố gắng đảm bảo thông tin trên Website luôn chính xác và cập nhật, tuy nhiên:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Lịch trình, thời gian và hoạt động có thể thay đổi do yếu tố khách quan</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Nội dung Website có thể được điều chỉnh mà không cần báo trước</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>Ưu tiên thông tin</h4>
                        <p className={styles.warningText}>
                            Trong trường hợp có sự sai lệch, thông tin do trưởng đoàn hoặc điều hành tour cung cấp trực tiếp sẽ được ưu tiên.
                        </p>
                    </div>
                </section>

                {/* Section 6: Prohibited Actions */}
                <section id="prohibited-actions" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. CÁC HÀNH VI BỊ CẤM</h2>
                    <p className={styles.sectionText}>
                        Người dùng không được phép:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Sao chép hoặc phân phối nội dung Website khi chưa được phép</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Sử dụng Website cho mục đích thương mại trái phép</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Can thiệp hoặc gây thiệt hại cho hệ thống hay dữ liệu</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Đăng tải nội dung vi phạm pháp luật hoặc đạo đức xã hội</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>⚠️ Cảnh báo</h4>
                        <p className={styles.warningText}>
                            Flourish có quyền áp dụng các biện pháp xử lý theo quy định của pháp luật hiện hành nếu phát hiện vi phạm.
                        </p>
                    </div>
                </section>

                {/* Section 7: Intellectual Property */}
                <section id="intellectual-property" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. SỞ HỮU TRÍ TUỆ</h2>
                    <p className={styles.sectionText}>
                        Tất cả những nội dung sau:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Nội dung</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Hình ảnh</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thiết kế</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thương hiệu Flourish</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        đều thuộc sở hữu của <strong>Flourish Tourism</strong> hoặc các đối tác hợp pháp của chúng tôi.
                    </p>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>Yêu cầu tái sử dụng</h4>
                        <p className={styles.importantText}>
                            Mọi hình thức tái sử dụng đều cần có sự đồng ý bằng văn bản.
                        </p>
                    </div>
                </section>

                {/* Section 8: Limitation of Liability */}
                <section id="liability-limitation" className={styles.section}>
                    <h2 className={styles.sectionTitle}>8. GIỚI HẠN TRÁCH NHIỆM</h2>
                    <p className={styles.sectionText}>
                        Flourish không chịu trách nhiệm đối với:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Thiệt hại phát sinh từ việc người dùng sử dụng thông tin không đúng mục đích</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Sự cố kỹ thuật ngoài tầm kiểm soát (mạng, thiết bị, trình duyệt)</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Dịch vụ của bên thứ ba được liên kết hoặc nhắc đến trên Website</span>
                        </li>
                    </ul>
                </section>

                {/* Section 9: Third-Party Links */}
                <section id="third-party-links" className={styles.section}>
                    <h2 className={styles.sectionTitle}>9. LIÊN KẾT BÊN THỨ BA</h2>
                    <p className={styles.sectionText}>
                        Website có thể chứa các liên kết đến:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Bản đồ</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Dịch vụ vận chuyển</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Trang thông tin đối tác</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Flourish không chịu trách nhiệm về nội dung hoặc chính sách của các trang web bên ngoài này.
                    </p>
                </section>

                {/* Section 10: Changes to Terms */}
                <section id="terms-changes" className={styles.section}>
                    <h2 className={styles.sectionTitle}>10. THAY ĐỔI ĐIỀU KHOẢN</h2>
                    <p className={styles.sectionText}>
                        Flourish có quyền:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Cập nhật hoặc sửa đổi Điều khoản Dịch vụ</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Công bố các phiên bản mới trên Website</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Việc tiếp tục sử dụng Website sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận nội dung mới.
                    </p>
                </section>

                {/* Section 11: Applicable Law */}
                <section id="applicable-law" className={styles.section}>
                    <h2 className={styles.sectionTitle}>11. LUẬT ÁP DỤNG</h2>
                    <p className={styles.sectionText}>
                        Các điều khoản này tuân thủ theo <strong>luật pháp Việt Nam</strong>.
                    </p>
                    <p className={styles.sectionText}>
                        Mọi tranh chấp (nếu có) sẽ được ưu tiên giải quyết thông qua thương lượng trước khi đưa ra cơ quan có thẩm quyền.
                    </p>
                </section>

                {/* Section 12: Contact Information */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>12. THÔNG TIN LIÊN HỆ</h2>
                    <p className={styles.sectionText}>
                        Đối với bất kỳ câu hỏi nào liên quan đến Điều khoản Dịch vụ, vui lòng liên hệ:
                    </p>

                    <div className={styles.contactGrid}>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📧</span>
                            <div>
                                <div className={styles.contactLabel}>Email:</div>
                                <a href="mailto:support@flourishtravel.com" className={styles.contactLink}>
                                    support@flourishtravel.com
                                </a>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📍</span>
                            <div>
                                <div className={styles.contactLabel}>Địa chỉ:</div>
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

export default TermsOfService;
