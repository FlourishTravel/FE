import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Globe, Award, Clock, Users, ChevronRight, ChevronLeft,
    Heart, MessageCircle, Calendar, CheckCircle, Camera, Coffee, Shield
} from 'lucide-react';
import styles from './GuideDetail.module.css';
import { getPublicGuide } from '../../api/guides';
import { resolveMediaUrl } from '../../api/config';

const GUIDES_DATA = {
    1: {
        name: 'Trần Bình',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80',
        coverImage: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=1200&q=80',
        role: 'Senior Tour Guide',
        location: 'Bangkok – Pattaya, Thái Lan',
        rating: 4.9,
        reviewCount: 218,
        toursCompleted: 156,
        experience: '5 năm',
        languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Thái'],
        specialties: ['Ẩm thực', 'Văn hóa', 'Chữa lành'],
        bio: 'Chuyên gia dẫn tour Bangkok – Pattaya với 5 năm kinh nghiệm. Bình nổi tiếng với phong cách dẫn tour "chill healing", giúp du khách tận hưởng từng khoảnh khắc thay vì chạy theo lịch trình. Anh am hiểu sâu sắc văn hóa Thái Lan, từ ẩm thực đường phố đến những ngôi chùa cổ kính.',
        fullBio: 'Bình bắt đầu sự nghiệp hướng dẫn viên từ năm 2021 khi tham gia chương trình đào tạo của Flourish Tourism. Với niềm đam mê du lịch bền vững và trải nghiệm chậm, anh đã trở thành một trong những guide được yêu thích nhất của công ty. Phong cách dẫn tour của Bình luôn chú trọng vào việc giúp du khách thực sự "sống chậm" và cảm nhận mỗi điểm đến thay vì chỉ check-in vội vã.',
        badges: ['Top Guide 2025', 'Chứng nhận Bền vững'],
        verified: true,
        joinedDate: 'Tháng 3, 2021',
        tours: [
            {
                id: 1,
                title: 'BANGKOK - PATAYA',
                duration: '5 Ngày / 4 Đêm',
                price: 8999000,
                image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?auto=format&fit=crop&w=600&q=80',
                rating: 4.8,
                nextDate: '15/06/2026',
            },
        ],
        reviews: [
            {
                id: 1,
                name: 'Nguyễn Thanh Hà',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
                rating: 5,
                date: '20/04/2026',
                comment: 'Anh Bình dẫn tour rất tuyệt! Phong cách chill, không vội vã, giúp cả đoàn thực sự tận hưởng chuyến đi. Đặc biệt là những quán ăn anh đưa đi đều rất ngon và authentic.',
                tourName: 'Bangkok - Pattaya',
            },
            {
                id: 2,
                name: 'Trần Minh Đức',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
                rating: 5,
                date: '15/03/2026',
                comment: 'Lần thứ 2 đi tour với anh Bình. Anh rất chu đáo, biết nhiều spot ẩn ở Bangkok mà guide khác không biết. Recommend 100%!',
                tourName: 'Bangkok - Pattaya',
            },
            {
                id: 3,
                name: 'Lê Thu Trang',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
                rating: 4,
                date: '28/02/2026',
                comment: 'Chuyến đi rất thú vị, anh Bình nói tiếng Thái rất giỏi nên giao tiếp với người địa phương rất dễ dàng. Ẩm thực mà anh recommend đều tuyệt vời.',
                tourName: 'Bangkok - Pattaya',
            },
        ],
        stats: {
            responseRate: '98%',
            responseTime: '< 1 giờ',
            repeatGuests: '42%',
        },
    },
};

// Fallback for any guide ID
const DEFAULT_GUIDE = GUIDES_DATA[1];

