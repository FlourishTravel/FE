import React from 'react';
import styles from './TermsOfService.module.css';
import heroImage from '../assets/Terms-Services.png';

const TermsOfService = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Terms & Services" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Terms & Services</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: Introduction */}
                <section id="introduction" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. INTRODUCTION</h2>
                    <p className={styles.sectionText}>
                        The Flourish Travel Website ("Website") is operated by <strong>Flourish Tourism</strong> to provide information and support for customers who have participated or will participate in Flourish tours.
                    </p>
                    <p className={styles.sectionText}>
                        This Website is not an e-commerce platform, does not sell airline tickets, does not book accommodation services, and does not process online payments.
                    </p>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>Important Notice</h4>
                        <p className={styles.importantText}>
                            By accessing and using this Website, you confirm that you have read, understood, and agreed to the following Terms & Services.
                        </p>
                    </div>
                </section>

                {/* Section 2: Target Users */}
                <section id="target-users" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. TARGET USERS</h2>
                    <p className={styles.sectionText}>
                        This Website is intended for:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Customers who have purchased Flourish tours</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Individuals interested in Flourish tour information</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Internal staff (leaders, tour guides, operators)</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>Access Denial Rights</h4>
                        <p className={styles.warningText}>
                            Flourish reserves the right to refuse or terminate access if misuse is detected.
                        </p>
                    </div>
                </section>

                {/* Section 3: Scope of Services */}
                <section id="scope-of-services" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. SCOPE OF SERVICES ON WEBSITE</h2>
                    <p className={styles.sectionText}>
                        The Website provides:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Tour information & itineraries</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Destination introduction content</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Announcements & tour-related updates</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Contact channels with Flourish</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Internal areas (if access is granted)</span>
                        </li>
                    </ul>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>👉 Please Note</h4>
                        <p className={styles.importantText}>
                            This Website is for informational and operational support purposes only and does not replace the official tour contract.
                        </p>
                    </div>
                </section>

                {/* Section 4: Account & Access Rights */}
                <section id="account-access" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. ACCOUNT & ACCESS RIGHTS</h2>
                    <p className={styles.sectionText}>
                        Some content on the Website may require:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>An account issued by Flourish</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>A valid tour code</span>
                        </li>
                    </ul>

                    <p className={styles.sectionText} style={{ marginTop: '20px' }}>
                        <strong>Users are responsible for:</strong>
                    </p>
                    <ol className={styles.numberedList}>
                        <li>Keeping login information confidential</li>
                        <li>Not sharing accounts with third parties</li>
                        <li>Immediately notifying Flourish if unauthorized access is detected</li>
                    </ol>
                </section>

                {/* Section 5: Content & Accuracy */}
                <section id="content-accuracy" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. CONTENT & INFORMATION ACCURACY</h2>
                    <p className={styles.sectionText}>
                        Flourish strives to ensure that information on the Website is accurate and up-to-date, however:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Schedules, times, and activities may change due to objective factors</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Website content may be adjusted without prior notice</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>Information Priority</h4>
                        <p className={styles.warningText}>
                            In case of discrepancies, information provided directly by the tour leader or tour operator will take precedence.
                        </p>
                    </div>
                </section>

                {/* Section 6: Prohibited Actions */}
                <section id="prohibited-actions" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. PROHIBITED ACTIONS</h2>
                    <p className={styles.sectionText}>
                        Users are not permitted to:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Copy or distribute Website content without permission</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Use the Website for unauthorized commercial purposes</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Interfere with or damage the system or data</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Post content that violates laws or public morality</span>
                        </li>
                    </ul>

                    <div className={styles.warningBox}>
                        <h4 className={styles.warningTitle}>⚠️ Warning</h4>
                        <p className={styles.warningText}>
                            Flourish reserves the right to take action in accordance with current laws if violations are detected.
                        </p>
                    </div>
                </section>

                {/* Section 7: Intellectual Property */}
                <section id="intellectual-property" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. INTELLECTUAL PROPERTY</h2>
                    <p className={styles.sectionText}>
                        All of the following:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Content</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Images</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Design</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Flourish brand</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        are owned by <strong>Flourish Tourism</strong> or its legitimate partners.
                    </p>

                    <div className={styles.importantBox}>
                        <h4 className={styles.importantTitle}>Reuse Requirements</h4>
                        <p className={styles.importantText}>
                            Any reuse in any form requires written consent.
                        </p>
                    </div>
                </section>

                {/* Section 8: Limitation of Liability */}
                <section id="liability-limitation" className={styles.section}>
                    <h2 className={styles.sectionTitle}>8. LIMITATION OF LIABILITY</h2>
                    <p className={styles.sectionText}>
                        Flourish is not responsible for:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Damages arising from users using information for unintended purposes</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Technical issues beyond control (network, devices, browsers)</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Third-party services linked to or mentioned on the Website</span>
                        </li>
                    </ul>
                </section>

                {/* Section 9: Third-Party Links */}
                <section id="third-party-links" className={styles.section}>
                    <h2 className={styles.sectionTitle}>9. THIRD-PARTY LINKS</h2>
                    <p className={styles.sectionText}>
                        The Website may contain links to:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Maps</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Transportation services</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Partner information pages</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Flourish is not responsible for the content or policies of these external websites.
                    </p>
                </section>

                {/* Section 10: Changes to Terms */}
                <section id="terms-changes" className={styles.section}>
                    <h2 className={styles.sectionTitle}>10. CHANGES TO TERMS</h2>
                    <p className={styles.sectionText}>
                        Flourish reserves the right to:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Update or modify the Terms & Services</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Publish new versions on the Website</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        Continued use of the Website after terms are changed means you accept the new content.
                    </p>
                </section>

                {/* Section 11: Applicable Law */}
                <section id="applicable-law" className={styles.section}>
                    <h2 className={styles.sectionTitle}>11. APPLICABLE LAW</h2>
                    <p className={styles.sectionText}>
                        These terms are governed by the <strong>laws of Vietnam</strong>.
                    </p>
                    <p className={styles.sectionText}>
                        Any disputes (if any) will be resolved preferably through negotiation before being referred to competent authorities.
                    </p>
                </section>

                {/* Section 12: Contact Information */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>12. CONTACT INFORMATION</h2>
                    <p className={styles.sectionText}>
                        For any questions regarding Terms & Services, please contact:
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
                                <div className={styles.contactLabel}>Address:</div>
                                <span className={styles.contactAddress}>
                                    Flourish Tourism – Vietnam
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
