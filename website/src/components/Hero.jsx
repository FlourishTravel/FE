import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Plane, Home, GraduationCap } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('study');

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
                        Your Journey to Global Education Starts Here
                    </h1>
                    <p className={styles.subtitle}>
                        Discover flights, stays, and community experiences designed for students moving abroad.
                    </p>
                </div>

                {/* Search Box */}
                <div className={styles.searchBox} style={{ animationDelay: '0.2s' }}>
                    {/* Tabs */}
                    <div className={styles.tabs}>
                        {[
                            { id: 'flights', label: 'Flights', icon: Plane },
                            { id: 'stays', label: 'Stays', icon: Home },
                            { id: 'study', label: 'Programs', icon: GraduationCap },
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

                    {/* Search Inputs */}
                    <div className={styles.searchInputsGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Where to?</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="City, School, or Country"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>When?</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Select dates"
                                    className={styles.textInput}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Travelers</label>
                            <div className={styles.inputWrapper}>
                                <Users className={styles.inputIcon} />
                                <select className={styles.selectInput}>
                                    <option>1 Student</option>
                                    <option>2 Students</option>
                                    <option>Group</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <button className={styles.searchButton}>
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Popular Tags */}
                <div className={styles.popularTags} style={{ animationDelay: '0.4s' }}>
                    <span className={styles.tag}>Harvard University</span>
                    <span className={styles.tag}>University of Melbourne</span>
                    <span className={styles.tag}>LSE London</span>
                    <span className={styles.tag}>Allianz Travel</span>
                </div>
            </div>
        </div>
    );
};

export default Hero;