function mapGuideDetail(raw) {
    if (!raw) return null;
    const languages = Array.isArray(raw.languages)
        ? raw.languages.map((l) => (typeof l === 'string' ? l : (l?.name || l?.label || ''))).filter(Boolean)
        : [];
    const specialties = Array.isArray(raw.specialties)
        ? raw.specialties.map((s) => (typeof s === 'string' ? s : (s?.name || s?.label || ''))).filter(Boolean)
        : [];
    const badges = Array.isArray(raw.badges)
        ? raw.badges.map((b) => (typeof b === 'string' ? b : (b?.name || b?.label || ''))).filter(Boolean)
        : [];
    const tours = Array.isArray(raw.tours) ? raw.tours : [];
    const reviews = Array.isArray(raw.reviews) ? raw.reviews : [];
    return {
        name: raw.fullName || raw.name || 'Hướng dẫn viên',
        avatar: resolveMediaUrl(raw.avatarUrl || raw.avatar) || '',
        coverImage: resolveMediaUrl(raw.coverImageUrl || raw.coverImage) || '',
        role: raw.jobTitle || raw.title || raw.role || 'Hướng dẫn viên',
        location: raw.department || raw.location || raw.baseLocation || 'Flourish Travel',
        rating: raw.rating != null ? Number(raw.rating) : null,
        reviewCount: Number(raw.reviewCount) || reviews.length || 0,
        toursCompleted: Number(raw.toursCompleted) || 0,
        experience: raw.experienceYears ? `${raw.experienceYears} năm` : (raw.experience || ''),
        languages: languages,
        specialties: specialties,
        bio: raw.shortBio || raw.bio || 'Đồng hành cùng du khách với phong cách chuyên nghiệp và gần gũi.',
        fullBio: raw.bio || '',
        badges: badges,
        verified: Boolean(raw.verified ?? true),
        joinedDate: raw.joinedDate || raw.createdAt || '',
        tours: tours.map((tour, index) => ({
            id: tour.id || index,
            title: tour.title || 'Tour',
            duration: tour.durationText
                || (tour.durationDays ? `${tour.durationDays} Ngày${tour.durationNights != null ? ` / ${tour.durationNights} Đêm` : ''}` : ''),
            price: Number(tour.basePrice) || 0,
            image: resolveMediaUrl(tour.thumbnailUrl || tour.imageUrl) || '',
            rating: Number(tour.rating) || null,
            nextDate: tour.nextStartDate || 'Đang cập nhật',
        })),
        reviews: reviews.map((review, index) => ({
            id: review.id || index,
            name: review.authorName || review.name || 'Du khách',
            avatar: resolveMediaUrl(review.authorAvatarUrl || review.avatar) || '',
            rating: Number(review.rating) || 5,
            date: review.createdAt || review.date || '',
            comment: review.comment || '',
            tourName: review.tourName || 'Tour Flourish',
        })),
        stats: {
            responseRate: raw.responseRate || '—',
            responseTime: raw.responseTime || '—',
            repeatGuests: raw.repeatGuests || '—',
        },
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
                    <p>{loadError || 'Không tìm thấy hướng dẫn viên.'}</p>
                    <button className={styles.backBtn} onClick={() => navigate('/our-guides')} type="button">
                        <ChevronLeft className={styles.backIcon} />
                        Trở lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Cover Image */}
            <div className={styles.coverSection}>
                <img src={guide.coverImage} alt="" className={styles.coverImage} />
                <div className={styles.coverOverlay}></div>
                <button className={styles.backBtn} onClick={() => navigate('/our-guides')}>
                    <ChevronLeft className={styles.backIcon} />
                    Trở lại
                </button>
            </div>

            <div className={styles.container}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <div className={styles.profileLeft}>
                        <div className={styles.avatarSection}>
                            <img src={guide.avatar} alt={guide.name} className={styles.avatar} />
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
                                    {guide.location}
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
                        >
                            <Heart className={styles.saveBtnIcon} />
                            {isSaved ? 'Đã lưu' : 'Lưu'}
                        </button>
                        <button className={styles.contactBtn}>
                            <MessageCircle className={styles.contactBtnIcon} />
                            Liên hệ
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
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
                        <div className={styles.statLabel}>Tour hoàn thành</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{guide.experience || '—'}</div>
                        <div className={styles.statLabel}>Kinh nghiệm</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{guide.stats.repeatGuests}</div>
                        <div className={styles.statLabel}>Khách quay lại</div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Left Column */}
                    <div className={styles.leftCol}>
                        {/* About */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Giới thiệu</h2>
                            <p className={styles.bioText}>{guide.bio}</p>
                            {guide.fullBio ? <p className={styles.bioText}>{guide.fullBio}</p> : null}
                        </section>

                        {/* Specialties & Languages */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Chuyên môn & Ngôn ngữ</h2>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Chuyên môn</h3>
                                <div className={styles.tagRow}>
                                    {(guide.specialties || []).length
                                        ? guide.specialties.map((s, i) => (
                                            <span key={i} className={styles.specialtyTag}>{s}</span>
                                        ))
                                        : <span className={styles.langTag}>Đang cập nhật</span>}
                                </div>
                            </div>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Ngôn ngữ</h3>
                                <div className={styles.tagRow}>
                                    {(guide.languages || []).length
                                        ? guide.languages.map((l, i) => (
                                            <span key={i} className={styles.langTag}>
                                                <Globe className={styles.langIcon} />
                                                {l}
                                            </span>
                                        ))
                                        : <span className={styles.langTag}>Đang cập nhật</span>}
                                </div>
                            </div>
                            <div className={styles.tagGroup}>
                                <h3 className={styles.tagGroupTitle}>Chứng chỉ & Giải thưởng</h3>
                                <div className={styles.tagRow}>
                                    {(guide.badges || []).length
                                        ? guide.badges.map((b, i) => (
                                            <span key={i} className={styles.awardBadge}>
                                                <Award className={styles.awardIcon} />
                                                {b}
                                            </span>
                                        ))
                                        : <span className={styles.langTag}>Chưa có</span>}
                                </div>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Đánh giá từ du khách</h2>
                                <span className={styles.sectionBadge}>
                                    <Star className={styles.sectionBadgeIcon} />
                                    {guide.rating != null ? `${guide.rating} / 5` : 'Chưa có điểm'}
                                </span>
                            </div>
                            <div className={styles.reviewList}>
                                {(guide.reviews || []).length ? guide.reviews.map((review) => (
                                    <div key={review.id} className={styles.reviewCard}>
                                        <div className={styles.reviewHeader}>
                                            <img src={review.avatar} alt="" className={styles.reviewAvatar} />
                                            <div className={styles.reviewInfo}>
                                                <span className={styles.reviewName}>{review.name}</span>
                                                <span className={styles.reviewDate}>{review.date} · {review.tourName}</span>
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

                    {/* Right Column - Tours */}
                    <div className={styles.rightCol}>
                        <div className={styles.stickyCard}>
                            <h3 className={styles.stickyCardTitle}>Tour đang dẫn</h3>
                            {(guide.tours || []).length ? guide.tours.map((tour) => (
                                <Link key={tour.id} to={`/tours/${tour.id}`} className={styles.tourCardLink}>
                                    <div className={styles.tourCard}>
                                        <img src={tour.image} alt={tour.title} className={styles.tourCardImage} />
                                        <div className={styles.tourCardContent}>
                                            <h4 className={styles.tourCardTitle}>{tour.title}</h4>
                                            <div className={styles.tourCardMeta}>
                                                <span><Clock className={styles.tourMetaIcon} />{tour.duration || '—'}</span>
                                            </div>
                                            <div className={styles.tourCardPrice}>
                                                <span className={styles.tourPriceLabel}>Từ</span>
                                                <span className={styles.tourPriceValue}>{(tour.price || 0).toLocaleString('de-DE')} VND</span>
                                            </div>
                                            <div className={styles.tourNextDate}>
                                                <Calendar className={styles.tourMetaIcon} />
                                                Khởi hành tiếp theo: {tour.nextDate}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <p className={styles.bioText}>Chưa có tour được phân công.</p>
                            )}

                            {/* Response Info */}
                            <div className={styles.responseInfo}>
                                <div className={styles.responseItem}>
                                    <Shield className={styles.responseIcon} />
                                    <div>
                                        <div className={styles.responseLabel}>Tỷ lệ phản hồi</div>
                                        <div className={styles.responseValue}>{guide.stats.responseRate}</div>
                                    </div>
                                </div>
                                <div className={styles.responseItem}>
                                    <Clock className={styles.responseIcon} />
                                    <div>
                                        <div className={styles.responseLabel}>Thời gian phản hồi</div>
                                        <div className={styles.responseValue}>{guide.stats.responseTime}</div>
                                    </div>
                                </div>
                            </div>

                            <button className={styles.bookWithGuideBtn}>
                                Đặt tour cùng {guide.name}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDetail;
