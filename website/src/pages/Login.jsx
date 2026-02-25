import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Ticket } from 'lucide-react';
import styles from './Login.module.css';
import logo from '../assets/LogoFlourish\'.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login:', { email, password });
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <div className={styles.container}>
            {/* Background decorations */}
            <div className={styles.bgDecorLeft}></div>
            <div className={styles.bgDecorRight}></div>

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

                    {/* Sign In Button */}
                    <button type="submit" className={styles.signInBtn}>
                        Sign In <ArrowRight className={styles.arrowIcon} />
                    </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span className={styles.dividerLine}></span>
                    <span className={styles.dividerText}>OR CONTINUE WITH</span>
                    <span className={styles.dividerLine}></span>
                </div>

                {/* Tour Code Button */}
                <button className={styles.tourCodeBtn}>
                    <Ticket className={styles.tourCodeIcon} />
                    Sign in with Google
                </button>

                {/* Sign Up Link */}
                <p className={styles.signUpText}>
                    Don't have an account? <Link to="/signup" className={styles.signUpLink}>Sign up</Link>
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
