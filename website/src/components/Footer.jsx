import React from 'react';
import styles from './Footer.module.css';
import logo from '../assets/flourish_touris.png';

const Footer = () => {
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
                        <h3 className={styles.footerTitle}>Trợ giúp</h3>
                        <ul className={styles.footerList}>
                            <li><a href="#" className={styles.footerLink}>Cài đặt về quyền riêng tư</a></li>
                            <li><a href="#" className={styles.footerLink}>Đăng nhập</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle}>Chính sách cookie</h3>
                        <ul className={styles.footerList}>
                            <li><a href="#" className={styles.footerLink}>Chính sách về quyền riêng tư</a></li>
                            <li><a href="#" className={styles.footerLink}>Điều kiện dịch vụ</a></li>
                            <li><a href="#" className={styles.footerLink}>Các chi tiết về Công ty</a></li>
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
