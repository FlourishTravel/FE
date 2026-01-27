import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './FeaturedDestinations.module.css';

const FeaturedDestinations = () => {
    const destinations = [
        {
            id: 1,
            name: 'London, UK',
            description: 'Historic academics meet modern living. Home to over 40 universities.',
            image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: '$542',
            tag: 'Trending'
        },
        {
            id: 2,
            name: 'Melbourne, AU',
            description: 'Vibrant culture, coffee, and consistently ranked as the most livable study city.',
            image: 'https://images.unsplash.com/photo-1545044810-9130a6b37b02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: '$890',
        },
        {
            id: 3,
            name: 'Boston, USA',
            description: 'The academic heart of America. A hub for innovation and history.',
            image: 'https://images.unsplash.com/photo-1501229690641-0ca68ccb8465?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: '$320',
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>
                            Top Study Destinations
                        </h2>
                        <p className={styles.subtitle}>
                            Explore the most popular cities for international students.
                        </p>
                    </div>
                    <button className={styles.viewAllBtn}>
                        View all destinations <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className={styles.grid}>
                    {destinations.map((dest) => (
                        <div
                            key={dest.id}
                            className={`${styles.card} group`}
                        >
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className={styles.cardImage}
                            />
                            <div className={styles.cardOverlay}></div>

                            {dest.tag && (
                                <div className={styles.tag}>
                                    {dest.tag}
                                </div>
                            )}

                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{dest.name}</h3>
                                <p className={styles.cardDesc}>
                                    {dest.description}
                                </p>
                                <div className={styles.cardLink}>
                                    View Schools & Stays <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className={styles.mobileViewAllBtn}>
                    View all destinations <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
};

export default FeaturedDestinations;
