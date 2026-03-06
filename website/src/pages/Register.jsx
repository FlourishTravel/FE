import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle, Ticket } from 'lucide-react';
import styles from './Register.module.css';
import logo from '../assets/LogoFlourish\'.jpg';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register:', formData);
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <div className={styles.container}>
            {/* Background decorations */}
            <div className={styles.bgDecorLeft}></div>
            <div className={styles.bgDecorRight}></div>

            {/* Register Card */}
            <div className={styles.card}>
                {/* Icon */}
                <div className={styles.iconContainer}>
                    <div className={styles.iconCircle}>
                        <User className={styles.userIcon} />
                        <span className={styles.plusBadge}>+</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className={styles.title}>Tạo Tài Khoản</h1>
                <p className={styles.subtitle}>Tham gia Flourish Travel và bắt đầu hành trình của bạn.</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Full Name */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Họ và Tên</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Địa chỉ Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Số điện thoại</label>
                        <div className={styles.inputWrapper}>
                            <Phone className={styles.inputIcon} />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="0901 234 567"
                                value={formData.phone}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Password Row */}
                    <div className={styles.passwordRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Xác nhận mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showConfirmPassword ? <EyeOff className={styles.eyeIcon} /> : <Eye className={styles.eyeIcon} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className={styles.termsRow}>
                        <input
                            type="checkbox"
                            id="agreeTerms"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <label htmlFor="agreeTerms" className={styles.termsLabel}>
                            Tôi đồng ý với{' '}
                            <Link to="/terms-of-service" className={styles.termsLink}>Điều khoản dịch vụ</Link>
                            {' '}và{' '}
                            <Link to="/privacy-policy" className={styles.termsLink}>Chính sách bảo mật</Link>
                        </label>
                    </div>

                    {/* Sign Up Button */}
                    <button type="submit" className={styles.signUpBtn}>
                        Đăng Ký <CheckCircle className={styles.checkIcon} />
                    </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span className={styles.dividerLine}></span>
                    <span className={styles.dividerText}>HOẶC THAM GIA VỚI</span>
                    <span className={styles.dividerLine}></span>
                </div>

                {/* Tour Code Button */}
                <button className={styles.tourCodeBtn}>
                    <Ticket className={styles.tourCodeIcon} />
                    Đăng ký bằng Mã Tour
                </button>

                {/* Sign In Link */}
                <p className={styles.signInText}>
                    Đã có tài khoản? <Link to="/login" className={styles.signInLink}>Đăng nhập</Link>
                </p>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link to="/privacy-policy" onClick={scrollToTop}>Chính sách bảo mật</Link>
                    <Link to="/terms-of-service" onClick={scrollToTop}>Điều khoản dịch vụ</Link>
                    <Link to="/help" onClick={scrollToTop}>Hỗ trợ</Link>
                </div>
                <p className={styles.copyright}>© 2026 Flourish Travel. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Register;
