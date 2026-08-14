import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Globe, Award, Clock, Users, ChevronRight, Search, Heart } from 'lucide-react';
import styles from './OurGuides.module.css';
import { listPublicGuides } from '../../api/guides';
import { resolveMediaUrl } from '../../api/config';
import { GUIDE_SPECIALTY_OPTIONS } from '../../config/guideProfile';

const SPECIALTIES_FILTER = ['Tất cả', ...GUIDE_SPECIALTY_OPTIONS];

function asStringList(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item) => (typeof item === 'string' ? item : (item?.name || item?.label || '')))
        .map((item) => item.trim())
        .filter(Boolean);
}

function initials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return 'HDV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizeGuide(raw) {
    const languages = asStringList(raw?.languages);
    const specialties = asStringList(raw?.specialties);
    const badges = asStringList(raw?.badges);
    const experienceYears = raw?.experienceYears ?? raw?.yearsExperience;
    const name = raw?.fullName || raw?.name || 'Hướng dẫn viên';
    const rating = raw?.rating == null || raw?.rating === '' ? null : Number(raw.rating);
    return {
        id: raw?.id,
        name,
        avatar: resolveMediaUrl(raw?.avatarUrl || raw?.avatar) || '',
        role: raw?.jobTitle || raw?.title || raw?.role || 'Hướng dẫn viên',
        location: raw?.location || raw?.baseLocation || raw?.guideBaseLocation || '',
        rating: Number.isFinite(rating) ? rating : null,
        reviewCount: Number(raw?.reviewCount) || 0,
        toursCompleted: Number(raw?.toursCompleted) || 0,
        experienceYears: experienceYears == null || experienceYears === '' ? null : Number(experienceYears),
        languages,
        specialties,
        bio: raw?.shortBio || raw?.bio || '',
        badges,
        verified: Boolean(raw?.verified),
    };
}

const OurGuides = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [savedGuides, setSavedGuides] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setLoadError('');
            try {
                const list = await listPublicGuides();
                if (!alive) return;
                setGuides((Array.isArray(list) ? list : []).map(normalizeGuide).filter((g) => g.id));
            } catch (err) {
                if (!alive) return;
                setGuides([]);
                setLoadError(err?.message || 'Không tải được đội ngũ hướng dẫn viên.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const toggleSave = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedGuides((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const filteredGuides = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return guides.filter((guide) => {
            const hay = [
                guide.name,
                guide.location,
                guide.bio,
                ...(guide.specialties || []),
                ...(guide.languages || []),
            ].join(' ').toLowerCase();
            const matchesSearch = !query || hay.includes(query);
            const matchesFilter =
                activeFilter === 'Tất cả' ||
                guide.specialties.some((s) => s.toLowerCase() === activeFilter.toLowerCase());
            return matchesSearch && matchesFilter;
        });
    }, [guides, searchQuery, activeFilter]);

    let emptyTitle = 'Không tìm thấy hướng dẫn viên';
    let emptyText = 'Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.';
    if (loading) {
        emptyTitle = 'Đang tải đội ngũ HDV';
        emptyText = 'Vui lòng chờ trong giây lát.';
    } else if (loadError) {
        emptyTitle = 'Không tải được danh sách';
        emptyText = loadError;
    } else if (guides.length === 0) {
        emptyTitle = 'Chưa có hồ sơ được duyệt';
        emptyText = 'Hướng dẫn viên điền hồ sơ trên portal, admin duyệt xong mới hiện tại đây.';
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>
                        <Award className={styles.heroBadgeIcon} />
                        Đội ngũ chuyên nghiệp
                    </span>
                    <h1 className={styles.heroTitle}>Hướng Dẫn Viên Của Chúng Tôi</h1>
                    <p className={styles.heroSubtitle}>
                        Những người bạn đồng hành tận tâm — hồ sơ thật, đã được Flourish duyệt.
                    </p>

                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, tuyến, ngôn ngữ hoặc chuyên môn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.container}>
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

                <div className={styles.grid}>
                    {filteredGuides.map((guide) => (
                        <Link
                            key={guide.id}
                            to={`/our-guides/${guide.id}`}
                            className={styles.cardLink}
                        >
                            <article className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatarWrap}>
                                        {guide.avatar ? (
                                            <img
                                                src={guide.avatar}
                                                alt={guide.name}
                                                className={styles.avatar}
                                            />
                                        ) : (
                                            <span className={styles.avatarFallback}>{initials(guide.name)}</span>
                                        )}
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

                                <div className={styles.cardBody}>
                                    <h2 className={styles.guideName}>{guide.name}</h2>
                                    <p className={styles.guideRole}>{guide.role}</p>

                                    <div className={styles.ratingRow}>
                                        <Star className={styles.starIcon} />
                                        <span className={styles.ratingValue}>{guide.rating != null ? guide.rating : '—'}</span>
                                        <span className={styles.reviewCount}>
                                            {guide.reviewCount ? `(${guide.reviewCount} đánh giá)` : '(Chưa có đánh giá)'}
                                        </span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <MapPin className={styles.infoIcon} />
                                        <span>{guide.location || 'Chưa cập nhật tuyến'}</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <Globe className={styles.infoIcon} />
                                        <span>{guide.languages.length ? guide.languages.join(', ') : 'Chưa cập nhật ngôn ngữ'}</span>
                                    </div>

                                    {guide.experienceYears != null ? (
                                        <div className={styles.infoRow}>
                                            <Clock className={styles.infoIcon} />
                                            <span>{guide.experienceYears} năm kinh nghiệm</span>
                                        </div>
                                    ) : null}

                                    {guide.bio ? <p className={styles.bio}>{guide.bio}</p> : null}

                                    {guide.specialties.length ? (
                                        <div className={styles.specialtyRow}>
                                            {guide.specialties.map((spec) => (
                                                <span key={spec} className={styles.specialtyTag}>{spec}</span>
                                            ))}
                                        </div>
                                    ) : null}

                                    {guide.badges.length ? (
                                        <div className={styles.badgeRow}>
                                            {guide.badges.map((badge) => (
                                                <span key={badge} className={styles.awardBadge}>
                                                    <Award className={styles.awardIcon} />
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

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
                        <h3>{emptyTitle}</h3>
                        <p>{emptyText}</p>
                    </div>
                )}

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
