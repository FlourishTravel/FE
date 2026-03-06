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
                   Khám phá những điểm đến ít người biết, hành trình khác biệt và cảm hứng du lịch dành cho thế hệ trẻ năng động.
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
                    {/* Column 1: GET STARTED */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle} style={{ color: '#0099ff', letterSpacing: '2px' }}>GET STARTED</h3>
                        <ul className={styles.footerList}>
                            <li><Link to="/get-app" onClick={scrollToTop} className={styles.footerLink}>Get the app</Link></li>
                            <li><Link to="/login" onClick={scrollToTop} className={styles.footerLink}>Log in</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: ABOUT */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle} style={{ color: '#0099ff', letterSpacing: '2px' }}>ABOUT</h3>
                        <ul className={styles.footerList}>
                            <li><Link to="/about" onClick={scrollToTop} className={styles.footerLink}>About us</Link></li>
                            <li><Link to="/careers" onClick={scrollToTop} className={styles.footerLink}>Careers</Link></li>
                            <li><Link to="/news" onClick={scrollToTop} className={styles.footerLink}>News & press</Link></li>
                            <li><Link to="/stories" onClick={scrollToTop} className={styles.footerLink}>Stories</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: HELP & SUPPORT */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle} style={{ color: '#0099ff', letterSpacing: '2px' }}>HELP & SUPPORT</h3>
                        <ul className={styles.footerList}>
                            <li><Link to="/help" onClick={scrollToTop} className={styles.footerLink}>Help Center</Link></li>
                            <li><Link to="/contact" onClick={scrollToTop} className={styles.footerLink}>Contact us</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: PARTNERS */}
                    <div className={styles.footerColumn}>
                        <h3 className={styles.footerTitle} style={{ color: '#0099ff', letterSpacing: '2px' }}>PARTNERS</h3>
                        <ul className={styles.footerList}>
                            <li><span className={styles.footerLink}>Mixpanel</span></li>
                            <li><span className={styles.footerLink}>Location IQ</span></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <div className={`${styles.copyright} flex flex-wrap gap-2 md:gap-4 items-center`}>
                        <span>&copy; 2026 Flourish Travel</span>
                        <span>·</span>
                        <Link to="/terms-of-service" onClick={scrollToTop} className={styles.footerLink}>Terms</Link>
                        <span>·</span>
                        <Link to="/privacy-policy" onClick={scrollToTop} className={styles.footerLink}>Privacy</Link>
                        <span>·</span>
                        <Link to="/cookie-policy" onClick={scrollToTop} className={styles.footerLink}>Cookies</Link>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0 text-white items-center">
                        <a href="#" aria-label="TikTok" className="hover:opacity-70 transition-opacity">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.45-2.42 5.92-1.55 1.48-3.79 2.27-5.96 2.06-2.22-.21-4.27-1.39-5.59-3.09-1.31-1.73-1.84-3.95-1.46-6.07.39-2.14 1.6-4.04 3.4-5.11 1.79-1.07 4.02-1.34 6-.88V13.8c-1.06-.31-2.23-.1-3.11.49-.86.58-1.36 1.6-1.35 2.64.01 1.05.51 2.06 1.37 2.62.86.57 2.04.79 3.09.48 1.04-.3 1.87-1.11 2.19-2.16.14-.49.19-1.01.19-1.52V5.41c-.01-1.8-.01-3.6-.01-5.39z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="#" aria-label="LinkedIn" className="hover:opacity-70 transition-opacity">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
