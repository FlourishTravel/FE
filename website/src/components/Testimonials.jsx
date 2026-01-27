import React from 'react';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
    const reviews = [
        {
            id: 1,
            name: 'Sarah Jenkins',
            role: 'Studying in London',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
            text: '"Flourish made my move to London so seamless. The student housing they found was incredible and right next to campus."',
            stars: 5,
        },
        {
            id: 2,
            name: 'David Chen',
            role: 'Parent from Singapore',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
            text: '"As a parent, I was worried about my son going to Australia. Flourish\'s safety checks and community groups gave us peace of mind."',
            stars: 5,
        },
        {
            id: 3,
            name: 'Marcus Johnson',
            role: 'Studying in Boston',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
            text: '"The flight deals for students are unbeatable. I saved over $300 on my ticket to Boston compared to other sites."',
            stars: 5,
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Trusted by Students & Parents
                    </h2>
                </div>

                <div className={styles.grid}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.card}>
                            <div className={styles.stars}>
                                {[...Array(review.stars)].map((_, i) => (
                                    <Star key={i} className={styles.starIcon} />
                                ))}
                            </div>

                            <p className={styles.reviewText}>
                                {review.text}
                            </p>

                            <div className={styles.author}>
                                <img
                                    src={review.image}
                                    alt={review.name}
                                    className={styles.authorImage}
                                />
                                <div>
                                    <h4 className={styles.authorName}>{review.name}</h4>
                                    <p className={styles.authorRole}>{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
