import React from 'react';
import styles from './CompanyDetails.module.css';

const CompanyDetails = () => {
    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Travel with <span className={styles.heroTitleHighlight}>Purpose</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        We bridge the gap between education and adventure. Flourish Travel
                        empowers students to explore the world, broaden their horizons, and
                        grow through immersive global experiences.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className={styles.missionSection}>
                <div className={styles.missionContainer}>
                    <div className={styles.missionImageWrapper}>
                        <img
                            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80"
                            alt="Students in forest"
                            className={styles.missionImage}
                        />
                        <img
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                            alt="Students group"
                            className={styles.missionImage}
                        />
                    </div>
                    <div className={styles.missionContent}>
                        <span className={styles.missionLabel}>✦ Our Mission</span>
                        <h2 className={styles.missionTitle}>
                            Empowering the next generation of global citizens.
                        </h2>
                        <p className={styles.missionText}>
                            At Flourish Travel, we believe that travel is the best form of education. Our
                            mission is to make international travel accessible, educational, and
                            sustainable for students worldwide. We curate experiences that aren't just
                            about sightseeing, but about cultural immersion and personal growth.
                        </p>
                        <ul className={styles.missionFeatures}>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Sustainable travel practices that respect local communities.
                            </li>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Scholarship programs to support underprivileged students.
                            </li>
                            <li>
                                <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Safety-first approach with 24/7 global support.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>50+</div>
                        <div className={styles.statLabel}>Partner Universities</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>12k</div>
                        <div className={styles.statLabel}>Students Traveled</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>35</div>
                        <div className={styles.statLabel}>Countries Visited</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statNumber}>$2M</div>
                        <div className={styles.statLabel}>Scholarships Awarded</div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className={styles.impactSection}>
                <div className={styles.impactContainer}>
                    <h2 className={styles.impactTitle}>Our Impact</h2>
                    <p className={styles.impactSubtitle}>
                        We measure our success not just in miles traveled, but in lives changed. See how
                        Flourish Travel is making a difference.
                    </p>
                    <div className={styles.impactGrid}>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"
                                    alt="Carbon Offset Initiative"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Environment</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Carbon Offset Initiative</h3>
                                <p className={styles.impactCardText}>
                                    For every flight booked, we plant 5 trees in
                                    deforested regions, ensuring your travel leaves a
                                    green footprint.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Learn more →
                                </a>
                            </div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
                                    alt="Education Access"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Community</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Education Access</h3>
                                <p className={styles.impactCardText}>
                                    We partner with local schools in every destination
                                    to facilitate cultural exchange and provide
                                    educational resources.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Learn more →
                                </a>
                            </div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.imageContainer}>
                                <img
                                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                                    alt="Cultural Preservation"
                                    className={styles.impactCardImage}
                                />
                                <span className={styles.impactCardTag}>Culture</span>
                            </div>
                            <div className={styles.impactCardContent}>
                                <h3 className={styles.impactCardTitle}>Cultural Preservation</h3>
                                <p className={styles.impactCardText}>
                                    Our tours are designed to support local artisans
                                    and preserve intangible cultural heritage sites.
                                </p>
                                <a href="#" className={styles.impactCardLink}>
                                    Learn more →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className={styles.contactContainer}>
                    <div className={styles.contactLeft}>
                        <h2>Contact Us</h2>
                        <p>
                            Have questions about our programs or need
                            support? Our team is available 24/7 to assist
                            you.
                        </p>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Headquarters</h4>
                                    <p>123 Innovation Lane, Suite 400<br />Knowledge District<br />San Francisco, CA 94102</p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Email Us</h4>
                                    <p>
                                        <a href="mailto:support@flourishtravel.com">support@flourishtravel.com</a><br />
                                        <a href="mailto:partnerships@flourishtravel.com">partnerships@flourishtravel.com</a>
                                    </p>
                                </div>
                            </div>
                            <div className={styles.contactItem}>
                                <div className={styles.contactItemIcon}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                </div>
                                <div className={styles.contactItemContent}>
                                    <h4>Call Us</h4>
                                    <p><a href="tel:+18005550199">+1 (800) 555-0199</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.companyInfoCard}>
                        <h3 className={styles.companyInfoTitle}>Company Information</h3>
                        <div className={styles.companyInfoGrid}>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Legal Name</span>
                                <span className={styles.companyInfoValue}>Flourish Global Education Inc.</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Tax Identification Number</span>
                                <span className={styles.companyInfoValue}>US-98-7654321</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Founded</span>
                                <span className={styles.companyInfoValue}>2018</span>
                            </div>
                            <div className={styles.companyInfoItem}>
                                <span className={styles.companyInfoLabel}>Legal Representative</span>
                                <span className={styles.companyInfoValue}>Sarah Jenkins, CEO</span>
                            </div>
                            <div className={`${styles.companyInfoItem} ${styles.companyInfoFull}`}>
                                <span className={styles.companyInfoLabel}>Operating License</span>
                                <span className={styles.companyInfoValue}>
                                    International Tour Operator License (ITO-2023-8456). Certified by the Global Sustainable Tourism Council.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CompanyDetails;
