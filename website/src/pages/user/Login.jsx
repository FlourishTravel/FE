import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './Login.module.css';
import logo from '../../assets/LogoFlourish\'.jpg';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const {
        login,
        loginWithApi,
        loginWithGoogle,
        checkCredentials,
        MOCK_USER,
        checkAdminCredentials,
        MOCK_ADMIN,
        checkGuideCredentials,
        MOCK_GUIDE,
    } = useAuth();
    const googleBtnRef = useRef(null);
    const [googleBtnWidth, setGoogleBtnWidth] = useState(320);

    useEffect(() => {
        const el = googleBtnRef.current;
        if (!el) return undefined;
        const apply = () => {
            const w = Math.floor(el.getBoundingClientRect().width);
            setGoogleBtnWidth(Math.min(400, Math.max(200, w || 320)));
        };
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Điều hướng sau khi đăng nhập theo role (đã được AuthContext chuẩn hoá: admin/guide/user)
    const redirectByRole = (role) => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'guide') navigate('/guide/dashboard');
        else navigate('/profile');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // 1) Ưu tiên gọi BE thật (POST /api/auth/login)
            const apiUser = await loginWithApi(email, password);
            redirectByRole(apiUser?.role);
            return;
        } catch (err) {
            // 2) Fallback sang mock CHỈ khi BE không kết nối được (network error / 5xx),
            //    giúp dev demo UI khi backend đang tắt.
            const isNetworkError = !err?.status || err.status >= 500;
            if (isNetworkError) {
                if (checkAdminCredentials(email, password)) {
                    login(MOCK_ADMIN);
                    navigate('/admin');
                    return;
                }
                if (checkGuideCredentials(email, password)) {
                    login(MOCK_GUIDE);
                    navigate('/guide/dashboard');
                    return;
                }
                if (checkCredentials(email, password)) {
                    login(MOCK_USER);
                    navigate('/profile');
                    return;
                }
                setError(
                    'Không kết nối được máy chủ. Tài khoản demo offline:\n' +
                    'User: demo@flourish.com / flourish123\n' +
                    'Admin: admin@flourish.com / admin123\n' +
                    'Guide: guide@flourish.com / guide123'
                );
            } else {
                // BE trả lỗi (401/400) -> hiển thị message từ server
                setError(err?.message || 'Email hoặc mật khẩu không đúng.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setSubmitting(true);
        try {
            const idToken = credentialResponse?.credential;
            if (!idToken) throw new Error('Không nhận được id_token từ Google');
            const apiUser = await loginWithGoogle(idToken);
            redirectByRole(apiUser?.role);
        } catch (err) {
            setError(err?.message || 'Đăng nhập Google thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <div className={styles.container}>
            {/* Background decorations */}
            <div className={styles.bgDecorLeft}></div>
            <div className={styles.bgDecorRight}></div>

            {/* Back Button */}
            <button onClick={() => navigate(-1)} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Quay lại
            </button>

            {/* Login Card */}
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Flourish Logo" className={styles.logo} />
                </div>

                {/* Title */}
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Please enter your details to sign in.</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Email Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        <div className={styles.forgotPassword}>
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                    </div>

                    {error && <p className={styles.errorMsg}>{error}</p>}

                    {/* Sign In Button */}
                    <button type="submit" className={styles.signInBtn} disabled={submitting}>
                        {submitting ? 'Đang đăng nhập...' : 'Sign In'} <ArrowRight className={styles.arrowIcon} />
                    </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span className={styles.dividerLine}></span>
                    <span className={styles.dividerText}>OR CONTINUE WITH</span>
                    <span className={styles.dividerLine}></span>
                </div>

                <div className={styles.googleBtnWrap} ref={googleBtnRef}>
                    {GOOGLE_CLIENT_ID ? (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Sign-In bị hủy hoặc lỗi.')}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            width={googleBtnWidth}
                            text="signin_with"
                            shape="rectangular"
                        />
                    ) : (
                        <button type="button" className={styles.tourCodeBtn} disabled>
                            Chưa cấu hình VITE_GOOGLE_CLIENT_ID
                        </button>
                    )}
                </div>

                {/* Sign Up Link */}
                <p className={styles.signUpText}>
                    Don't have an account? <Link to="/register" className={styles.signUpLink}>Sign up</Link>
                </p>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link to="/privacy-policy" onClick={scrollToTop}>Privacy Policy</Link>
                    <Link to="/terms-of-service" onClick={scrollToTop}>Terms of Service</Link>
                    <Link to="/help" onClick={scrollToTop}>Support</Link>
                </div>
                <p className={styles.copyright}>© 2026 Flourish Travel. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Login;
