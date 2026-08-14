import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Clock, Users, Sun, Globe, ChevronRight,
    Calendar, CheckCircle, Layers, X, Minus, Plus, RefreshCw, Heart, Play
} from 'lucide-react';
import bangkokImgNew from '../../assets/di-chuyen-di-lai-thai-lan-2.webp';
import bangkokImg2 from '../../assets/366426-tour-thai-lan-5n4d-bangkok-pattaya.jpg';
import pattayaImg from '../../assets/pattaya.png';
import styles from './TourDetail.module.css';
import { getPublicTour, getSimilarTours } from '../../api/tours';
import { resolveMediaUrl } from '../../api/config';
import { listMyBookings, validateBookingSession } from '../../api/bookings';
import { getAccessToken } from '../../api/auth';
import { addFavorite, listFavorites, removeFavorite } from '../../api/favorites';
import { useAuth } from '../../context/AuthContext';

function todayIsoLocal() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function rangesOverlap(a0, a1, b0, b1) {
    if (!a0 || !b0) return false;
    const ae = a1 || a0;
    const be = b1 || b0;
    return a0 <= be && b0 <= ae;
}

function isUuid(s) {
    return (
        typeof s === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s)
    );
}

function formatDurationDaysNights(durationDays, durationNights) {
    if (durationDays && durationNights != null) return `${durationDays} ngày / ${durationNights} đêm`;
    if (durationDays) return `${durationDays} ngày`;
    return '—';
}

function formatIsoDateVi(iso) {
    if (!iso) return '';
    const [y, m, d] = String(iso).split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
}

function buildIncluded(detail) {
    const set = new Set();
    for (const d of detail.itineraries || []) {
        if (d.mealsIncluded) {
            d.mealsIncluded.split(/[\n,•]/).map((x) => x.trim()).filter(Boolean).forEach((x) => set.add(x));
        }
        if (d.accommodation) set.add(`Lưu trú: ${d.accommodation}`);
        if (d.transport) set.add(`Di chuyển: ${d.transport}`);
        if (d.highlights) {
            d.highlights.split(/[\n,•]/).map((x) => x.trim()).filter(Boolean).forEach((x) => set.add(x));
        }
    }
    return Array.from(set).slice(0, 14);
}

function buildItineraryDays(detail) {
    const rows = (detail.itineraries || [])
        .slice()
        .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))
        .map((day) => {
            const loc =
                (day.activities || []).find((a) => a.locationName)?.locationName ||
                day.summary ||
                (detail.locations || [])[0]?.locationName ||
                '—';
            const bullets = [];
            if (day.description) {
                bullets.push(...day.description.split('\n').map((x) => x.trim()).filter(Boolean));
            }
            if (day.activities?.length) {
                for (const a of day.activities) {
                    const t = [a.startTime, a.title].filter(Boolean).join(' · ');
                    const line = t + (a.description ? `: ${a.description}` : '');
                    if (line.trim()) bullets.push(line.trim());
                }
            }
            if (bullets.length === 0 && day.summary) bullets.push(day.summary);
            return {
                day: day.dayNumber || 1,
                title: day.title || `Ngày ${day.dayNumber || ''}`,
                location: loc,
                description: bullets.length ? bullets : ['(Đang cập nhật chi tiết ngày)'],
            };
        });
    if (rows.length) return rows;
    return [
        {
            day: 1,
            title: 'Lịch trình',
            location: '—',
            description: [detail.description || 'Lịch trình chi tiết sẽ được cập nhật sớm.'],
        },
    ];
}

function youtubeVideoId(url) {
    const s = String(url || '');
    const match =
        s.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
        s.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) ||
        s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/) ||
        s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
    return match ? match[1] : null;
}

