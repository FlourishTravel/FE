import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../assets/flourish_touris.png';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <footer className={styles.footer}>
            {/* Background Graphic */}
            <div className={styles.bgGraphic}>
                <svg viewBox="0 0 100 100" className={styles.graphicSvg}>
                    <circle cx="90" cy="10" r="20" />
                </svg>
            </div>

            <div className={styles.container}>
                {/* Logo Icon */}
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Flourish Logo" className={styles.logo} />
                </div>

                <h2 className={styles.title}>
                    Ready to Flourish?
                </h2>

                <p className={styles.description}>
                    Join our newsletter for student travel hacks, scholarship alerts, and destination guides.
                </p>

                <div className={styles.subscribeContainer}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={styles.emailInput}
                    />
                    <button className={styles.subscribeBtn}>
                        Subscribe
                    </button>
                </div>

                {/* Footer Links Grid */}
                <div className={styles.footerGrid}>
                    <div className={styles.footerColumn}>
                        <ul className={styles.footerList}>
                            <li><Link to="/help" onClick={scrollToTop} className={styles.footerLink}>Trợ giúp</Link></li>
                            <li><Link to="/privacy-settings" onClick={scrollToTop} className={styles.footerLink}>Cài đặt về quyền riêng tư</Link></li>
                            <li><Link to="/login" onClick={scrollToTop} className={styles.footerLink}>Đăng nhập</Link></li>
                        </ul>
                    </div>

                    <div className={styles.footerColumn}>
                        <ul className={styles.footerList}>
                            <li><Link to="/cookie-policy" onClick={scrollToTop} className={styles.footerLink}>Chính sách cookie</Link></li>
                            <li><Link to="/privacy-policy" onClick={scrollToTop} className={styles.footerLink}>Chính sách về quyền riêng tư</Link></li>
                            <li><Link to="/terms-of-service" onClick={scrollToTop} className={styles.footerLink}>Điều kiện dịch vụ</Link></li>
                            <li><Link to="/company-details" onClick={scrollToTop} className={styles.footerLink}>Các chi tiết về Công ty</Link></li>
                        </ul>
                    </div>


                    {/* Dropdown Items Column */}
                    <div className={styles.dropdownColumn}>
                        <div className={styles.dropdownItem}>
                            <h3 className={styles.footerTitle}>
                                Khám phá
                                <span className={styles.dropdownIcon}>▼</span>
                            </h3>
                        </div>
                        <div className={styles.dropdownItem}>
                            <h3 className={styles.footerTitle}>
                                Công ty
                                <span className={styles.dropdownIcon}>▼</span>
                            </h3>
                        </div>
                        <div className={styles.dropdownItem}>
                            <h3 className={styles.footerTitle}>
                                Đối tác
                                <span className={styles.dropdownIcon}>▼</span>
                            </h3>
                        </div>
                        <div className={styles.dropdownItem}>
                            <h3 className={styles.footerTitle}>
                                Hành trình
                                <span className={styles.dropdownIcon}>▼</span>
                            </h3>
                        </div>
                        <div className={styles.dropdownItem}>
                            <h3 className={styles.footerTitle}>
                                Các trang mạng Quốc tế
                                <span className={styles.dropdownIcon}>▼</span>
                            </h3>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div className={styles.copyright}>
                        &copy; 2026 Flourish Travel. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
