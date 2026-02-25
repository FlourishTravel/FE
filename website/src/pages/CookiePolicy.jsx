import React from 'react';
import styles from './CookiePolicy.module.css';
import heroImage from '../assets/Cookies-policy.png';

const CookiePolicy = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                <img src={heroImage} alt="Cookies Policy" className={styles.heroImg} />
            </div>

            {/* Title Section */}
            <div className={styles.titleSection}>
                <h1 className={styles.pageTitle}>Cookies Policy</h1>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section 1: What are Cookies? */}
                <section id="what-are-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. WHAT ARE COOKIES?</h2>
                    <p className={styles.sectionText}>
                        Cookies are small data files stored on your browser or device when you visit the Flourish Travel Website ("Website"). Cookies help the Website remember user actions and preferences, ensure stable and secure operation, and improve the user experience.
                    </p>
                    <p className={styles.sectionText}>
                        Cookies do not contain viruses, do not access personal data on your device, and do not automatically collect sensitive identifying information.
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Remember user actions and preferences</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Ensure stable and secure operation</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Improve the user experience</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        For more information about cookies, please visit: <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className={styles.textLink}>www.allaboutcookies.org</a>
                    </p>
                </section>

                {/* Section 2: Why do we use cookies? */}
                <section id="why-use-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. WHY DO WE USE COOKIES?</h2>
                    <p className={styles.sectionText}>
                        Flourish uses cookies for the following purposes:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Ensure the Website functions correctly</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Enhance the user experience</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Analyze how the Website is used</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Optimize content and performance</span>
                        </li>
                    </ul>

                    <div className={styles.importantBox}>
                        <p className={styles.importantText}>
                            👉 Flourish does not use cookies for advertising purposes that infringe on privacy.
                        </p>
                    </div>
                </section>

                {/* Section 3: Types of Cookies */}
                <section id="types-of-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. TYPES OF COOKIES WE USE</h2>

                    <h3 className={styles.subsectionTitle}>3.1. Strictly Necessary Cookies</h3>
                    <p className={styles.sectionText}>
                        These are mandatory cookies that help the Website function properly. They maintain the browsing session, remember login status, and secure the system.
                    </p>

                    <div className={styles.dangerBox}>
                        <p className={styles.dangerText}>
                            ❗ These cookies cannot be disabled as this will cause the Website to malfunction.
                        </p>
                    </div>

                    <h3 className={styles.subsectionTitle}>3.2. Functional Cookies</h3>
                    <p className={styles.sectionText}>
                        These cookies help remember user preferences (language, region), personalize the content viewing experience, and improve the convenience of using the Website.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.3. Analytics & Performance Cookies</h3>
                    <p className={styles.sectionText}>
                        Flourish uses analytics cookies to monitor website visits, understand how users interact with the website, and detect errors and optimize performance. Data collected is anonymous, aggregated, and not used to identify individuals.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.4. Third-Party Cookies</h3>
                    <p className={styles.sectionText}>
                        In some cases, the website may use cookies from trusted third parties, such as map tools, performance measurement tools, and technical infrastructure services. Flourish does not directly control third-party cookies, and their use is subject to their own policies.
                    </p>
                </section>

                {/* Section 4: What are cookies NOT used for? */}
                <section id="not-used-for" className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. WHAT ARE COOKIES NOT USED FOR?</h2>
                    <p className={styles.sectionText}>
                        Flourish is committed to <strong>NOT</strong> using cookies to:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Tracking users outside the Website</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Selling or sharing data with advertisers</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Collecting sensitive information (ID cards, passports, financial information)</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}>Building personal advertising profiles</span>
                        </li>
                    </ul>
                </section>

                {/* Section 5: Managing cookies */}
                <section id="managing-cookies" className={styles.section}>
                    <h2 className={styles.sectionTitle}>5. MANAGING AND CONTROLLING COOKIES</h2>
                    <p className={styles.sectionText}>
                        You have the right to accept all cookies, reject unnecessary cookies, or delete saved cookies. You can change cookie settings through web browser (Chrome, Edge, Safari, Firefox…) or banner cookies displayed on the first visit to the Website (if any).
                    </p>

                    <div className={styles.warningBox}>
                        <p className={styles.warningText}>
                            ⚠️ Note: Disabling some cookies may affect your website experience.
                        </p>
                    </div>
                </section>

                {/* Section 6: Storage Time */}
                <section id="storage-time" className={styles.section}>
                    <h2 className={styles.sectionTitle}>6. COOKIE STORAGE TIME</h2>
                    <p className={styles.sectionText}>
                        Cookies can be:
                    </p>
                    <ul className={styles.featureList}>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Session Cookies:</strong> automatically deleted when you close your browser</span>
                        </li>
                        <li className={styles.featureItem}>
                            <span className={styles.featureIcon}></span>
                            <span className={styles.featureText}><strong>Persistent Cookies:</strong> stored for a specific period to remember your preferences</span>
                        </li>
                    </ul>
                    <p className={styles.sectionText}>
                        The storage time depends on the intended use of each type of cookie.
                    </p>
                </section>

                {/* Section 7: Policy Changes */}
                <section id="policy-changes" className={styles.section}>
                    <h2 className={styles.sectionTitle}>7. CHANGES TO THE COOKIE POLICY</h2>
                    <p className={styles.sectionText}>
                        Flourish may update the Cookie Policy to adapt to legal changes, improve the Website, and adjust the technology used. New versions will be published on the Website and will be effective immediately upon publication.
                    </p>
                </section>

                {/* Section 8: Contact */}
                <section id="contact" className={styles.section}>
                    <h2 className={styles.sectionTitle}>8. CONTACT</h2>
                    <p className={styles.sectionText}>
                        If you have any questions regarding the Cookie Policy, please contact:
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
                                <div className={styles.contactLabel}>Address:</div>
                                <span className={styles.contactAddress}>Flourish Tourism – Vietnam</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CookiePolicy;
