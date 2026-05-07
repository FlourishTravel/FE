import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, Users, ChevronLeft, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react';
import styles from './TourListing.module.css';

const MOCK_TOURS = [
    {
        id: 1,
        title: 'Khám Phá Rừng Nhiệt Đới',
        location: 'Monteverde, Costa Rica',
        description: 'Tắt hết kết nối. Ở trong những ngôi nhà trên cây chạy bằng năng lượng mặt trời, hái lượm cùng cộng đồng địa phương và tái kết nối với thiên nhiên.',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        price: 850,
        duration: '7 Ngày',
        groupSize: 'Nhóm nhỏ (Tối đa 8)',
        tag: 'BỀN VỮNG',
        tagColor: 'green',
        spotsLeft: 3,
    },
    {
        id: 2,
        title: 'Đảo Bí Mật - Nghệ Thuật & Âm Nhạc',
        location: 'Bờ biển Dalmatian, Croatia',
        description: 'DJ ngầm, hội thảo sức khỏe, và chèo thuyền giữa các hòn đảo hoang sơ cho trải nghiệm khó quên.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
        price: 1200,
        duration: '5 Ngày',
        groupSize: 'Không khí sôi động',
        tag: 'TRẢI NGHIỆM ĐẶC BIỆT',
        tagColor: 'navy',
        spotsLeft: null,
    },
    {
        id: 3,
        title: 'Nghệ Thuật Đường Phố & Văn Hóa',
        location: 'Berlin, Đức',
        description: 'Khám phá lịch sử văn hóa đường phố của thành phố qua góc nhìn của các nghệ sĩ, nhà hoạt động và những nhà sáng tạo.',
        image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
        price: 350,
        duration: '3 Ngày',
        groupSize: 'Đi bộ chuyên sâu',
        tag: 'CỘNG ĐỒNG',
        tagColor: 'red',
        spotsLeft: null,
    },
    {
        id: 4,
        title: 'Suối Nước Nóng & Trek Rừng Rậm',
        location: 'Arenal, Costa Rica',
        description: 'Đi bộ qua địa hình núi lửa xanh tươi, ngâm mình trong suối nước nóng tự nhiên và khám phá thác nước ẩn trong rừng mây.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
        price: 720,
        duration: '5 Ngày',
        groupSize: 'Nhóm nhỏ (Tối đa 10)',
        tag: 'BỀN VỮNG',
        tagColor: 'green',
        spotsLeft: 5,
    },
    {
        id: 5,
        title: 'Đền Cổ & Ruộng Bậc Thang',
        location: 'Ubud, Bali',
        description: 'Đắm mình trong văn hóa Bali: tham quan đền thiêng, dạo qua những cánh đồng lúa xanh mướt và học nghề thủ công truyền thống.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        price: 580,
        duration: '6 Ngày',
        groupSize: 'Trải nghiệm văn hóa',
        tag: 'TRẢI NGHIỆM ĐẶC BIỆT',
        tagColor: 'navy',
        spotsLeft: null,
    },
    {
        id: 6,
        title: 'Chuyến Thám Hiểm Chụp Ảnh Cực Quang',
        location: 'Tromsø, Na Uy',
        description: 'Săn cực quang cùng nhiếp ảnh gia chuyên nghiệp, nghỉ trong lều kính và trải nghiệm hoang dã Bắc Cực như chưa từng có.',
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
        price: 1450,
        duration: '4 Ngày',
        groupSize: 'Nhóm nhỏ (Tối đa 6)',
        tag: 'CỘNG ĐỒNG',
        tagColor: 'red',
        spotsLeft: 2,
    },
];

const VIBES = ['Thư giãn & Kết nối', 'Phiêu lưu mạo hiểm', 'Vui chơi địa phương', 'Tìm hiểu văn hóa'];
const SUSTAINABILITY = ['Chứng nhận Eco', 'Trung hòa carbon', 'Cộng đồng'];

