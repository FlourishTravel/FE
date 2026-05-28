import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Globe, Award, Clock, Users, ChevronRight, Search, Heart } from 'lucide-react';
import styles from './OurGuides.module.css';

const TOUR_GUIDES = [
    {
        id: 1,
        name: 'Trần Bình',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
        role: 'Senior Tour Guide',
        location: 'Bangkok – Pattaya, Thái Lan',
        rating: 4.9,
        reviewCount: 218,
        toursCompleted: 156,
        experience: '5 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Thái'],
        specialties: ['Ẩm thực', 'Văn hóa', 'Chữa lành'],
        bio: 'Chuyên gia dẫn tour Bangkok – Pattaya với 5 năm kinh nghiệm. Bình nổi tiếng với phong cách dẫn tour "chill healing", giúp du khách tận hưởng từng khoảnh khắc thay vì chạy theo lịch trình.',
        featuredTour: 'BANGKOK - PATAYA',
        featuredTourId: 1,
        badges: ['Top Guide 2025', 'Chứng nhận Bền vững'],
        verified: true,
    },
    {
        id: 2,
        name: 'Nguyễn Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        role: 'Cultural Experience Guide',
        location: 'Bangkok – Pattaya, Thái Lan',
        rating: 4.8,
        reviewCount: 175,
        toursCompleted: 120,
        experience: '4 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        specialties: ['Nghệ thuật', 'Nhiếp ảnh', 'Local food'],
        bio: 'Minh Anh là hướng dẫn viên chuyên về trải nghiệm văn hóa và nghệ thuật đương đại. Cô đặc biệt giỏi đưa đoàn đến những quán cafe ẩn và gallery nghệ thuật ít người biết tại Bangkok.',
        featuredTour: 'BANGKOK - PATAYA',
        featuredTourId: 1,
        badges: ['Rising Star 2025'],
        verified: true,
    },
    {
        id: 3,
        name: 'Lê Hoàng Phúc',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        role: 'Adventure Guide',
        location: 'Bangkok – Pattaya, Thái Lan',
        rating: 4.7,
        reviewCount: 142,
        toursCompleted: 98,
        experience: '3 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Thái'],
        specialties: ['Phiêu lưu', 'Biển đảo', 'Nightlife'],
        bio: 'Phúc là guide trẻ tuổi, năng động, chuyên dẫn tour đảo Coral và các hoạt động thể thao nước tại Pattaya. Anh cũng là chuyên gia về nightlife Bangkok an toàn và thú vị.',
        featuredTour: 'BANGKOK - PATAYA',
        featuredTourId: 1,
        badges: ['Chứng nhận Cứu hộ'],
        verified: true,
    },
    {
        id: 4,
        name: 'Phạm Thùy Linh',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
        role: 'Wellness & Healing Guide',
        location: 'Bangkok – Pattaya, Thái Lan',
        rating: 5.0,
        reviewCount: 89,
        toursCompleted: 64,
        experience: '2 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        specialties: ['Wellness', 'Spa & Massage', 'Yoga'],
        bio: 'Linh chuyên về các tour chữa lành và wellness. Mỗi hành trình cùng Linh đều bao gồm trải nghiệm spa Thái chính hiệu, buổi yoga sáng trên bãi biển và các hoạt động mindfulness.',
        featuredTour: 'BANGKOK - PATAYA',
        featuredTourId: 1,
        badges: ['Wellness Certified'],
        verified: true,
    },
    {
        id: 5,
        name: 'Võ Thanh Tùng',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        role: 'Food & Culture Guide',
        location: 'Siem Reap – Phnom Penh, Campuchia',
        rating: 4.8,
        reviewCount: 103,
        toursCompleted: 78,
        experience: '4 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Khmer'],
        specialties: ['Ẩm thực', 'Lịch sử', 'Khám phá'],
        bio: 'Tùng là chuyên gia về ẩm thực và lịch sử Campuchia. Anh sẽ đưa bạn khám phá những quán ăn gia đình bản địa và kể những câu chuyện hấp dẫn về đế chế Angkor.',
        featuredTour: 'CAMPUCHIA: SIEM REAP - PHNOM PENH',
        featuredTourId: 2,
        badges: ['History Expert'],
        verified: true,
    },
    {
        id: 6,
        name: 'Đặng Thị Mai',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        role: 'Eco & Sustainable Guide',
        location: 'Hội An – Huế – Đà Nẵng',
        rating: 4.9,
        reviewCount: 156,
        toursCompleted: 110,
        experience: '6 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp'],
        specialties: ['Bền vững', 'Làng nghề', 'Xe máy'],
        bio: 'Mai là hướng dẫn viên lâu năm nhất của Flourish với 6 năm kinh nghiệm dẫn tour miền Trung. Cô đặc biệt yêu thích du lịch bền vững và hỗ trợ cộng đồng địa phương.',
        featuredTour: 'HỘI AN – HUẾ – ĐÀ NẴNG',
        featuredTourId: 3,
        badges: ['Top Guide 2024', 'Eco Champion'],
        verified: true,
    },
];

