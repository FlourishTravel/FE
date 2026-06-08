import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Check, Plus, Minus, Map, ChevronRight } from 'lucide-react';
import styles from './Destinations.module.css';
import { generatePlannerApi } from '../../api/planner';
import { resolveMediaUrl } from '../../api/config';

// Budget mapping helpers to align non-linear budget tiers with linear slider position
const budgetToSlider = (value) => {
    if (value <= 15000000) {
        return (value - 5000000) / 10000000;
    } else if (value <= 25000000) {
        return 1 + (value - 15000000) / 10000000;
    } else {
        return 2 + (value - 25000000) / 25000000;
    }
};

const sliderToBudget = (x) => {
    let val;
    if (x <= 1) {
        val = 5000000 + x * 10000000;
    } else if (x <= 2) {
        val = 15000000 + (x - 1) * 10000000;
    } else {
        val = 25000000 + (x - 2) * 25000000;
    }
    // Round to nearest 500,000 for cleaner steps
    return Math.round(val / 500000) * 500000;
};

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
        'Vé máy bay': '', 'Khách sạn': '', 'Tour': '', 'SIM/eSIM': '', 'Taxi': '', 'Xe đưa đón': ''
    };

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState(50);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const toggleStyle = (style) => setStylesSelected(prev => ({ ...prev, [style]: !prev[style] }));
    const toggleService = (service) => setServices(prev => ({ ...prev, [service]: !prev[service] }));

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg(null);
        try {
            const styleMap = {
                'Biển đảo': 'beach',
                'Nghỉ dưỡng': 'resort',
                'Trải nghiệm': 'adventure',
                'Ẩm thực': 'food',
                'Thiên nhiên': 'nature'
            };
            const mappedStyles = Object.keys(stylesSelected)
                .filter(style => stylesSelected[style])
                .map(style => styleMap[style] || style.toLowerCase());

            const mappedTransport = [];
            if (services['Taxi']) mappedTransport.push('taxi');
            if (services['Xe đưa đón']) mappedTransport.push('transfer');

            const payload = {
                destinations: [selectedDest.toLowerCase()],
                startDate,
                endDate,
                adults,
                children,
                budgetVnd: budget,
                budgetPerPerson: false,
                styles: mappedStyles,
                experienceLevel,
                includeFlight: !!services['Vé máy bay'],
                hotelStars: services['Khách sạn'] ? 4 : null,
                transport: mappedTransport
            };

            const data = await generatePlannerApi(payload);
            setGeneratedPlan(data);
            setActiveTab(1);
            setIsGenerated(true);
        } catch (err) {
            console.error('Tạo lịch trình thất bại:', err);
            setErrorMsg(err.message || 'Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại!');
        } finally {
            setIsGenerating(false);
        }
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
                            min="0"
                            max="3"
                            step="0.02"
                            value={budgetToSlider(budget)}
                            onChange={(e) => setBudget(sliderToBudget(Number(e.target.value)))}
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
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(Number(e.target.value))}
                            className={styles.rangeSlider}
                        />
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

                    {errorMsg && (
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #fca5a5' }}>
                            {errorMsg}
                        </div>
                    )}

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
                                        <h2>{generatedPlan?.tripSummary || `${calculateDuration()} • ${selectedDest}`}</h2>
                                    </div>
                                </div>
                                <div className={styles.bannerChips}>
                                    {generatedPlan?.optimization?.steps?.map((step, idx) => (
                                        <span key={step} className={styles.summaryChip}>
                                            <Check size={14} /> {step}
                                        </span>
                                    )) || (
                                            <>
                                                <span className={styles.summaryChip}><Check size={14} /> Phân tích ngân sách</span>
                                                <span className={styles.summaryChip}><Check size={14} /> Kiểm tra thời tiết</span>
                                                <span className={styles.summaryChip}><Check size={14} /> Tối ưu điểm tham quan</span>
                                                <span className={styles.summaryChip}><Check size={14} /> Đề xuất nhà hàng</span>
                                            </>
                                        )}
                                </div>
                            </div>

                            {/* Weather Suggestion / AI Suggestions */}
                            {generatedPlan?.suggestion && (
                                <div style={{
                                    backgroundColor: '#fffbeb',
                                    border: '1px solid #fef3c7',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ backgroundColor: '#fef3c7', padding: '0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles style={{ color: '#d97706' }} size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#92400e' }}>Đề xuất thông minh từ Flora AI</h4>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#b45309' }}>{generatedPlan.suggestion.message}</p>
                                        </div>
                                    </div>

                                    {generatedPlan.suggestion.suggestedActivityTitle && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #f3f4f6',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                            alignItems: 'center'
                                        }}>
                                            {generatedPlan.suggestion.suggestedImageUrl && (
                                                <img
                                                    src={resolveMediaUrl(generatedPlan.suggestion.suggestedImageUrl)}
                                                    alt={generatedPlan.suggestion.suggestedActivityTitle}
                                                    style={{ width: '80px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover' }}
                                                />
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>THAY THẾ GỢI Ý</span>
                                                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1f2937' }}>{generatedPlan.suggestion.suggestedActivityTitle}</h5>
                                                </div>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                                                    {generatedPlan.suggestion.suggestedActivityDescription} (Thay cho: <strong>{generatedPlan.suggestion.currentActivityTitle}</strong>)
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setGeneratedPlan(prev => {
                                                        if (!prev) return prev;
                                                        const updatedDays = prev.days.map(d => {
                                                            const updatedActivities = d.activities.map(act => {
                                                                if (act.title === prev.suggestion.currentActivityTitle) {
                                                                    return {
                                                                        ...act,
                                                                        title: prev.suggestion.suggestedActivityTitle,
                                                                        description: prev.suggestion.suggestedActivityDescription,
                                                                        imageUrl: prev.suggestion.suggestedImageUrl,
                                                                        floraRecommended: true
                                                                    };
                                                                }
                                                                return act;
                                                            });
                                                            return { ...d, activities: updatedActivities };
                                                        });
                                                        return { ...prev, days: updatedDays, suggestion: null };
                                                    });
                                                }}
                                                style={{
                                                    backgroundColor: '#00a299',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                Áp dụng gợi ý
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Day Tabs */}
                            <div className={styles.tabs}>
                                {generatedPlan?.days?.map(day => (
                                    <button
                                        key={day.dayNumber}
                                        className={`${styles.tabBtn} ${activeTab === day.dayNumber ? styles.tabActive : ''}`}
                                        onClick={() => setActiveTab(day.dayNumber)}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            {/* Timeline */}
                            {(() => {
                                const currentDay = generatedPlan?.days?.find(d => d.dayNumber === activeTab);
                                return (
                                    <div className={styles.timelineCard}>
                                        <h4 className={styles.timelineTitle}>
                                            {currentDay?.label || `Ngày ${activeTab}`}
                                            <span className={styles.timelineSubtitle}> - {currentDay?.destinationName || selectedDest}</span>
                                        </h4>

                                        <div className={styles.timeline}>
                                            {currentDay?.activities?.map((activity, index) => {
                                                let tagText = 'Tham quan';
                                                let tagClass = styles.tagVisit;
                                                const category = activity.category?.toLowerCase() || '';
                                                if (category === 'arrival' || category === 'rest' || category === 'transport') {
                                                    tagText = 'Di chuyển';
                                                    tagClass = styles.tagTransport;
                                                } else if (category === 'meal' || category === 'restaurant' || category === 'food') {
                                                    tagText = 'Ẩm thực';
                                                    tagClass = styles.tagFood;
                                                }

                                                return (
                                                    <div key={activity.id || index} className={styles.timelineItem}>
                                                        <div className={styles.timeBlock}>{activity.time || '08:00'}</div>
                                                        <div className={styles.timelineContent}>
                                                            <div className={styles.timelineDot}></div>
                                                            <div className={styles.activityCard}>
                                                                {activity.imageUrl && (
                                                                    <img
                                                                        src={resolveMediaUrl(activity.imageUrl)}
                                                                        alt={activity.title}
                                                                        className={styles.activityImage}
                                                                    />
                                                                )}
                                                                <div className={styles.activityInfo}>
                                                                    {activity.floraRecommended && (
                                                                        <span className={styles.floraRecommendBadge}>FLORA ĐỀ XUẤT</span>
                                                                    )}
                                                                    <h5>{activity.title}</h5>
                                                                    <p>{activity.description}</p>
                                                                    <span className={styles.locationTag}>
                                                                        <MapPin size={12} /> {activity.locationName || currentDay?.destinationName || selectedDest}
                                                                    </span>
                                                                    {activity.priceLabel && (
                                                                        <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#00a299', fontWeight: 500 }}>
                                                                            {activity.priceLabel}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className={`${styles.activityTag} ${tagClass}`}>{tagText}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button className={styles.addActivityBtn}>
                                            <Plus size={16} />
                                            Thêm hoạt động mới
                                        </button>
                                    </div>
                                );
                            })()}

                            {/* Bottom Section */}
                            <div className={styles.bottomGrid}>
                                {/* Budget Estimate */}
                                <div className={styles.budgetCard}>
                                    <h4 className={styles.cardTitle}>Dự toán ngân sách</h4>
                                    <div className={styles.budgetList}>
                                        {generatedPlan?.budget?.lines?.map((line, index) => (
                                            <div key={index} className={styles.budgetItem}>
                                                <span>{line.label}</span>
                                                <span>{formatCurrency(line.amountVnd)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.budgetTotal}>
                                        <span>Tổng</span>
                                        <span className={styles.totalAmount}>
                                            {generatedPlan?.budget?.totalVnd ? formatCurrency(generatedPlan.budget.totalVnd) : '0đ'}
                                        </span>
                                    </div>
                                    <p className={styles.budgetNote} style={{ color: generatedPlan?.budget?.withinBudget ? '#00a299' : '#ef4444', fontWeight: 500 }}>
                                        Ngân sách mục tiêu: {formatCurrency(generatedPlan?.budget?.budgetVnd || budget)} - {generatedPlan?.budget?.withinBudget ? 'Trong ngân sách' : 'Vượt ngân sách'}
                                    </p>
                                </div>

                                {/* Map */}
                                {(() => {
                                    const currentDay = generatedPlan?.days?.find(d => d.dayNumber === activeTab);
                                    return (
                                        <div className={styles.mapCard}>
                                            <h4 className={styles.cardTitle}>
                                                Bản đồ - {currentDay?.activities?.length || 0} địa điểm trong Ngày {activeTab}
                                            </h4>
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
                                                    <button className={styles.mapBtn}><Plus size={16} /></button>
                                                    <button className={styles.mapBtn}><Minus size={16} /></button>
                                                </div>
                                                {/* Map Legend mock */}
                                                <div className={styles.mapLegend}>
                                                    <span><span style={{ color: '#ef4444' }}>●</span> Hotel</span>
                                                    <span><span style={{ color: '#f59e0b' }}>●</span> Restaurant</span>
                                                    <span><span style={{ color: '#3b82f6' }}>●</span> Attraction</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Destinations;
