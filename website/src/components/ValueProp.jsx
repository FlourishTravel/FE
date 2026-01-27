import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import styles from './ValueProp.module.css';

const ValueProp = () => {
    return (
        <section className={styles.section}>
            {/* Decorative blobs */}
            <div className={styles.blob}></div>

            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* Left Content */}
                    <div>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot}></span>
                            Student Life Support
                        </div>

                        <h2 className={styles.title}>
                            More than just a flight. <br />
                            <span className={styles.titleHighlight}>We help you settle in.</span>
                        </h2>

                        <p className={styles.description}>
                            Moving abroad is a big step. Flourish Travel connects you with local student communities, helps with visa guidance, and ensures you have a safe, welcoming place to land.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIconWrapper}>
                                    <Users className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h3 className={styles.featureTitle}>Community Connection</h3>
                                    <p className={styles.featureText}>Meet fellow students before you even arrive.</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featureIconWrapper}>
                                    <ShieldCheck className={styles.featureIcon} />
                                </div>
                                <div>
                                    <h3 className={styles.featureTitle}>Verified Safety</h3>
                                    <p className={styles.featureText}>All stays and experiences are vetted for student safety.</p>
                                </div>
                            </div>
                        </div>

                        <button className={styles.learnMoreBtn}>
                            Learn about our support
                        </button>
                    </div>

                    {/* Right Image Collage */}
                    <div className={styles.collageContainer}>
                        {/* Top image */}
                        <div className={styles.topImageWrapper}>
                            <img
                                src="https://images.unsplash.com/photo-1529156069896-85932e1af680?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students laughing together"
                                className={styles.topImage}
                            />
                        </div>

                        {/* Bottom image */}
                        <div className={styles.bottomImageWrapper}>
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students studying"
                                className={styles.bottomImage}
                            />
                        </div>

                        {/* Circle graphic */}
                        <div className={styles.circleGraphic}></div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ValueProp;
