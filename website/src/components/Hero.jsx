import React, { useState } from 'react';
import { MapPin, Calendar, Hash, Plane, Home, GraduationCap } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('flights');

    return (
        <div className={styles.heroSection}>
            {/* Background Image with Overlay */}
            <div className={styles.bgContainer}>
                <img
                    src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Students traveling"
                    className={styles.bgImage}
                />
                <div className={styles.bgOverlay}></div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.heroText}>
                    <h1 className={styles.title}>
                        Flourish Tourism
                    </h1>
                    <p className={styles.subtitle}>
                        "Slogan"
                    </p>
                </div>

                {/* Search Box */}
                <div className={styles.searchBox} style={{ animationDelay: '0.2s' }}>
                    {/* Tabs */}
                    <div className={styles.tabs}>
                        {[
                            { id: 'flights', label: 'Flights', icon: Plane },
                            { id: 'stays', label: 'Stays', icon: Home },
                            { id: 'programs', label: 'Programs', icon: GraduationCap },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
                            >
                                <tab.icon className={styles.tabIcon} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className={styles.activeIndicator}></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className={styles.searchInputsRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Điểm khởi hành</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Điểm khởi hành"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Điểm đến</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Điểm đến"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Ngày khởi hành</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Ngày khởi hành"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Số ngày của tour</label>
                            <div className={styles.inputWrapper}>
                                <Hash className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="#"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button className={styles.searchButton}>
                                TÌM TOUR
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Hero;
