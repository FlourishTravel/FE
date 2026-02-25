import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PrivacyPolicy.module.css';
import heroImage from '../assets/Privacy-Policy.jpg';

const PrivacyPolicy = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Privacy Policy" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Privacy Policy</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: Introduction */}
                <section id="introduction" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. INTRODUCTION</h2>
                    <p className={styles.sectionText}>
                        Welcome to Flourish Travel. At Flourish, we believe that travel expands the mind and enriches the soul,
                        especially for seniors. We are committed to protecting your personal information and your right to
                        privacy. If you have any questions or concerns about our policy, or our practices with regards to your
                        personal information, please contact us at <a href="mailto:privacy@flourishtravel.com" className={styles.textLink}>privacy@flourishtravel.com</a>.
                    </p>
                    <p className={styles.sectionText}>
                        When you visit our website and use our services, you trust us with your personal information. We take
                        your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain
                        to you in the clearest way possible what information we collect, how we use it, and what rights you have in
                        relation to it.
                    </p>
                </section>

                {/* Section 2: Information We Collect */}
                <section id="information" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. INFORMATION WE COLLECT</h2>

                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>Personal Information</h3>
                        <p className={styles.infoCardText}>
                            Information you voluntarily provide to us when registering at the Website, expressing an interest in obtaining information
                            about us or our products and services.
                        </p>
                        <ul className={styles.featureList}>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Name and Contact Data (Email, Phone Number)</span>
                            </li>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Credentials (Passwords, Security hints)</span>
                            </li>
                            <li className={styles.featureItem}>
                                <span className={styles.featureIcon}></span>
                                <span className={styles.featureText}>Payment Data (Stored securely via Stripe)</span>
                            </li>
                        </ul>
                    </div>

                    <p className={styles.sectionText}>
                        We automatically collect certain information when you visit, use or navigate the Website. This
                        information does not reveal your specific identity (like your name or contact information) but may include
                        device and usage information, such as your IP address, browser and device characteristics, operating
                        system, language preferences, referring URLs, device name, country, location, information about how
                        and when you use our Website and other technical information.
                    </p>
                </section>

                {/* Section 3: How We Use Your Data */}
                <section id="usage" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. HOW WE USE YOUR DATA</h2>
                    <p className={styles.sectionText}>
                        We use personal information collected via our Website for a variety of business purposes described
                        below. We process your personal information for these purposes in reliance on our legitimate business
                        interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance
                        with our legal obligations.
                    </p>

                    <div className={styles.usageGrid}>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>ACCOUNT MANAGEMENT</h4>
                            <p className={styles.usageCardText}>To facilitate account creation and login process and manage user accounts.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>COMMUNICATIONS</h4>
                            <p className={styles.usageCardText}>To send you marketing and promotional communications tailored to your travel interests.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>ORDER FULFILLMENT</h4>
                            <p className={styles.usageCardText}>To fulfill and manage your orders, payments, returns, and exchanges.</p>
                        </div>
                        <div className={styles.usageCard}>
                            <h4 className={styles.usageCardTitle}>SERVICE IMPROVEMENT</h4>
                            <p className={styles.usageCardText}>To request feedback and to contact you about your use of our Website.</p>
                        </div>
                    </div>
                </section>

                {/* Section 4: Cookie Policy */}
                <section id="cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. COOKIE POLICY</h2>
                    <p className={styles.sectionText}>
                        We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store
                        information. Specific information about how we use such technologies and how you can refuse certain
                        cookies is set out in our <Link to="/cookie-policy" className={styles.textLink}>Cookie Notice</Link>.
                    </p>

                    <div className={styles.noteBox}>
                        <span className={styles.noteIcon}>💡</span>
                        <p className={styles.noteText}>
                            <strong>Note:</strong> You can change your cookie preferences at any time by clicking on the "Cookie Settings" link in the footer.
                        </p>
                    </div>
                </section>

                {/* Section 5: Sharing & Disclosure */}
                <section id="sharing" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. SHARING & DISCLOSURE</h2>
                    <p className={styles.sectionText}>
                        We may share your information in the following situations:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services to us.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Business Transfers:</strong> We may share or transfer your information in connection with a merger or acquisition.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law.</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>With Your Consent:</strong> We may share your personal information for any other purpose with your consent.</span>
                        </li>
                    </ul>
                </section>

                {/* Section 6: Data Security */}
                <section id="security" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. DATA SECURITY</h2>
                    <p className={styles.sectionText}>
                        We have implemented appropriate technical and organizational security measures designed to protect
                        the security of any personal information we process. However, please also remember that we cannot
                        guarantee that the internet itself is 100% secure.
                    </p>
                </section>

                {/* Section 7: Contact Us */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. CONTACT US</h2>
                    <p className={styles.sectionText}>
                        If you have questions or comments about this policy, you may email us or contact us by post at:
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
                                <div className={styles.contactLabel}>Office:</div>
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

export default PrivacyPolicy;
