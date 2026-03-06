import React, { useState } from 'react';
import { MapPin, Calendar, Hash, Plane, Home, GraduationCap } from 'lucide-react';
import travelImg from '../assets/travel.avif';
import styles from './Hero.module.css';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('flights');

    return (
        <div className={styles.heroSection}>
            {/* Background Image with Overlay */}
            <div className={styles.bgContainer}>
                <img
                    src={travelImg}
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