const TourListing = () => {
    const [selectedVibes, setSelectedVibes] = useState(['Thư giãn & Kết nối']);
    const [selectedBudget, setSelectedBudget] = useState('Up to $150');
    const [selectedSustainability, setSelectedSustainability] = useState(['Chứng nhận Eco']);
    const [savedTours, setSavedTours] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('Đề xuất');

    const toggleVibe = (vibe) => {
        setSelectedVibes(prev =>
            prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
        );
    };

    const toggleSustainability = (item) => {
        setSelectedSustainability(prev =>
            prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
        );
    };

    const toggleSave = (id) => {
        setSavedTours(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setSelectedVibes([]);
        setSelectedBudget('Dưới 3tr');
        setSelectedSustainability([]);
    };

    const getTagClass = (color) => {
        switch (color) {
            case 'green': return styles.tagGreen;
            case 'navy': return styles.tagNavy;
            case 'red': return styles.tagRed;
            default: return styles.tagGreen;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.layout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2 className={styles.sidebarTitle}>Bộ lọc</h2>
                        <button className={styles.resetBtn} onClick={resetFilters}>
                            <RotateCcw className={styles.resetIcon} /> Đặt lại
                        </button>
                    </div>

                    {/* Vibe */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>PHONG CÁCH</h3>
                        <div className={styles.vibeList}>
                            {VIBES.map((vibe) => (
                                <label key={vibe} className={styles.vibeItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedVibes.includes(vibe)}
                                        onChange={() => toggleVibe(vibe)}
                                        className={styles.vibeCheckbox}
                                    />
                                    <span className={styles.vibeText}>{vibe}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>NGÂN SÁCH (MỖI NGÀY)</h3>
                        <div className={styles.budgetRow}>
                            {['500k', 'Dưới 3tr', '10tr+'].map((b) => (
                                <button
                                    key={b}
                                    className={`${styles.budgetBtn} ${selectedBudget === b ? styles.budgetActive : ''}`}
                                    onClick={() => setSelectedBudget(b)}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                        <div className={styles.budgetBar}>
                            <div className={styles.budgetFill}></div>
                        </div>
                    </div>

                    {/* Sustainability */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterLabel}>MỨC ĐỘ BỀN VỮNG</h3>
                        <div className={styles.sustainPills}>
                            {SUSTAINABILITY.map((item) => (
                                <button
                                    key={item}
                                    className={`${styles.sustainPill} ${selectedSustainability.includes(item) ? styles.sustainActive : ''}`}
                                    onClick={() => toggleSustainability(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className={styles.applyBtn}>
                        Áp dụng bộ lọc
                    </button>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {/* Header */}
                    <div className={styles.mainHeader}>
                        <div>
                            <h1 className={styles.mainTitle}>Khám Phá Trải Nghiệm Độc Đáo</h1>
                            <p className={styles.mainSubtitle}>Hiển thị {MOCK_TOURS.length} hành trình được tuyển chọn.</p>
                        </div>
                        <div className={styles.sortContainer}>
                            <span className={styles.sortLabel}>Sắp xếp:</span>
                            <div className={styles.sortDropdown}>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={styles.sortSelect}
                                >
                                    <option>Đề xuất</option>
                                    <option>Giá: Thấp đến Cao</option>
                                    <option>Giá: Cao đến Thấp</option>
                                    <option>Thời gian</option>
                                </select>
                                <ChevronDown className={styles.sortIcon} />
                            </div>
                        </div>
                    </div>

                    {/* Tour Grid */}
                    <div className={styles.tourGrid}>
                        {MOCK_TOURS.map((tour) => (
                            <Link key={tour.id} to={`/tours/${tour.id}`} className={styles.tourCardLink}>
                                <div className={styles.tourCard}>
                                    {/* Image Section */}
                                    <div className={styles.cardImageContainer}>
                                        <img src={tour.image} alt={tour.title} className={styles.cardImage} />
                                        <span className={`${styles.cardTag} ${getTagClass(tour.tagColor)}`}>{tour.tag}</span>
                                        {tour.spotsLeft && (
                                            <span className={styles.spotsLeft}>Chỉ còn {tour.spotsLeft} chỗ</span>
                                        )}
                                        <button
                                            className={`${styles.heartBtn} ${savedTours.includes(tour.id) ? styles.heartActive : ''}`}
                                            onClick={(e) => { e.preventDefault(); toggleSave(tour.id); }}
                                        >
                                            <Heart className={styles.heartIcon} />
                                        </button>
                                    </div>

                                    {/* Content Section */}
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardLocation}>
                                            <MapPin className={styles.locationIcon} />
                                            <span>{tour.location}</span>
                                        </div>
                                        <h3 className={styles.cardTitle}>{tour.title}</h3>
                                        <p className={styles.cardDesc}>{tour.description}</p>

                                        <div className={styles.cardAttributes}>
                                            <span className={styles.attribute}>
                                                <Clock className={styles.attrIcon} />
                                                {tour.duration}
                                            </span>
                                            <span className={styles.attribute}>
                                                <Users className={styles.attrIcon} />
                                                {tour.groupSize}
                                            </span>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.priceSection}>
                                                <span className={styles.fromText}>Từ</span>
                                                <span className={styles.price}>${tour.price.toLocaleString()}</span>
                                            </div>
                                            <span className={styles.detailsBtn}>
                                                Chi tiết
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <button className={styles.pageBtn} disabled>
                            <ChevronLeft className={styles.pageIcon} />
                        </button>
                        {[1, 2, 3].map((page) => (
                            <button
                                key={page}
                                className={`${styles.pageBtn} ${currentPage === page ? styles.pageActive : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <span className={styles.pageDots}>...</span>
                        <button className={styles.pageBtn} onClick={() => setCurrentPage(8)}>8</button>
                        <button className={styles.pageBtn}>
                            <ChevronRight className={styles.pageIcon} />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TourListing;
