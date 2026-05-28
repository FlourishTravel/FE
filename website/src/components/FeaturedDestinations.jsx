import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, MessageSquareText, ArrowRight, ChevronRight } from 'lucide-react';
import bangkokImgNew from '../assets/di-chuyen-di-lai-thai-lan-2.webp';
import styles from './FeaturedDestinations.module.css';
import { listPublicTours } from '../api/tours';
import { resolveMediaUrl } from '../api/config';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

function formatDuration(t) {
    const d = t?.durationDays;
    const n = t?.durationNights;
    if (d && n != null) return `${d} ngày / ${n} đêm`;
    if (d) return `${d} ngày`;
    return '—';
}

function remainingSlots(t) {
    const es = t?.earliestSession;
    if (!es || es.status !== 'scheduled') return null;
    const max = es.maxParticipants ?? 0;
    const cur = es.currentParticipants ?? 0;
    const r = max - cur;
    return r > 0 ? r : null;
}

const FeaturedDestinations = () => {
    const destinations = [
        {
            id: 1,
            title: 'Bangkok - Pattaya: Khám Phá Xứ Sở Chùa Vàng',
            country: 'THÁI LAN',
            duration: '5 ngày / 4 đêm',
            location: 'Bangkok - Pattaya',
            image: bangkokImgNew,
            price: 8690000,
            code: 'FL-THAI-2026-001',
            startDate: '05/06/2026',
            startPoint: 'TP. Hồ Chí Minh',
            spots: 9,
            description: 'Khám phá Bangkok nhộn nhịp, viếng chùa Phật Ngọc linh thiêng và tận hưởng bãi biển Pattaya thơ mộng cùng các show diễn độc đáo.'
        },
        {
            id: 2,
            title: 'Hành Trình Huyền Bí: Siem Reap - Angkor Thom',
            country: 'CAMPUCHIA',
            duration: '4 ngày / 3 đêm',
            location: 'Siem Reap - Angkor Thom',
            image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 6590000,
            code: 'FL-CAM-2026-002',
            startDate: '22/05/2026',
            startPoint: 'TP. Hồ Chí Minh',
            spots: 4,
            description: 'Hành trình tâm linh đầy huyền bí xuyên qua đền Angkor cổ kính, kỳ vĩ và khám phá thủ đô Phnom Penh thanh bình bên dòng Mê Kông.'
        },
        {
            id: 3,
            title: 'Con Đường Di Sản Miền Trung: Hội An - Huế - Đà Nẵng',
            country: 'VIỆT NAM',
            duration: '7 ngày / 6 đêm',
            location: 'Hội An - Huế - Đà Nẵng',
            image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 7790000,
            code: 'FL-VN-2026-003',
            startDate: '19/06/2026',
            startPoint: 'Đà Nẵng',
            spots: 7,
            description: 'Tour trải nghiệm dành cho những du khách yêu thích di sản văn hóa, ẩm thực phong phú miền Trung và những bãi biển xanh cát trắng.'
        },
        {
            id: 4,
            title: 'Thiên Đường Nghỉ Dưỡng Bali: Khám Phá Văn Hóa Bản Địa',
            country: 'INDONESIA',
            duration: '4 ngày / 3 đêm',
            location: 'Bali',
            image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 9890000,
            code: 'FL-BALI-2026-004',
            startDate: '26/06/2026',
            startPoint: 'TP. Hồ Chí Minh',
            spots: 10,
            description: 'Trải nghiệm đi xe máy băng qua ruộng bậc thang xanh ngát, check-in xích đu Bali Swing và đón hoàng hôn lãng mạn trên đền Tanah Lot.'
        },
        {
            id: 5,
            title: 'Đảo Ngọc Phú Quốc: Lặn Ngắm San Hô & Vui Chơi VinWonders',
            country: 'VIỆT NAM',
            duration: '3 ngày / 2 đêm',
            location: 'Phú Quốc',
            image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 4590000,
            code: 'FL-PQ-2026-005',
            startDate: '10/06/2026',
            startPoint: 'TP. Hồ Chí Minh',
            spots: 8,
            description: 'Nghỉ dưỡng tại Đảo Ngọc Phú Quốc, vui chơi tại VinWonders, Grand World và ngắm hoàng hôn tuyệt đẹp trên bãi Trường.'
        },
        {
            id: 6,
            title: 'Nhật Bản Cổ Kính & Hiện Đại: Tokyo - Núi Phú Sĩ - Kyoto',
            country: 'NHẬT BẢN',
            duration: '6 ngày / 5 đêm',
            location: 'Tokyo - Kyoto - Osaka',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 28990000,
            code: 'FL-JAP-2026-006',
            startDate: '15/06/2026',
            startPoint: 'Hà Nội',
            spots: 6,
            description: 'Hành trình khám phá thủ đô Tokyo nhộn nhịp, chiêm ngưỡng núi Phú Sĩ hùng vĩ và trải nghiệm nét cổ kính của cố đô Kyoto.'
        },
        {
            id: 7,
            title: 'Hành Trình Xứ Sở Kim Chi: Seoul - Đảo Nami - Everland',
            country: 'HÀN QUỐC',
            duration: '5 ngày / 4 đêm',
            location: 'Seoul - Nami',
            image: 'https://images.unsplash.com/photo-1538669715516-b2358f3479ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            price: 15490000,
            code: 'FL-KOR-2026-007',
            startDate: '18/06/2026',
            startPoint: 'TP. Hồ Chí Minh',
            spots: 12,
            description: 'Khám phá cung điện Gyeongbokgung cổ kính, dạo bước trên hòn đảo Nami lãng mạn và thỏa sức vui chơi tại công viên Everland.'
        }
    ];

    const gridRef = useRef(null);
    const hasDragged = useRef(false);
    const [tours, setTours] = useState([]);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftVal, setScrollLeftVal] = useState(0);

    useEffect(() => {
        let alive = true;
        listPublicTours({ size: 10 })
            .then((res) => {
                if (alive && res && res.content && res.content.length > 0) {
                    setTours(res.content);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch public tours for home:', err);
            });
        return () => {
            alive = false;
        };
    }, []);

    const handleMouseDown = (e) => {
        setIsDown(true);
        hasDragged.current = false;
        setStartX(e.pageX - gridRef.current.offsetLeft);
        setScrollLeftVal(gridRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDown(false);
    };

    const handleMouseUp = () => {
        setIsDown(false);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gridRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Tốc độ cuộn chuột
        if (Math.abs(x - startX) > 5) {
            hasDragged.current = true;
        }
        gridRef.current.scrollLeft = scrollLeftVal - walk;
    };

    const getNormalizedTours = () => {
        if (tours.length > 0) {
            return tours.map((t) => ({
                id: t.id,
                title: t.title,
                country: t.category?.name || 'TRẢI NGHIỆM',
                duration: formatDuration(t),
                image: resolveMediaUrl(t.thumbnailUrl) || PLACEHOLDER_IMG,
                spots: remainingSlots(t),
                link: `/tours/${t.id}`,
                showPlayBtn: false
            }));
        }
        return destinations.map((d) => ({
            id: d.id,
            title: d.title,
            country: d.country,
            duration: d.duration,
            image: d.image,
            spots: d.spots,
            link: `/checkout/${d.id}`,
            showPlayBtn: d.id === 2
        }));
    };

    const displayTours = getNormalizedTours();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.headerWrapper}>
                    <div className={styles.headerTitles}>
                        <h2 className={styles.title}>
                            TOUR NỔI BẬT
                        </h2>
                        <p className={styles.subtitle}>
                            Khám phá những hành trình du lịch được tuyển chọn và thiết kế chuyên nghiệp nhất cho trải nghiệm không thể nào quên.
                        </p>
                    </div>
                </div>

                <div className={styles.gridWrapper}>
                    <div
                        ref={gridRef}
                        className={styles.grid}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onDragStart={(e) => e.preventDefault()}
                        style={{
                            cursor: isDown ? 'grabbing' : 'grab',
                            scrollSnapType: isDown ? 'none' : 'x mandatory',
                            scrollBehavior: isDown ? 'auto' : 'smooth'
                        }}
                    >
                        {displayTours.map((dest) => (
                            <Link
                                key={dest.id}
                                to={dest.link}
                                className={styles.card}
                                onClick={(e) => {
                                    if (hasDragged.current) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <img src={dest.image} alt={dest.title} className={styles.cardImage} draggable="false" />
                                <div className={styles.cardOverlay}></div>
                                <div className={styles.cardContent}>
                                    <span className={styles.countryTag}>{dest.country}</span>
                                    <h3 className={styles.cardTitle}>{dest.title}</h3>
                                    <div className={styles.cardMeta}>
                                        <div className={styles.metaItem}>
                                            <Clock className={styles.metaIcon} />
                                            <span>{dest.duration}</span>
                                        </div>
                                        {dest.spots != null && (
                                            <div className={styles.metaItem}>
                                                <Users className={styles.metaIcon} />
                                                <span>Còn {dest.spots} chỗ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {dest.showPlayBtn && (
                                    <div className={styles.playButtonCircle}>
                                        <div className={styles.innerCircle}></div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                    <Link to="/tours" className={styles.rightArrowBtn} title="Xem tất cả tour trải nghiệm">
                        <ChevronRight className={styles.arrowIconRight} />
                    </Link>
                </div>

                <div className={styles.viewAllWrapper}>
                    <Link to="/tours" className={styles.viewAllBtn}>
                        Xem tất cả tour <ArrowRight className={styles.arrowIcon} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedDestinations;

