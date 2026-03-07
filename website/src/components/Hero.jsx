import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import travelImg from '../assets/travel.avif';
import styles from './Hero.module.css';

const Hero = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/tours' + (query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''));
    };

    return (
        <div className={styles.heroSection}>
            <div className={styles.bgContainer}>
                <img
                    src={travelImg}
                    alt="Travel"
                    className={styles.bgImage}
                />
                <div className={styles.bgOverlay}></div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.heroText}>
                    <h1 className={styles.title}>Flourish Tourism</h1>
                    <p className={styles.subtitle}>
                        Khám phá hành trình trải nghiệm — biển, văn hóa và thiên nhiên
                    </p>
                </div>

                <form onSubmit={handleSearch} className={styles.searchBox} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.searchBigRow}>
                        <Search className={styles.searchBigIcon} />
                        <input
                            type="text"
                            placeholder="Tìm tour theo điểm đến, ngày đi, ngân sách... VD: tour biển 5 triệu"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={styles.searchBigInput}
                        />
                        <button type="submit" className={styles.searchButton}>
                            Tìm tour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Hero;
