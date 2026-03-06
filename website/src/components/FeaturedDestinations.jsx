import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Map } from 'lucide-react';
import styles from './FeaturedDestinations.module.css';

const FeaturedDestinations = () => {
    const destinations = [
        {
            id: 1,
            title: 'HANOI - SON LA - DIEN BIEN - MAI CHAU',
            country: 'Country: VIET NAM',
            duration: '5 DAYS - 4 NIGHTS',
            location: '',
            image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
        {
            id: 2,
            title: 'THE KINGDOM OF CAMBODIA: SIEM REAP - ANGKOR THOM - PHNOM PENH',
            description: 'A 4-day, 3-night tour of Cambodia covering Siem Reap, Angkor Thom, and Phnom Penh is a journey of exploration through the land of...',
            duration: '4 DAYS - 3 NIGHTS',
            location: 'SIEM REAP - ANGKOR THOM - PHNOM PENH',
            image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
        {
            id: 3,
            title: 'HOI AN - HUE - DA NANG ROAD TRIP',
            description: 'The tour is for those who are passionate about backpacking, those who love adventure, are not afraid of difficulties, have a modern lifestyle...',
            duration: '7 DAYS - 6 NIGHTS',
            location: 'HOI AN - HUE - DA NANG',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
        {
            id: 4,
            title: 'EXPERIENCE LOCAL VILLAGE LIFE IN BALI',
            description: 'One of the most unique experiences in Bali, available exclusively in Alex Tourism\'s tour, is being taken on an exciting motorbike ride by...',
            duration: '4 DAYS - 3 NIGHTS',
            location: 'HCM - BALI',
            image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        SIGNATURE TOURS
                    </h2>
                </div>

                <div className={styles.grid}>
                    {destinations.map((dest) => (
                        <Link key={dest.id} to={`/tours/${dest.id}`} className={styles.cardLink}>
                            <div className={styles.card}>
                                <img
                                    src={dest.image}
                                    alt={dest.title}
                                    className={styles.cardImage}
                                />

                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{dest.title}</h3>

                                    {dest.country && (
                                        <p className={styles.cardSubInfo}>{dest.country}</p>
                                    )}

                                    {dest.description && (
                                        <p className={styles.cardDesc}>{dest.description}</p>
                                    )}

                                    <div className="mt-auto pt-2">
                                        <div className={styles.iconRow}>
                                            <Calendar className={styles.icon} />
                                            <span>: {dest.duration}</span>
                                        </div>

                                        {dest.location && (
                                            <div className={styles.iconRow}>
                                                <Map className={styles.icon} />
                                                <span>: {dest.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className={styles.bottomBanner}>
                SIGN YOUR OWN TOUR HERE!
            </div>
        </section>
    );
};

export default FeaturedDestinations;
