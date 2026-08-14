import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Globe, Award, Clock, ChevronLeft,
    Heart, MessageCircle, Calendar,
} from 'lucide-react';
import styles from './GuideDetail.module.css';
import { getPublicGuide } from '../../api/guides';
import { resolveMediaUrl } from '../../api/config';

function asStringList(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item) => (typeof item === 'string' ? item : (item?.name || item?.label || '')))
        .map((item) => String(item).trim())
        .filter(Boolean);
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('vi-VN');
}

function formatJoined(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
}

function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'HDV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapGuideDetail(raw) {
    if (!raw) return null;
    const languages = asStringList(raw.languages);
    const specialties = asStringList(raw.specialties);
    const badges = asStringList(raw.badges);
    const tours = Array.isArray(raw.tours) ? raw.tours : [];
    const reviews = Array.isArray(raw.reviews) ? raw.reviews : [];
    const rating = raw.rating == null || raw.rating === '' ? null : Number(raw.rating);
    const shortBio = raw.shortBio || '';
    const fullBio = raw.bio || '';
    return {
        name: raw.fullName || raw.name || 'Hướng dẫn viên',
        avatar: resolveMediaUrl(raw.avatarUrl || raw.avatar) || '',
        coverImage: resolveMediaUrl(raw.coverImageUrl || raw.coverImage || raw.guideCoverUrl) || '',
        role: raw.jobTitle || raw.title || raw.role || 'Hướng dẫn viên',
        location: raw.location || raw.baseLocation || raw.guideBaseLocation || '',
        rating: Number.isFinite(rating) ? rating : null,
        reviewCount: Number(raw.reviewCount) || reviews.length || 0,
        toursCompleted: Number(raw.toursCompleted) || 0,
        experience: raw.experienceYears != null && raw.experienceYears !== ''
            ? `${raw.experienceYears} năm`
            : (raw.experience || ''),
        languages,
        specialties,
        bio: shortBio,
        fullBio: fullBio && fullBio !== shortBio ? fullBio : '',
        badges,
        verified: Boolean(raw.verified),
        joinedDate: formatJoined(raw.joinedAt || raw.joinedDate || raw.createdAt),
        tours: tours.map((tour, index) => ({
            id: tour.id || index,
            title: tour.title || 'Tour',
            duration: tour.durationText
                || (tour.durationDays
                    ? `${tour.durationDays} Ngày${tour.durationNights != null ? ` / ${tour.durationNights} Đêm` : ''}`
                    : ''),
            price: Number(tour.basePrice) || 0,
            image: resolveMediaUrl(tour.thumbnailUrl || tour.imageUrl) || '',
            rating: tour.rating == null ? null : Number(tour.rating),
            nextDate: tour.nextStartDate ? formatDate(tour.nextStartDate) : '',
        })),
        reviews: reviews.map((review, index) => ({
            id: review.id || index,
            name: review.authorName || review.name || 'Du khách',
            avatar: resolveMediaUrl(review.authorAvatarUrl || review.avatar) || '',
            rating: Number(review.rating) || 0,
            date: formatDate(review.createdAt || review.date),
            comment: review.comment || '',
            tourName: review.tourName || '',
        })),
    };
}

const GuideDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [guideApi, setGuideApi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let alive = true;
        if (!id) return undefined;
        setLoading(true);
        setLoadError('');
        (async () => {
            try {
                const data = await getPublicGuide(id);
                if (!alive) return;
                setGuideApi(mapGuideDetail(data?.data || data));
            } catch (err) {
                if (!alive) return;
                setGuideApi(null);
                setLoadError(err?.message || 'Không tìm thấy hướng dẫn viên.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

    const guide = guideApi;

    const renderStars = (rating) => {
        const value = Number(rating) || 0;
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${styles.reviewStar} ${i < Math.floor(value) ? styles.starFilled : styles.starEmpty}`}
            />
        ));
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '48px 24px' }}>
                    Đang tải hồ sơ hướng dẫn viên...
                </div>
            </div>
        );
    }

    if (!guide) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '48px 24px' }}>
                    <p>{loadError || 'Hồ sơ này chưa được duyệt hoặc không tồn tại.'}</p>
                    <button className={styles.backBtn} onClick={() => navigate('/our-guides')} type="button">
                        <ChevronLeft className={styles.backIcon} />
                        Trở lại
                    </button>
                </div>
            </div>
        );
    }

    const firstTour = guide.tours[0];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.coverSection}>
                {guide.coverImage ? (
                    <img src={guide.coverImage} alt="" className={styles.coverImage} />
                ) : (
                    <div className={styles.coverFallback} aria-hidden="true" />
                )}
                <div className={styles.coverOverlay}></div>
                <button className={styles.backBtn} onClick={() => navigate('/our-guides')} type="button">
                    <ChevronLeft className={styles.backIcon} />
                    Trở lại
                </button>
            </div>

            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileLeft}>
                        <div className={styles.avatarSection}>
                            {guide.avatar ? (
                                <img src={guide.avatar} alt={guide.name} className={styles.avatar} />
                            ) : (
                                <span className={styles.avatarFallback}>{initials(guide.name)}</span>
                            )}
                            {guide.verified && (
                                <span className={styles.verifiedBadge}>✓</span>
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{guide.name}</h1>
                            <p className={styles.profileRole}>{guide.role}</p>
                            <div className={styles.profileMeta}>
                                <span className={styles.metaItem}>
                                    <MapPin className={styles.metaIcon} />
                                    {guide.location || 'Chưa cập nhật tuyến'}
                                </span>
                                {guide.joinedDate ? (
                                    <span className={styles.metaItem}>
                                        <Calendar className={styles.metaIcon} />
                                        Gia nhập {guide.joinedDate}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.profileActions}>
                        <button
                            className={`${styles.saveBtn} ${isSaved ? styles.saveBtnActive : ''}`}
                            onClick={() => setIsSaved(!isSaved)}
                            type="button"
                        >
                            <Heart className={styles.saveBtnIcon} />
                            {isSaved ? 'Đã lưu' : 'Lưu'}
                        </button>
                        <Link to="/help" className={styles.contactBtn}>
                            <MessageCircle className={styles.contactBtnIcon} />
                            Liên hệ
                        </Link>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>
                            <Star className={styles.statIconStar} />
                            {guide.rating != null ? guide.rating : '—'}
                        </div>
                        <div className={styles.statLabel}>{guide.reviewCount} đánh giá</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{guide.toursCompleted}</div>
                        <div className={styles.statLabel}>Tour đã dẫn</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{guide.experience || '—'}</div>
                        <div className={styles.statLabel}>Kinh nghiệm</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{guide.languages.length || '—'}</div>
                        <div className={styles.statLabel}>Ngôn ngữ</div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.leftCol}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Giới thiệu</h2>
                            {guide.bio || guide.fullBio ? (
                                <>
                                    {guide.bio ? <p className={styles.bioText}>{guide.bio}</p> : null}
                                    {guide.fullBio ? <p className={styles.bioText}>{guide.fullBio}</p> : null}
                                </>
                            ) : (
                                <p className={styles.bioText}>Chưa có giới thiệu.</p>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Chuyên môn & Ngôn ngữ</h2>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Chuyên môn</h3>
                                <div className={styles.tagRow}>
                                    {guide.specialties.length
                                        ? guide.specialties.map((s) => (
                                            <span key={s} className={styles.specialtyTag}>{s}</span>
                                        ))
                                        : <span className={styles.langTag}>Chưa cập nhật</span>}
                                </div>
                            </div>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Ngôn ngữ</h3>
                                <div className={styles.tagRow}>
                                    {guide.languages.length
                                        ? guide.languages.map((l) => (
                                            <span key={l} className={styles.langTag}>
                                                <Globe className={styles.langIcon} />
                                                {l}
                                            </span>
                                        ))
                                        : <span className={styles.langTag}>Chưa cập nhật</span>}
                                </div>
                            </div>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Chứng chỉ & Giải thưởng</h3>
                                <div className={styles.tagRow}>
                                    {guide.badges.length
                                        ? guide.badges.map((b) => (
                                            <span key={b} className={styles.awardBadge}>
                                                <Award className={styles.awardIcon} />
                                                {b}
                                            </span>
                                        ))
                                        : <span className={styles.langTag}>Chưa có</span>}
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Đánh giá từ du khách</h2>
                                <span className={styles.sectionBadge}>
                                    <Star className={styles.sectionBadgeIcon} />
                                    {guide.rating != null ? `${guide.rating} / 5` : 'Chưa có điểm'}
                                </span>
                            </div>
                            <div className={styles.reviewList}>
                                {guide.reviews.length ? guide.reviews.map((review) => (
                                    <div key={review.id} className={styles.reviewCard}>
                                        <div className={styles.reviewHeader}>
                                            {review.avatar ? (
                                                <img src={review.avatar} alt="" className={styles.reviewAvatar} />
                                            ) : (
                                                <span className={styles.reviewAvatarFallback}>{initials(review.name)}</span>
                                            )}
                                            <div className={styles.reviewInfo}>
                                                <span className={styles.reviewName}>{review.name}</span>
                                                <span className={styles.reviewDate}>
                                                    {[review.date, review.tourName].filter(Boolean).join(' · ')}
                                                </span>
                                            </div>
                                            <div className={styles.reviewStars}>
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className={styles.reviewComment}>{review.comment}</p>
                                    </div>
                                )) : (
                                    <p className={styles.bioText}>Chưa có đánh giá.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.stickyCard}>
                            <h3 className={styles.stickyCardTitle}>Tour đang dẫn</h3>
                            {guide.tours.length ? guide.tours.map((tour) => (
                                <Link key={tour.id} to={`/tours/${tour.id}`} className={styles.tourCardLink}>
                                    <div className={styles.tourCard}>
                                        {tour.image ? (
                                            <img src={tour.image} alt={tour.title} className={styles.tourCardImage} />
                                        ) : (
                                            <div className={styles.tourCardImageFallback} />
                                        )}
                                        <div className={styles.tourCardContent}>
                                            <h4 className={styles.tourCardTitle}>{tour.title}</h4>
                                            <div className={styles.tourCardMeta}>
                                                <span><Clock className={styles.tourMetaIcon} />{tour.duration || '—'}</span>
                                            </div>
                                            <div className={styles.tourCardPrice}>
                                                <span className={styles.tourPriceLabel}>Từ</span>
                                                <span className={styles.tourPriceValue}>{(tour.price || 0).toLocaleString('de-DE')} VND</span>
                                            </div>
                                            {tour.nextDate ? (
                                                <div className={styles.tourNextDate}>
                                                    <Calendar className={styles.tourMetaIcon} />
                                                    Khởi hành tiếp theo: {tour.nextDate}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <p className={styles.bioText}>Chưa có tour được phân công.</p>
                            )}

                            {firstTour ? (
                                <Link to={`/tours/${firstTour.id}`} className={styles.bookWithGuideBtn}>
                                    Đặt tour cùng {guide.name}
                                </Link>
                            ) : (
                                <Link to="/tours" className={styles.bookWithGuideBtn}>
                                    Xem tour Flourish
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDetail;
