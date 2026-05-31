import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Check, Plus, Minus, Map, ChevronRight } from 'lucide-react';
import styles from './Destinations.module.css';

const Destinations = () => {
    // State for interactive UI elements
    const [selectedDest, setSelectedDest] = useState('Bangkok');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [budget, setBudget] = useState(15000000);
    const [activeTab, setActiveTab] = useState(1);
    const [startDate, setStartDate] = useState('2026-06-09');
    const [endDate, setEndDate] = useState('2026-06-12');
    
    const [stylesSelected, setStylesSelected] = useState({
        'Biển đảo': true, 'Nghỉ dưỡng': false, 'Trải nghiệm': false, 'Ẩm thực': true, 'Thiên nhiên': false
    });

    const [services, setServices] = useState({
        'Vé máy bay': true, 'Khách sạn': true, 'Tour': false, 'SIM/eSIM': false, 'Taxi': false, 'Xe đưa đón': false
    });

    const serviceIcons = {
        'Vé máy bay': '✈️', 'Khách sạn': '🏨', 'Tour': '🚩', 'SIM/eSIM': '📱', 'Taxi': '🚕', 'Xe đưa đón': '🚐'
    };

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    const toggleStyle = (style) => setStylesSelected(prev => ({ ...prev, [style]: !prev[style] }));
    const toggleService = (service) => setServices(prev => ({ ...prev, [service]: !prev[service] }));

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsGenerated(true);
        }, 1500);
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const calculateDuration = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '0 ngày 0 đêm';
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 'Trong ngày';
        return `${diffDays + 1} ngày ${diffDays} đêm`;
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.aiBadge}>
                        <Sparkles className={styles.aiIconSmall} size={16} />
                        <span>Flora AI</span>
                    </div>
                    <h1 className={styles.title}>Lập kế hoạch du lịch thông minh cùng Flora AI</h1>
                    <p className={styles.subtitle}>
                        Nhập nhu cầu - Flora phân tích ngân sách, thời tiết và sở thích để tạo lịch trình tối ưu.
                    </p>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Left Sidebar - Form */}
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Yêu cầu của bạn</h2>

                    {/* Destination */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Điểm đến yêu thích</label>
                        <div className={styles.chipGroup}>
                            {['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi'].map(dest => (
                                <button 
                                    key={dest} 
                                    className={`${styles.chip} ${selectedDest === dest ? styles.chipActive : ''}`}
                                    onClick={() => setSelectedDest(dest)}
                                >
                                    {dest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Thời gian chuyến đi</label>
                        <div className={styles.dateInputs}>
                            <div className={styles.dateInputWrapper}>
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={styles.dateInput} 
                                    style={{ paddingRight: '0.75rem' }}
                                />
                            </div>
                            <div className={styles.dateInputWrapper}>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={styles.dateInput} 
                                    style={{ paddingRight: '0.75rem' }}
                                />
                            </div>
                        </div>
                        <span className={styles.durationText}>{calculateDuration()}</span>
                    </div>

                    {/* Guests */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Số lượng khách</label>
                        <div className={styles.guestInputs}>
                            <div className={styles.guestControl}>
                                <span>Người lớn</span>
                                <div className={styles.counter}>
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className={styles.counterBtn}><Minus size={14} /></button>
                                    <span className={styles.counterValue}>{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className={styles.counterBtn}><Plus size={14} /></button>
                                </div>
                            </div>
                            <div className={styles.guestControl}>
                                <span>Trẻ em</span>
                                <div className={styles.counter}>
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className={styles.counterBtn}><Minus size={14} /></button>
                                    <span className={styles.counterValue}>{children}</span>
                                    <button onClick={() => setChildren(children + 1)} className={styles.counterBtn}><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ngân sách: <span>{formatCurrency(budget)}</span></label>
                        <input 
                            type="range" 
                            min="5000000" 
                            max="50000000" 
                            step="1000000"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className={styles.rangeSlider} 
                        />
                        <div className={styles.rangeLabels}>
                            <span>5 triệu</span>
                            <span>15 triệu</span>
                            <span>25 triệu</span>
                            <span>50 triệu</span>
                        </div>
                    </div>

                    {/* Travel Style */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Phong cách du lịch</label>
                        <div className={styles.checkboxGrid}>
                            {Object.keys(stylesSelected).map(style => (
                                <label key={style} className={styles.checkboxLabel}>
                                    <input 
                                        type="checkbox" 
                                        checked={stylesSelected[style]}
                                        onChange={() => toggleStyle(style)}
                                        className={styles.checkbox}
                                    />
                                    {style}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mức độ trải nghiệm</label>
                        <input type="range" min="0" max="100" defaultValue="50" className={styles.rangeSlider} />
                        <div className={styles.rangeLabels}>
                            <span>Thư giãn</span>
                            <span>Khám phá</span>
                        </div>
                    </div>

                    {/* Included Services */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Dịch vụ đi kèm</label>
                        <div className={styles.serviceGrid}>
                            {Object.keys(services).map(service => (
                                <label key={service} className={`${styles.serviceLabel} ${services[service] ? styles.serviceLabelActive : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={services[service]}
                                        onChange={() => toggleService(service)}
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.serviceIcon}>{serviceIcons[service]}</span>
                                    <span>{service}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className={styles.submitBtn} onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <div className={styles.spinner}></div>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Tạo lịch trình cùng Flora AI
                            </>
                        )}
                    </button>
                </div>

                {/* Right Main Content */}
                <div className={styles.content}>
                    {!isGenerated ? (
                        <div className={styles.emptyStateCard}>
                            <div className={styles.emptyStateIconWrapper}>
                                <Sparkles size={32} className={styles.emptyStateIcon} />
                            </div>
                            <h3 className={styles.emptyStateTitle}>Lịch trình AI sẽ hiển thị ở đây</h3>
                            <p className={styles.emptyStateSubtitle}>Điền thông tin bên trái và nhấn nút tạo lịch trình để bắt đầu</p>
                            <div className={styles.emptyStateChips}>
                                <span className={styles.emptyStateChip}>✦ Phân tích ngân sách</span>
                                <span className={styles.emptyStateChip}>✦ Kiểm tra thời tiết</span>
                                <span className={styles.emptyStateChip}>✦ Tối ưu điểm tham quan</span>
                                <span className={styles.emptyStateChip}>✦ Đề xuất nhà hàng</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Top Summary Banner */}
                            <div className={styles.summaryBanner}>
                                <div className={styles.bannerHeader}>
                                    <div className={styles.brandIconWrapper}>
                                        <Sparkles className={styles.brandIcon} size={24} />
                                    </div>
                                    <div className={styles.bannerTitles}>
                                        <h3>Flora đã tối ưu lịch trình</h3>
                                        <h2>{calculateDuration()} • {selectedDest}</h2>
                                    </div>
                                </div>
                                <div className={styles.bannerChips}>
                                    <span className={styles.summaryChip}><Check size={14} /> Phân tích ngân sách</span>
                                    <span className={styles.summaryChip}><Check size={14} /> Kiểm tra thời tiết</span>
                                    <span className={styles.summaryChip}><Check size={14} /> Tối ưu điểm tham quan</span>
                                    <span className={styles.summaryChip}><Check size={14} /> Đề xuất nhà hàng</span>
                                </div>
                            </div>

                    {/* Day Tabs */}
                    <div className={styles.tabs}>
                        {[1, 2, 3, 4].map(day => (
                            <button 
                                key={day}
                                className={`${styles.tabBtn} ${activeTab === day ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(day)}
                            >
                                Ngày {day}
                            </button>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className={styles.timelineCard}>
                        <h4 className={styles.timelineTitle}>Ngày {activeTab} <span className={styles.timelineSubtitle}>- Bangkok</span></h4>
                        
                        <div className={styles.timeline}>
                            {/* Item 1 */}
                            <div className={styles.timelineItem}>
                                <div className={styles.timeBlock}>08:00</div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.activityCard}>
                                        <img src="https://images.unsplash.com/photo-1583491470869-dcb82eb287e0?auto=format&fit=crop&w=200&q=80" alt="Bangkok" className={styles.activityImage} />
                                        <div className={styles.activityInfo}>
                                            <h5>Đến Bangkok</h5>
                                            <p>Check-in và làm quen khu vực</p>
                                            <span className={styles.locationTag}><MapPin size={12}/> Bangkok</span>
                                        </div>
                                        <span className={`${styles.activityTag} ${styles.tagTransport}`}>Di chuyển</span>
                                    </div>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className={styles.timelineItem}>
                                <div className={styles.timeBlock}>10:00</div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.activityCard}>
                                        <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80" alt="Breakfast" className={styles.activityImage} />
                                        <div className={styles.activityInfo}>
                                            <h5>Ăn sáng tại khách sạn</h5>
                                            <p>Nạp năng lượng cho ngày mới</p>
                                            <span className={styles.locationTag}><MapPin size={12}/> Bangkok</span>
                                        </div>
                                        <span className={`${styles.activityTag} ${styles.tagFood}`}>Ẩm thực</span>
                                    </div>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className={styles.timelineItem}>
                                <div className={styles.timeBlock}>12:00</div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.activityCard}>
                                        <img src="https://images.unsplash.com/photo-1572007886616-628d02e3b2e5?auto=format&fit=crop&w=200&q=80" alt="Grand Palace" className={styles.activityImage} />
                                        <div className={styles.activityInfo}>
                                            <h5>Grand Palace</h5>
                                            <p>Cung điện Hoàng gia</p>
                                            <span className={styles.locationTag}><MapPin size={12}/> Bangkok</span>
                                        </div>
                                        <span className={`${styles.activityTag} ${styles.tagVisit}`}>Tham quan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Item 4 */}
                            <div className={styles.timelineItem}>
                                <div className={styles.timeBlock}>14:00</div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.activityCard}>
                                        <img src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=200&q=80" alt="Wat Pho" className={styles.activityImage} />
                                        <div className={styles.activityInfo}>
                                            <h5>Wat Pho</h5>
                                            <p>Chùa Phật nằm</p>
                                            <span className={styles.locationTag}><MapPin size={12}/> Bangkok</span>
                                        </div>
                                        <span className={`${styles.activityTag} ${styles.tagVisit}`}>Tham quan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className={styles.addActivityBtn}>
                            <Plus size={16} />
                            Thêm hoạt động mới
                        </button>
                    </div>

                    {/* Bottom Section */}
                    <div className={styles.bottomGrid}>
                        {/* Budget Estimate */}
                        <div className={styles.budgetCard}>
                            <h4 className={styles.cardTitle}>Dự toán ngân sách</h4>
                            <div className={styles.budgetList}>
                                <div className={styles.budgetItem}>
                                    <span>Vé máy bay (khứ hồi)</span>
                                    <span>9.000.000đ</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Khách sạn (3 đêm)</span>
                                    <span>3.600.000đ</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Ăn uống & chi tiêu</span>
                                    <span>3.040.000đ</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Vé tham quan</span>
                                    <span>6.000.000đ</span>
                                </div>
                                <div className={styles.budgetItem}>
                                    <span>Di chuyển</span>
                                    <span>4.000.000đ</span>
                                </div>
                            </div>
                            <div className={styles.budgetTotal}>
                                <span>Tổng</span>
                                <span className={styles.totalAmount}>25.640.000đ</span>
                            </div>
                            <p className={styles.budgetNote}>Ngân sách mục tiêu: 15.000.000đ - Vượt ngân sách</p>
                        </div>

                        {/* Map */}
                        <div className={styles.mapCard}>
                            <h4 className={styles.cardTitle}>Bản đồ - 4 địa điểm trong Ngày {activeTab}</h4>
                            <div className={styles.mapContainer}>
                                {/* Map iframe mock */}
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124040.91617269145!2d100.42273617342674!3d13.724600491877478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b25de24820!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1716301385412!5m2!1sen!2s" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Map of Bangkok"
                                ></iframe>
                                {/* Map controls overlay */}
                                <div className={styles.mapControls}>
                                    <button className={styles.mapBtn}><Plus size={16}/></button>
                                    <button className={styles.mapBtn}><Minus size={16}/></button>
                                </div>
                                {/* Map Legend mock */}
                                <div className={styles.mapLegend}>
                                    <span><span style={{color:'#ef4444'}}>●</span> Hotel</span>
                                    <span><span style={{color:'#f59e0b'}}>●</span> Restaurant</span>
                                    <span><span style={{color:'#3b82f6'}}>●</span> Attraction</span>
                                </div>
                            </div>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Destinations;