const SPECIALTIES_FILTER = ['Tất cả', 'Ẩm thực', 'Văn hóa', 'Phiêu lưu', 'Wellness', 'Bền vững', 'Nghệ thuật'];

const OurGuides = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [savedGuides, setSavedGuides] = useState([]);

    const toggleSave = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedGuides(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const filteredGuides = TOUR_GUIDES.filter((guide) => {
        const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Tất cả' ||
            guide.specialties.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
        return matchesSearch && matchesFilter;
    });

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>
                        <Award className={styles.heroBadgeIcon} />
                        Đội ngũ chuyên nghiệp
                    </span>
                    <h1 className={styles.heroTitle}>Hướng Dẫn Viên Của Chúng Tôi</h1>
                    <p className={styles.heroSubtitle}>
                        Những người bạn đồng hành tận tâm, trẻ trung và đầy kinh nghiệm — sẵn sàng biến mỗi hành trình thành kỷ niệm đáng nhớ.
                    </p>

                    {/* Search Bar */}
                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm hướng dẫn viên theo tên hoặc điểm đến..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                {/* Filter Pills */}
                <div className={styles.filterSection}>
                    <div className={styles.filterRow}>
                        {SPECIALTIES_FILTER.map((filter) => (
                            <button
                                key={filter}
                                className={`${styles.filterPill} ${activeFilter === filter ? styles.filterPillActive : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <p className={styles.resultCount}>
                        Hiển thị <strong>{filteredGuides.length}</strong> hướng dẫn viên
                    </p>
                </div>

                {/* Guide Cards Grid */}
                <div className={styles.grid}>
                    {filteredGuides.map((guide) => (
                        <Link
                            key={guide.id}
                            to={`/our-guides/${guide.id}`}
                            className={styles.cardLink}
                        >
                            <article className={styles.card}>
                                {/* Card Header with Image */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatarWrap}>
                                        <img
                                            src={guide.avatar}
                                            alt={guide.name}
                                            className={styles.avatar}
                                        />
                                        {guide.verified && (
                                            <span className={styles.verifiedBadge} title="Đã xác minh">✓</span>
                                        )}
                                    </div>
                                    <button
                                        className={`${styles.heartBtn} ${savedGuides.includes(guide.id) ? styles.heartActive : ''}`}
                                        onClick={(e) => toggleSave(e, guide.id)}
                                        title="Lưu hướng dẫn viên"
                                    >
                                        <Heart className={styles.heartIcon} />
                                    </button>
                                </div>

                                {/* Card Body */}
                                <div className={styles.cardBody}>
                                    <h2 className={styles.guideName}>{guide.name}</h2>
                                    <p className={styles.guideRole}>{guide.role}</p>

                                    <div className={styles.ratingRow}>
                                        <Star className={styles.starIcon} />
                                        <span className={styles.ratingValue}>{guide.rating}</span>
                                        <span className={styles.reviewCount}>({guide.reviewCount} đánh giá)</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <MapPin className={styles.infoIcon} />
                                        <span>{guide.location}</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <Globe className={styles.infoIcon} />
                                        <span>{guide.languages.join(', ')}</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <Clock className={styles.infoIcon} />
                                        <span>{guide.experience} kinh nghiệm</span>
                                    </div>

                                    <p className={styles.bio}>{guide.bio}</p>

                                    {/* Specialties */}
                                    <div className={styles.specialtyRow}>
                                        {guide.specialties.map((spec, idx) => (
                                            <span key={idx} className={styles.specialtyTag}>{spec}</span>
                                        ))}
                                    </div>

                                    {/* Badges */}
                                    <div className={styles.badgeRow}>
                                        {guide.badges.map((badge, idx) => (
                                            <span key={idx} className={styles.awardBadge}>
                                                <Award className={styles.awardIcon} />
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className={styles.cardFooter}>
                                    <div className={styles.statsRow}>
                                        <div className={styles.stat}>
                                            <Users className={styles.statIcon} />
                                            <span>{guide.toursCompleted} tour</span>
                                        </div>
                                    </div>
                                    <span className={styles.viewProfile}>
                                        Xem hồ sơ
                                        <ChevronRight className={styles.chevronIcon} />
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {filteredGuides.length === 0 && (
                    <div className={styles.emptyState}>
                        <Search className={styles.emptyIcon} />
                        <h3>Không tìm thấy hướng dẫn viên</h3>
                        <p>Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.</p>
                    </div>
                )}

                {/* CTA Section */}
                <div className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>Bạn muốn trở thành Hướng Dẫn Viên?</h2>
                    <p className={styles.ctaText}>
                        Gia nhập đội ngũ Flourish Tourism — nơi bạn có thể chia sẻ đam mê du lịch và tạo ra những trải nghiệm đáng nhớ cho mọi người.
                    </p>
                    <Link to="/careers" className={styles.ctaBtn}>
                        Ứng tuyển ngay
                        <ChevronRight className={styles.ctaBtnIcon} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OurGuides;
