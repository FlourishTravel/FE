import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Clock, ArrowLeft, FileText, Send, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import styles from './CancellationPolicy.module.css';

const CancellationPolicy = () => {
    const location = useLocation();
    const bookingFromNav = location.state?.booking;

    const [formData, setFormData] = useState({
        bookingCode: bookingFromNav?.id || '',
        email: bookingFromNav?.email || '',
        reason: '',
        agreed: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmModal(false);
        setSubmitted(true);
    };

    const handleCancelSubmit = () => {
        setShowConfirmModal(false);
    };

    const isFormValid = formData.bookingCode && formData.email && formData.reason && formData.agreed;

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <ShieldCheck className={styles.heroIcon} />
                <h1 className={styles.heroTitle}>Điều Khoản Hủy Tour &amp; Hoàn Tiền</h1>
                <p className={styles.heroSubtitle}>
                    Chính sách minh bạch, linh hoạt — đảm bảo quyền lợi tối đa cho khách hàng Flourish Travel.
                </p>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: Giới thiệu */}
                <section id="gioi-thieu" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. Giới Thiệu</h2>
                    <p className={styles.sectionText}>
                        Tại <strong>Flourish Travel</strong>, chúng tôi hiểu rằng kế hoạch du lịch đôi khi có thể thay đổi. Vì vậy, chúng tôi xây dựng chính sách hủy tour và hoàn tiền minh bạch, linh hoạt để đảm bảo quyền lợi cho khách hàng.
                    </p>
                    <p className={styles.sectionText}>
                        Trang này cung cấp thông tin về điều kiện hủy tour, mức hoàn tiền và quy trình yêu cầu hủy tour.
                    </p>
                </section>

                {/* Section 2: Chính sách hủy tour */}
                <section id="chinh-sach-huy-tour" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. Chính Sách Hủy Tour</h2>
                    <p className={styles.sectionText}>
                        Mức hoàn tiền phụ thuộc vào thời điểm bạn yêu cầu hủy tour so với ngày khởi hành.
                    </p>

                    <table className={styles.refundTable}>
                        <thead>
                            <tr>
                                <th>Thời điểm hủy</th>
                                <th>Mức hoàn tiền</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Trước 14 ngày hoặc sớm hơn</td>
                                <td><span className={styles.refundBadge100}>Hoàn 100%</span></td>
                                <td>Không áp dụng phí hủy</td>
                            </tr>
                            <tr>
                                <td>Từ 7 – 13 ngày trước khởi hành</td>
                                <td><span className={styles.refundBadge70}>Hoàn 70%</span></td>
                                <td>Phí hủy 30% giá trị tour</td>
                            </tr>
                            <tr>
                                <td>Từ 3 – 6 ngày trước khởi hành</td>
                                <td><span className={styles.refundBadge50}>Hoàn 50%</span></td>
                                <td>Phí hủy 50% giá trị tour</td>
                            </tr>
                            <tr>
                                <td>Dưới 72 giờ trước khởi hành</td>
                                <td><span className={styles.refundBadge0}>Không hoàn tiền</span></td>
                                <td>Dịch vụ đã được đặt trước</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className={styles.dangerBox}>
                        <p className={styles.dangerText}>
                            ❗ <strong>Lưu ý:</strong> Với các trường hợp hủy dưới 72 giờ, các dịch vụ như khách sạn, phương tiện và hoạt động trải nghiệm đã được đặt trước nên không thể hoàn tiền.
                        </p>
                    </div>
                </section>

                {/* Section 3: Trường hợp đặc biệt */}
                <section id="truong-hop-dac-biet" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. Trường Hợp Đặc Biệt</h2>
                    <p className={styles.sectionText}>
                        Khách hàng có thể được <strong>hoàn tiền đầy đủ</strong> hoặc <strong>đổi lịch miễn phí</strong> trong các trường hợp sau:
                    </p>

                    <div className={styles.specialGrid}>
                        <div className={styles.specialCard}>
                            <span className={styles.specialIcon}>🌪️</span>
                            <span className={styles.specialText}>Thiên tai hoặc thời tiết cực đoan</span>
                        </div>
                        <div className={styles.specialCard}>
                            <span className={styles.specialIcon}>⚠️</span>
                            <span className={styles.specialText}>Sự cố an toàn tại điểm đến</span>
                        </div>
                        <div className={styles.specialCard}>
                            <span className={styles.specialIcon}>🚫</span>
                            <span className={styles.specialText}>Tour bị hủy bởi Flourish Travel</span>
                        </div>
                        <div className={styles.specialCard}>
                            <span className={styles.specialIcon}>📋</span>
                            <span className={styles.specialText}>Các trường hợp bất khả kháng khác theo đánh giá của công ty</span>
                        </div>
                    </div>
                </section>

                {/* Section 4: Chính sách đổi lịch */}
                <section id="doi-lich" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. Chính Sách Đổi Lịch Tour</h2>
                    <p className={styles.sectionText}>
                        Khách hàng có thể yêu cầu đổi ngày khởi hành nếu:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Yêu cầu được gửi <strong>ít nhất 7 ngày</strong> trước ngày khởi hành</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Tour mới <strong>vẫn còn chỗ</strong></span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <p className={styles.warningText}>
                            ⚠️ <strong>Lưu ý:</strong> Mỗi booking được đổi lịch miễn phí <strong>1 lần</strong>. Nếu giá tour mới cao hơn, khách hàng cần thanh toán phần chênh lệch.
                        </p>
                    </div>
                </section>

                {/* Section 5: Quy trình hủy tour */}
                <section id="quy-trinh" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. Quy Trình Yêu Cầu Hủy Tour</h2>
                    <p className={styles.sectionText}>
                        Vui lòng xem lại mức hoàn tiền áp dụng trước khi gửi yêu cầu hủy tour.
                    </p>

                    {/* Part A: Refund Tiers */}
                    <div className={styles.refundTiersGrid}>
                        <div className={`${styles.refundTierCard} ${styles.tier100}`}>
                            <div className={styles.tierPercent}>100%</div>
                            <div className={styles.tierLabel}>Hoàn tiền đầy đủ</div>
                            <div className={styles.tierTime}>Trước 14 ngày khởi hành</div>
                            <div className={styles.tierNote}>Không phí hủy</div>
                        </div>
                        <div className={`${styles.refundTierCard} ${styles.tier70}`}>
                            <div className={styles.tierPercent}>70%</div>
                            <div className={styles.tierLabel}>Hoàn tiền phần lớn</div>
                            <div className={styles.tierTime}>7 – 13 ngày trước khởi hành</div>
                            <div className={styles.tierNote}>Phí hủy 30%</div>
                        </div>
                        <div className={`${styles.refundTierCard} ${styles.tier50}`}>
                            <div className={styles.tierPercent}>50%</div>
                            <div className={styles.tierLabel}>Hoàn tiền một nửa</div>
                            <div className={styles.tierTime}>3 – 6 ngày trước khởi hành</div>
                            <div className={styles.tierNote}>Phí hủy 50%</div>
                        </div>
                        <div className={`${styles.refundTierCard} ${styles.tier0}`}>
                            <div className={styles.tierPercent}>0%</div>
                            <div className={styles.tierLabel}>Không hoàn tiền</div>
                            <div className={styles.tierTime}>Dưới 72 giờ trước khởi hành</div>
                            <div className={styles.tierNote}>Dịch vụ đã đặt trước</div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={styles.sectionDivider}>
                        <span className={styles.dividerLabel}>Xác nhận thông tin hủy tour</span>
                    </div>

                    {/* Part B: Cancellation Form */}
                    {!submitted ? (
                        <div className={styles.cancellationFormCard}>
                            <div className={styles.formTitle}>
                                <FileText className={styles.formTitleIcon} />
                                Thông Tin Xác Nhận Hủy Tour
                            </div>
                            <p className={styles.formSubtitle}>
                                Vui lòng điền đầy đủ thông tin bên dưới. Yêu cầu sẽ được xử lý trong 3 – 5 ngày làm việc.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Mã đặt tour <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="bookingCode"
                                            className={styles.formInput}
                                            placeholder="Ví dụ: FT-20260307-001"
                                            value={formData.bookingCode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Email đã đăng ký <span className={styles.required}>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={styles.formInput}
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                        <label className={styles.formLabel}>
                                            Lý do hủy tour <span className={styles.required}>*</span>
                                        </label>
                                        <textarea
                                            name="reason"
                                            className={styles.formTextarea}
                                            placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy tour..."
                                            value={formData.reason}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="agree-terms"
                                        name="agreed"
                                        className={styles.checkboxInput}
                                        checked={formData.agreed}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="agree-terms" className={styles.checkboxLabel}>
                                        Tôi đã đọc và đồng ý với <strong>Điều Khoản Hủy Tour & Hoàn Tiền</strong> của Flourish Travel. Tôi hiểu rằng mức hoàn tiền sẽ dựa trên thời điểm yêu cầu hủy so với ngày khởi hành.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={!isFormValid}
                                >
                                    <Send className={styles.submitIcon} />
                                    Gửi Yêu Cầu Hủy Tour
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className={styles.successMessage}>
                            <CheckCircle2 className={styles.successIcon} />
                            <div className={styles.successTitle}>Yêu cầu đã được gửi thành công!</div>
                            <p className={styles.successText}>
                                Chúng tôi đã nhận được yêu cầu hủy tour của bạn. Đội ngũ hỗ trợ sẽ liên hệ qua email <strong>{formData.email}</strong> trong vòng 3 – 5 ngày làm việc.
                            </p>
                        </div>
                    )}

                    <div className={styles.infoBox} style={{ marginTop: '20px' }}>
                        <p className={styles.infoText}>
                            ℹ️ Sau khi yêu cầu được gửi, đội ngũ của chúng tôi sẽ xử lý trong <strong>3 – 5 ngày làm việc</strong>.
                        </p>
                    </div>
                </section>

                {/* Section 6: Thời gian hoàn tiền */}
                <section id="thoi-gian-hoan-tien" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. Thời Gian Hoàn Tiền</h2>
                    <p className={styles.sectionText}>
                        Sau khi yêu cầu hủy tour được xác nhận:
                    </p>

                    <div className={styles.timelineBox}>
                        <Clock className={styles.timelineIcon} />
                        <div className={styles.timelineContent}>
                            <div className={styles.timelineTitle}>Thời gian xử lý: 5 – 10 ngày làm việc</div>
                            <div className={styles.timelineDesc}>
                                Tiền sẽ được hoàn về phương thức thanh toán ban đầu. Thời gian nhận tiền có thể thay đổi tùy theo ngân hàng hoặc cổng thanh toán.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: Liên hệ hỗ trợ */}
                <section id="lien-he" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. Liên Hệ Hỗ Trợ</h2>
                    <p className={styles.sectionText}>
                        Nếu bạn cần hỗ trợ về việc hủy tour hoặc hoàn tiền, vui lòng liên hệ:
                    </p>

                    <div className={styles.contactGrid}>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📧</span>
                            <div>
                                <div className={styles.contactLabel}>Email</div>
                                <a href="mailto:support@flourishtravel.com" className={styles.contactLink}>
                                    support@flourishtravel.com
                                </a>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>📞</span>
                            <div>
                                <div className={styles.contactLabel}>Hotline</div>
                                <span className={styles.contactValue}>+84 xxx xxx xxx</span>
                            </div>
                        </div>
                        <div className={styles.contactCard}>
                            <span className={styles.contactIcon}>🕐</span>
                            <div>
                                <div className={styles.contactLabel}>Thời gian hỗ trợ</div>
                                <span className={styles.contactValue}>08:00 – 20:00 (GMT+7)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Back Button */}
                <Link to="/my-journey" className={styles.backButton}>
                    <ArrowLeft className={styles.backIcon} />
                    Quay lại Chỗ Đã Đặt
                </Link>
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.modalCloseBtn} onClick={handleCancelSubmit}>
                            <X size={20} />
                        </button>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIconWrapper}>
                                <AlertTriangle className={styles.modalIcon} />
                            </div>
                            <h3 className={styles.modalTitle}>Xác Nhận Hủy Tour</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Bạn có chắc chắn muốn gửi yêu cầu hủy tour này không?</p>
                            <p className={styles.modalWarning}>
                                Việc hoàn tiền sẽ được áp dụng theo chính sách hủy tour hiện hành.
                            </p>
                            <div className={styles.modalSummary}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Mã đặt tour:</span>
                                    <span className={styles.summaryValue}>{formData.bookingCode}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Email:</span>
                                    <span className={styles.summaryValue}>{formData.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={handleCancelSubmit}>
                                Quay lại
                            </button>
                            <button className={styles.btnConfirm} onClick={handleConfirmSubmit}>
                                Xác nhận Hủy Tour
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CancellationPolicy;
