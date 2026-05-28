import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Mission.module.css';
import img1 from '../assets/thai-lan-5n4d-1.jpg';
import img2 from '../assets/thai-lan-5n4d-p2.jpg';
import img3 from '../assets/thai-lan-5n4d-p11-768x514.jpg';

const Mission = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const endX = useRef(0);

    const slides = [
        {
            id: 0,
            image: img1,
            title: 'MEGA ULTIMA SOUTH AMERICA',
            subtitle: '13 Wild Experiences across the continent of extremes.'
        },
        {
            id: 1,
            image: img2,
            title: 'THE UNTAMED AMAZON',
            subtitle: 'Journey deeper into the lungs of the Earth.'
        },
        {
            id: 2,
            image: img3,
            title: 'PATAGONIA EXPEDITIONS',
            subtitle: 'Where ice and fire meet at the edge of the world.'
        }
    ];

    // Auto slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Handle Drag/Swipe unified logic
    const handleDragStart = (clientX) => {
        setIsDragging(true);
        startX.current = clientX;
        endX.current = clientX; // Reset end position
    };

    const handleDragMove = (clientX) => {
        if (!isDragging) return;
        endX.current = clientX;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        const difference = startX.current - endX.current;

        if (difference > 50) {
            // Swipe Left
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        } else if (difference < -50) {
            // Swipe Right
            setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        }
    };

    // Touch Event Handlers
    const handleTouchStart = (e) => handleDragStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => handleDragMove(e.targetTouches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    // Mouse Event Handlers
    const handleMouseDown = (e) => handleDragStart(e.clientX);
    const handleMouseMove = (e) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => {
        if (isDragging) handleDragEnd();
    };

    return (
        <section className={styles.section}>
            {/* Top Column: Carousel Wrapper (Full Width) */}
            <div className={styles.carouselColumn}>
                <div
                    className={styles.carouselContainer}
                    style={{
                        backgroundImage: `url(${slides[currentSlide].image})`,
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={styles.heroOverlay}></div>
                    <div key={currentSlide} className={styles.heroContent}>
                        <h2 className={styles.heroTitle}>{slides[currentSlide].title}</h2>
                        <p className={styles.heroSubtitle}>
                            {slides[currentSlide].subtitle}
                        </p>
                        <Link to="/tours" className={styles.dareBtn}>
                            DO YOU DARE
                        </Link>
                    </div>
                </div>

                {/* Carousel Dots */}
                <div className={styles.carouselDots}>
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></button>
                    ))}
                </div>
            </div>

            <div className={styles.container}>
                {/* Bottom Column: Mission text content and CTA */}
                <div className={styles.missionColumn}>
                    <h3 className={styles.missionTitle}>SỨ MỆNH CỦA CHÚNG TÔI</h3>

                    <p className={styles.missionText}>
                        Chúng tôi <strong>không</strong> tạo ra những chuyến du lịch rập khuôn, những điểm check-in đông đúc hay các danh sách “Top 10” quen thuộc mà ai cũng biết. <strong>Flourish Tourism</strong> được tạo ra để dẫn dắt thế hệ trẻ khám phá những trải nghiệm du lịch ngách, nơi mỗi hành trình đều mang tính cá nhân, mới lạ và đáng nhớ.
                    </p>

                    <p className={styles.missionText}>
                        Chúng tôi tìm đến những góc ít người biết của thế giới — từ những con phố nhỏ đầy văn hoá địa phương, những quán cà phê ẩn mình trong thành phố, đến các hành trình khám phá thiên nhiên hoang sơ và những câu chuyện chỉ người bản địa mới biết.
                    </p>

                    <p className={styles.missionText}>
                        <strong>Flourish Tourism</strong> dành cho những người trẻ tò mò, năng động và thích khám phá khác biệt.
                        Những người tin rằng du lịch không chỉ là đi đến một nơi mới, mà là trải nghiệm, kết nối và trưởng thành qua từng hành trình.
                    </p>

                    <p className={styles.missionText}>
                        Nếu bạn thích những chuyến đi độc đáo, khác biệt và đầy cảm hứng — <strong>Flourish Tourism</strong> chính là nơi hành trình của bạn bắt đầu.
                    </p>

                    <Link to="/tours" className={styles.ctaButton}>
                        Khám Phá Ngay
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Mission;