function vimeoVideoId(url) {
    const match = String(url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
}

function buildTourVideos(videos) {
    return (videos || [])
        .map((v) => {
            const url = v?.videoUrl;
            if (!url) return null;
            const yt = youtubeVideoId(url);
            if (yt) {
                return {
                    title: v.title || 'Video giới thiệu',
                    thumbnailUrl: resolveMediaUrl(v.thumbnailUrl) || '',
                    type: 'youtube',
                    src: `https://www.youtube.com/embed/${yt}`,
                };
            }
            const vm = vimeoVideoId(url);
            if (vm) {
                return {
                    title: v.title || 'Video giới thiệu',
                    thumbnailUrl: resolveMediaUrl(v.thumbnailUrl) || '',
                    type: 'vimeo',
                    src: `https://player.vimeo.com/video/${vm}`,
                };
            }
            return {
                title: v.title || 'Video giới thiệu',
                thumbnailUrl: resolveMediaUrl(v.thumbnailUrl) || '',
                type: 'file',
                src: resolveMediaUrl(url),
            };
        })
        .filter(Boolean);
}

function buildMapEmbedUrl(locations) {
    const loc = (locations || []).find((l) => l.latitude != null && l.longitude != null);
    if (!loc) return null;
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return `https://www.google.com/maps?q=${lat},${lng}&z=8&output=embed`;
}

function buildViewModel(detail) {
    const imgs = (detail.images || []).map((i) => resolveMediaUrl(i?.imageUrl)).filter(Boolean);
    const main = imgs[0] || bangkokImgNew;
    const secondary =
        imgs.length > 1 ? imgs.slice(1, 3) : [bangkokImg2, pattayaImg].filter((u) => u !== main).slice(0, 2);
    while (secondary.length < 2) secondary.push(main);

    const locLine =
        (detail.locations || []).map((l) => l.locationName).filter(Boolean).join(' · ') ||
        (detail.category?.name ? `Danh mục: ${detail.category.name}` : 'Việt Nam');

    const scheduled = (detail.sessions || []).filter((s) => s.status === 'scheduled');
    const maxPax = scheduled.reduce((m, s) => Math.max(m, s.maxParticipants || 0), 0);

    const itinerary = buildItineraryDays(detail);
    const included = buildIncluded(detail);

    return {
        title: detail.title,
        breadcrumb: ['Trang chủ', detail.category?.name || 'Tour', detail.title],
        location: locLine,
        rating: null,
        reviewCount: 0,
        tags: [detail.category?.name].filter(Boolean),
        price: detail.basePrice != null ? Number(detail.basePrice) : 0,
        discountPercent: null,
        images: { main, secondary },
        overview: detail.description || 'Đang cập nhật mô tả cho hành trình này.',
        highlights: [
            { icon: 'clock', label: 'Thời gian', value: formatDurationDaysNights(detail.durationDays, detail.durationNights) },
            {
                icon: 'users',
                label: 'Quy mô',
                value: maxPax ? `Tối đa ~${maxPax} khách/đợt` : 'Theo từng lịch khởi hành',
            },
            {
                icon: 'sun',
                label: 'Đợt mở bán',
                value: scheduled.length > 0 ? `${scheduled.length} đợt` : 'Chưa có đợt',
            },
            { icon: 'globe', label: 'Đồng hành', value: 'Đội ngũ Flourish & HDV (nếu có)' },
        ],
        itinerary,
        included: included.length ? included : ['Chi tiết dịch vụ theo xác nhận booking'],
        mapEmbedUrl: buildMapEmbedUrl(detail.locations),
        videos: buildTourVideos(detail.videos),
    };
}

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [similar, setSimilar] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [showFullItinerary, setShowFullItinerary] = useState(false);
    const [activeDay, setActiveDay] = useState(1);
    const dayRefs = useRef({});
    const datePassengerRef = useRef(null);

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [scheduleConflict, setScheduleConflict] = useState('');
    const [sessionValidateError, setSessionValidateError] = useState('');
    const [sessionValidateLoading, setSessionValidateLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        let cancel = false;
        (async () => {
            if (!isUuid(id)) {
                setLoadError('Tour không hợp lệ hoặc đã thay đổi đường dẫn.');
                setDetail(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            setLoadError('');
            try {
                const data = await getPublicTour(id);
                if (cancel) return;
                setDetail(data);
                const bookable = (data.sessions || []).filter(
                    (s) =>
                        s.status === 'scheduled' &&
                        (s.maxParticipants ?? 0) > (s.currentParticipants ?? 0),
                );
                setSelectedSessionId(bookable[0]?.id || null);
                const days = buildItineraryDays(data);
                if (days.length) setActiveDay(days[0].day);

                const sim = await getSimilarTours(id, 4).catch(() => []);
                if (!cancel) setSimilar(Array.isArray(sim) ? sim : []);
            } catch (e) {
                if (!cancel) {
                    setLoadError(e.message || 'Không tải được chi tiết tour.');
                    setDetail(null);
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [id]);

    const tour = useMemo(() => (detail ? buildViewModel(detail) : null), [detail]);

    const bookableSessions = useMemo(() => {
        if (!detail?.sessions) return [];
        return detail.sessions.filter(
            (s) => s.status === 'scheduled' && (s.maxParticipants ?? 0) > (s.currentParticipants ?? 0),
        );
    }, [detail]);

    const selectedSession = useMemo(
        () => bookableSessions.find((s) => s.id === selectedSessionId),
        [bookableSessions, selectedSessionId],
    );

    useEffect(() => {
        if (!selectedSession?.startDate || !detail) {
            setScheduleConflict('');
            return undefined;
        }
        const token = getAccessToken();
        if (!token) {
            setScheduleConflict('');
            return undefined;
        }
        let cancel = false;
        (async () => {
            try {
                const list = await listMyBookings();
                if (cancel) return;
                const today = todayIsoLocal();
                const sStart = selectedSession.startDate;
                const sEnd = selectedSession.endDate || sStart;
                for (const b of list) {
                    const st = (b.bookingStatus || '').toLowerCase();
                    if (st === 'cancelled' || st === 'completed') continue;
                    if (!b.sessionEndDate || b.sessionEndDate < today) continue;
                    const bStart = b.sessionStartDate;
                    const bEnd = b.sessionEndDate || bStart;
                    if (rangesOverlap(bStart, bEnd, sStart, sEnd)) {
                        setScheduleConflict(
                            'Bạn đã có chuyến chưa kết thúc trùng ngày với lịch này. Chọn đợt khác hoặc xử lý đơn trong Chuyến đi của tôi.',
                        );
                        return;
                    }
                }
                setScheduleConflict('');
            } catch {
                if (!cancel) setScheduleConflict('');
            }
        })();
        return () => {
            cancel = true;
        };
    }, [selectedSession, detail]);

    useEffect(() => {
        setSessionValidateError('');
    }, [selectedSessionId, adults, children, infants]);

    useEffect(() => {
        let alive = true;
        if (!user || !id) {
            setIsFavorite(false);
            return undefined;
        }
        (async () => {
            try {
                const favorites = await listFavorites();
                if (!alive) return;
                const favoriteTourIds = favorites.map((item) => String(item.tourId));
                setIsFavorite(favoriteTourIds.includes(String(id)));
            } catch {
                if (!alive) return;
                setIsFavorite(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id, user]);

    const remainingCap = selectedSession
        ? Math.max(0, (selectedSession.maxParticipants ?? 0) - (selectedSession.currentParticipants ?? 0))
        : 20;
    const maxParty = Math.max(1, Math.min(20, remainingCap || 20));

    const adultPrice = tour?.price ?? 0;
    const childPrice = Math.round(adultPrice * 0.7);
    const totalPrice = adults * adultPrice + children * childPrice + infants * 0;

    const formatPassengerSummary = () => {
        const parts = [];
        if (adults > 0) parts.push(`${adults} Người lớn`);
        if (children > 0) parts.push(`${children} Trẻ em`);
        if (infants > 0) parts.push(`${infants} Trẻ sơ sinh`);
        return parts.join(', ') || '1 Người lớn';
    };

    const formatSessionLabel = () => {
        if (!selectedSession?.startDate) return 'Chưa chọn đợt';
        const idx = bookableSessions.findIndex((s) => s.id === selectedSession.id);
        const prefix = idx >= 0 ? `Đợt ${idx + 1} · ` : '';
        const end = selectedSession.endDate ? ` → ${formatIsoDateVi(selectedSession.endDate)}` : '';
        return `${prefix}${formatIsoDateVi(selectedSession.startDate)}${end}`;
    };

    const handleReset = () => {
        setAdults(1);
        setChildren(0);
        setInfants(0);
        setSelectedSessionId(bookableSessions[0]?.id || null);
    };

    const scrollToDatePassenger = () => {
        if (datePassengerRef.current) {
            datePassengerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const getHighlightIcon = (iconName) => {
        switch (iconName) {
            case 'clock':
                return <Clock className={styles.highlightIconSvg} />;
            case 'users':
                return <Users className={styles.highlightIconSvg} />;
            case 'sun':
                return <Sun className={styles.highlightIconSvg} />;
            case 'globe':
                return <Globe className={styles.highlightIconSvg} />;
            default:
                return <Clock className={styles.highlightIconSvg} />;
        }
    };

    const handleBook = async () => {
        if (scheduleConflict) return;
        setSessionValidateError('');
        if (!selectedSessionId) {
            scrollToDatePassenger();
            return;
        }
        const guestCount = adults + children + infants;
        setSessionValidateLoading(true);
        try {
            const data = await validateBookingSession({
                sessionId: selectedSessionId,
                guestCount: Math.max(1, guestCount),
                tourId: id,
            });
            if (data.valid) {
                const q = new URLSearchParams({
                    sessionId: selectedSessionId,
                    adults: String(adults),
                    children: String(children),
                    infants: String(infants),
                });
                navigate(`/checkout/${id}?${q.toString()}`);
            } else {
                setSessionValidateError(data.message || 'Không thể đặt lịch này. Vui lòng chọn đợt khác hoặc giảm số khách.');
            }
        } catch (e) {
            setSessionValidateError(e.message || 'Không kiểm tra được lịch. Thử lại sau.');
        } finally {
            setSessionValidateLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (favoriteLoading || !id) return;
        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                await removeFavorite(String(id));
                setIsFavorite(false);
            } else {
                await addFavorite(String(id));
                setIsFavorite(true);
            }
        } catch (e) {
            alert(e.message || 'Không thể cập nhật yêu thích.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '64px 24px', textAlign: 'center' }}>
                    Đang tải chi tiết tour...
                </div>
            </div>
        );
    }

    if (loadError || !tour) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <p style={{ marginBottom: 16 }}>{loadError || 'Không có dữ liệu tour.'}</p>
                    <Link to="/tours" style={{ color: '#0099ff' }}>
                        ← Quay lại danh sách tour
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <nav className={styles.breadcrumb}>
                        {tour.breadcrumb.map((item, idx) => (
                            <span key={idx} className={styles.breadcrumbItem}>
                                {idx > 0 && <ChevronRight className={styles.breadcrumbSep} />}
                                {idx === 0 ? (
                                    <Link to="/" className={idx === tour.breadcrumb.length - 1 ? styles.breadcrumbActive : ''}>
                                        {item}
                                    </Link>
                                ) : (
                                    <span className={idx === tour.breadcrumb.length - 1 ? styles.breadcrumbActive : ''}>{item}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                    <div className={styles.topTags}>
                        {tour.tags.map((tag, idx) => (
                            <span key={idx} className={styles.topTag}>
                                <CheckCircle className={styles.topTagIcon} />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.titleSection}>
                    <h1 className={styles.tourTitle}>{tour.title}</h1>
                    <div className={styles.titleMeta}>
                        <span className={styles.locationBadge}>
                            <MapPin className={styles.locationIconSmall} />
                            {tour.location}
                        </span>
                        {tour.rating != null ? (
                            <span className={styles.ratingBadge}>
                                <Star className={styles.starIcon} />
                                {tour.rating} ({tour.reviewCount} đánh giá)
                            </span>
                        ) : null}
                        <button
                            type="button"
                            className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`}
                            onClick={handleToggleFavorite}
                            disabled={favoriteLoading}
                        >
                            <Heart className={styles.favoriteIcon} />
                            {isFavorite ? 'Đã lưu' : 'Lưu tour'}
                        </button>
                    </div>
                </div>

                <div className={styles.gallery}>
                    <div className={styles.galleryMain}>
                        <img
                            src={tour.images.main}
                            alt={tour.title}
                            className={styles.galleryImage}
                            onClick={() => setSelectedImage(tour.images.main)}
                        />
                    </div>
                    <div className={styles.gallerySide}>
                        {tour.images.secondary.map((img, idx) => (
                            <div key={idx} className={styles.gallerySideItem}>
                                <img
                                    src={img}
                                    alt={`${tour.title} ${idx + 2}`}
                                    className={styles.galleryImage}
                                    onClick={() => setSelectedImage(img)}
                                />
                                {idx === 1 && (
                                    <button type="button" className={styles.viewAllBtn} onClick={() => setSelectedImage(tour.images.main)}>
                                        <Layers className={styles.viewAllIcon} />
                                        Xem tất cả ảnh
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {tour.videos.length > 0 ? (
                    <section className={styles.introVideoSection} aria-label="Video giới thiệu">
                        <div className={styles.introVideoHeader}>
                            <Play className={styles.introVideoIcon} />
                            <h2 className={styles.introVideoTitle}>Video giới thiệu</h2>
                        </div>
                        <div className={styles.introVideoList}>
                            {tour.videos.map((video, idx) => (
                                <div key={`${video.src}-${idx}`} className={styles.introVideoCard}>
                                    <div className={styles.introVideoFrame}>
                                        {video.type === 'file' ? (
                                            <video
                                                className={styles.introVideoPlayer}
                                                src={video.src}
                                                poster={video.thumbnailUrl || undefined}
                                                controls
                                                preload="metadata"
                                                playsInline
                                            >
                                                Trình duyệt không phát được video này.
                                            </video>
                                        ) : (
                                            <iframe
                                                className={styles.introVideoPlayer}
                                                src={video.src}
                                                title={video.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        )}
                                    </div>
                                    {video.title ? (
                                        <div className={styles.introVideoCaption}>{video.title}</div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <div className={styles.bodyLayout}>
                    <div className={styles.mainInfo}>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Tổng Quan Chuyến Đi</h2>
                            <p className={styles.overviewText}>{tour.overview}</p>
                            <div className={styles.highlightsGrid}>
                                {tour.highlights.map((h, idx) => (
                                    <div key={idx} className={styles.highlightCard}>
                                        <div className={styles.highlightIconCircle}>{getHighlightIcon(h.icon)}</div>
                                        <div className={styles.highlightLabel}>{h.label}</div>
                                        <div className={styles.highlightValue}>{h.value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.section} ref={datePassengerRef}>
                            <div className={styles.datePassengerSection}>
                                <div className={styles.calendarWrap}>
                                    <div className={styles.datePassengerHeader}>
                                        <div>
                                            <div className={styles.datePassengerTitle}>Chọn đợt khởi hành</div>
                                            <span className={styles.datePassengerSubtitle}>
                                                {bookableSessions.length > 1
                                                    ? `${bookableSessions.length} đợt còn chỗ — chọn ngày đi phù hợp`
                                                    : 'Theo lịch tour thực tế'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.calendarSection}>
                                        {bookableSessions.length === 0 ? (
                                            <p style={{ padding: '8px 0', color: '#555' }}>
                                                Hiện chưa có đợt khởi hành còn chỗ. Vui lòng quay lại sau hoặc liên hệ hotline.
                                            </p>
                                        ) : (
                                            <div className={styles.sessionPickerList}>
                                                {scheduleConflict ? (
                                                    <p className={styles.sessionConflict}>{scheduleConflict}</p>
                                                ) : null}
                                                {bookableSessions.map((s, idx) => {
                                                    const rem =
                                                        (s.maxParticipants ?? 0) - (s.currentParticipants ?? 0);
                                                    const total = s.maxParticipants ?? 0;
                                                    const pct = total > 0
                                                        ? Math.min(100, ((s.currentParticipants ?? 0) / total) * 100)
                                                        : 0;
                                                    const active = selectedSessionId === s.id;
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            onClick={() => setSelectedSessionId(s.id)}
                                                            className={`${styles.sessionPickCard} ${active ? styles.sessionPickCardActive : ''}`}
                                                        >
                                                            <div className={styles.sessionPickTop}>
                                                                <span className={styles.sessionPickIndex}>Đợt {idx + 1}</span>
                                                                {active ? (
                                                                    <span className={styles.sessionPickChosen}>Đã chọn</span>
                                                                ) : null}
                                                            </div>
                                                            <div className={styles.sessionPickDates}>
                                                                <Calendar className={styles.bookingInfoIcon} />
                                                                {formatIsoDateVi(s.startDate)}
                                                                {s.endDate ? ` → ${formatIsoDateVi(s.endDate)}` : ''}
                                                            </div>
                                                            <div className={styles.sessionPickSlots}>
                                                                <div className={styles.sessionPickBar}>
                                                                    <div style={{ width: `${pct}%` }} />
                                                                </div>
                                                                Còn {rem}/{total} chỗ
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.optionsWrap}>
                                    <div className={styles.datePassengerHeader}>
                                        <div>
                                            <div className={styles.optionsTitle}>Du khách</div>
                                            <div className={styles.optionsSubtext}>
                                                Tối đa {maxParty} khách cho đợt đã chọn (tổng mỗi đơn ≤ 20)
                                            </div>
                                        </div>
                                        <button type="button" className={styles.optionsResetBtn} onClick={handleReset}>
                                            <RefreshCw size={12} />
                                            <X size={12} /> Xóa
                                        </button>
                                    </div>
                                    <div className={styles.optionsSection}>
                                        <div className={styles.passengersSection}>
                                            <div className={styles.passengersTitle}>Du khách</div>
                                            <div className={styles.passengersSubtext}>Tối thiểu 1 người lớn</div>

                                            <div className={styles.passengerRow}>
                                                <div className={styles.passengerInfo}>
                                                    <span className={styles.passengerLabel}>Người lớn (từ 11 tuổi trở lên)</span>
                                                </div>
                                                <div className={styles.counterWrap}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${adults <= 1 ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                                        disabled={adults <= 1}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className={styles.counterValue}>{adults}</span>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${adults + children + infants >= maxParty ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setAdults(Math.min(maxParty - children - infants, adults + 1))}
                                                        disabled={adults + children + infants >= maxParty}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.passengerRow}>
                                                <div className={styles.passengerInfo}>
                                                    <span className={styles.passengerLabel}>Trẻ em (độ tuổi 2-10)</span>
                                                </div>
                                                <div className={styles.counterWrap}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${children <= 0 ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                                        disabled={children <= 0}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className={styles.counterValue}>{children}</span>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${adults + children + infants >= maxParty ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setChildren(Math.min(maxParty - adults - infants, children + 1))}
                                                        disabled={adults + children + infants >= maxParty}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.passengerRow}>
                                                <div className={styles.passengerInfo}>
                                                    <span className={styles.passengerLabel}>Trẻ sơ sinh (độ tuổi 0-1)</span>
                                                </div>
                                                <div className={styles.counterWrap}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${infants <= 0 ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setInfants(Math.max(0, infants - 1))}
                                                        disabled={infants <= 0}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className={styles.counterValue}>{infants}</span>
                                                    <button
                                                        type="button"
                                                        className={`${styles.counterBtn} ${adults + children + infants >= maxParty ? styles.counterBtnDisabled : ''}`}
                                                        onClick={() => setInfants(Math.min(maxParty - adults - children, infants + 1))}
                                                        disabled={adults + children + infants >= maxParty}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Bản đồ & Lịch trình</h2>
                            <div className={styles.mapItineraryWrap}>
                                <div className={styles.mapEmbedWrap}>
                                    {tour.mapEmbedUrl ? (
                                        <iframe
                                            title="Tour map"
                                            src={tour.mapEmbedUrl}
                                            className={styles.mapEmbed}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className={styles.mapEmbed} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
                                            Bản đồ sẽ hiển thị khi tour có tọa độ điểm đến.
                                        </div>
                                    )}
                                    <div className={styles.mapMarkers}>
                                        {tour.itinerary.map((day) => (
                                            <button
                                                key={day.day}
                                                type="button"
                                                className={`${styles.mapMarker} ${activeDay === day.day ? styles.mapMarkerActive : ''}`}
                                                onClick={() => setActiveDay(day.day)}
                                                title={`Ngày ${day.day}: ${day.location}`}
                                            >
                                                <MapPin className={styles.mapMarkerIcon} />
                                                <span>Ngày {day.day}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section} ref={(el) => { if (el) dayRefs.current.root = el; }}>
                            <h2 className={styles.sectionTitle}>Lịch Trình Chi Tiết</h2>
                            <div className={styles.timeline}>
                                {(showFullItinerary ? tour.itinerary : tour.itinerary.slice(0, 3)).map((day, idx, arr) => (
                                    <div
                                        key={idx}
                                        className={styles.timelineItem}
                                        ref={(el) => { if (el) dayRefs.current[day.day] = el; }}
                                        data-day={day.day}
                                    >
                                        <div className={styles.timelineLine}>
                                            <button
                                                type="button"
                                                className={`${styles.timelineDot} ${activeDay === day.day ? styles.timelineDotActive : ''}`}
                                                onClick={() => setActiveDay(day.day)}
                                            >
                                                D{day.day}
                                            </button>
                                            {idx < arr.length - 1 && <div className={styles.timelineConnector}></div>}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <h3 className={styles.dayTitle}>{day.title}</h3>
                                            <span className={styles.dayLocation}>
                                                <MapPin className={styles.dayLocationIcon} />
                                                {day.location}
                                            </span>
                                            <ul className={styles.dayDescList}>
                                                {Array.isArray(day.description) ? (
                                                    day.description.map((item, i) => {
                                                        const parts = item.split(': ');
                                                        return (
                                                            <li key={i} className={styles.dayDescItem}>
                                                                {parts.length > 1 ? (
                                                                    <>
                                                                        <strong>{parts[0]}: </strong>
                                                                        {parts.slice(1).join(': ')}
                                                                    </>
                                                                ) : (
                                                                    item
                                                                )}
                                                            </li>
                                                        );
                                                    })
                                                ) : (
                                                    <li className={styles.dayDescItem}>{day.description}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {tour.itinerary.length > 3 && (
                                <button type="button" className={styles.viewFullBtn} onClick={() => setShowFullItinerary(!showFullItinerary)}>
                                    {showFullItinerary ? 'Thu gọn lịch trình ↑' : 'Xem toàn bộ lịch trình ↓'}
                                </button>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitleGreen}>Bao Gồm / Gợi ý</h2>
                            <div className={styles.includedGrid}>
                                {tour.included.map((item, idx) => (
                                    <div key={idx} className={styles.includedItem}>
                                        <CheckCircle className={styles.includedIcon} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {similar.length > 0 ? (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>Có thể bạn cũng thích</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {similar.map((s) => (
                                        <Link key={s.id} to={`/tours/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e6eef5' }}>
                                                <img
                                                    src={resolveMediaUrl(s.thumbnailUrl) || bangkokImgNew}
                                                    alt=""
                                                    style={{ width: '100%', height: 120, objectFit: 'cover' }}
                                                />
                                                <div style={{ padding: 12 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                                                    <div style={{ marginTop: 6, color: '#0099ff' }}>
                                                        {(Number(s.basePrice) || 0).toLocaleString('vi-VN')} ₫
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <div className={styles.stickyCol}>
                        <div className={styles.bookingCard}>
                            <div className={styles.priceRow}>
                                <div>
                                    <span className={styles.fromLabel}>Từ</span>
                                    <div className={styles.priceMain}>
                                        <span className={styles.priceAmount}>{tour.price.toLocaleString('de-DE')} VND</span>
                                        <span className={styles.pricePer}>/ người</span>
                                    </div>
                                </div>
                                {tour.discountPercent ? (
                                    <span className={styles.saveBadge}>Tiết kiệm {tour.discountPercent}%</span>
                                ) : null}
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Đợt khởi hành</label>
                                <button type="button" className={styles.bookingInfoDisplay} onClick={scrollToDatePassenger}>
                                    <Calendar className={styles.bookingInfoIcon} />
                                    <span className={styles.bookingInfoText}>{formatSessionLabel()}</span>
                                    <span className={styles.bookingInfoHint}>Thay đổi</span>
                                </button>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Số Khách</label>
                                <button type="button" className={styles.bookingInfoDisplay} onClick={scrollToDatePassenger}>
                                    <Users className={styles.bookingInfoIcon} />
                                    <span className={styles.bookingInfoText}>{formatPassengerSummary()}</span>
                                    <span className={styles.bookingInfoHint}>Thay đổi</span>
                                </button>
                            </div>

                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>Tổng giá</span>
                                <span className={styles.totalAmount}>{Math.round(totalPrice).toLocaleString('de-DE')} VND</span>
                            </div>

                            {sessionValidateError ? (
                                <p
                                    style={{
                                        margin: '0 0 12px',
                                        padding: '10px 12px',
                                        background: '#fef2f2',
                                        color: '#b91c1c',
                                        borderRadius: 10,
                                        fontSize: 13,
                                    }}
                                >
                                    {sessionValidateError}
                                </p>
                            ) : null}

                            <button
                                type="button"
                                className={styles.bookNowBtn}
                                onClick={handleBook}
                                disabled={Boolean(scheduleConflict) || sessionValidateLoading}
                                style={
                                    scheduleConflict || sessionValidateLoading
                                        ? { opacity: 0.55, cursor: 'not-allowed' }
                                        : undefined
                                }
                            >
                                {sessionValidateLoading
                                    ? 'Đang kiểm tra...'
                                    : scheduleConflict
                                      ? 'Không thể đặt (trùng lịch)'
                                      : 'Đặt Ngay'}
                            </button>
                            <p className={styles.bookNote}>Chọn đợt khởi hành còn chỗ trước khi thanh toán.</p>
                        </div>
                    </div>
                </div>

                {selectedImage && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button type="button" className={styles.closeModalBtn} onClick={() => setSelectedImage(null)}>
                                <X className={styles.closeIcon} />
                            </button>
                            <img src={selectedImage} alt="Phóng to" className={styles.modalImage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TourDetail;
