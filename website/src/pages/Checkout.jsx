import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight, User, Mail, Phone, FileText, CreditCard,
    Building2, Wallet, Calendar, Users, MapPin, CheckCircle,
    ArrowRight, ArrowLeft, ShieldCheck, ClipboardList
} from 'lucide-react';
import bangkokImg from '../assets/di-chuyen-di-lai-thai-lan-2.webp';
import styles from './Checkout.module.css';

// Reuse the same tour data
const TOUR_DATA = {
    1: {
        title: 'BANGKOK - PATAYA',
        location: 'Bangkok - Pattaya, Thái Lan',
        price: 8999000,
        discountPercent: 10,
        duration: '5 Ngày / 4 Đêm',
        image: bangkokImg,
    },
    99: {
        title: 'Costa Rica - Trek Rừng Sinh Thái',
        location: 'Arenal đến Monteverde, Costa Rica',
        price: 1299,
        discountPercent: 15,
        duration: '7 Ngày / 6 Đêm',
        image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    },
};

const DEFAULT_TOUR = TOUR_DATA[1];

const PAYMENT_METHODS = [
    {
        id: 'bank',
        name: 'Chuyển khoản ngân hàng',
        desc: 'Chuyển khoản qua tài khoản ngân hàng nội địa',
        icon: Building2,
    },
    {
        id: 'card',
        name: 'Thẻ tín dụng / Ghi nợ',
        desc: 'Visa, Mastercard, JCB',
        icon: CreditCard,
    },
    {
        id: 'ewallet',
        name: 'Ví điện tử',
        desc: 'MoMo, ZaloPay, VNPay',
        icon: Wallet,
    },
];

const Checkout = () => {
    const { tourId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const tour = TOUR_DATA[tourId] || DEFAULT_TOUR;
    const date = searchParams.get('date') || '18/11 – 24/11/2024';
    const travelers = parseInt(searchParams.get('travelers')) || 2;

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        idCard: '',
        gender: 'Nam',
        note: '',
    });

    const totalPrice = tour.price * travelers;
    const discount = totalPrice * (tour.discountPercent / 100);
    const finalPrice = totalPrice - discount;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{9,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.idCard.trim()) {
            newErrors.idCard = 'Vui lòng nhập số căn cước công dân';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleConfirmBooking = () => {
        // Save to localStorage
        const booking = {
            id: Date.now(),
            tourId: tourId || '1',
            tourTitle: tour.title,
            tourLocation: tour.location,
            tourImage: typeof tour.image === 'string' && tour.image.startsWith('http') ? tour.image : '',
            tourDuration: tour.duration,
            date,
            travelers,
            totalPrice: finalPrice,
            paymentMethod,
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            idCard: formData.idCard,
            gender: formData.gender,
            note: formData.note,
            status: 'confirmed',
            bookedAt: new Date().toISOString(),
        };

        const existingBookings = JSON.parse(localStorage.getItem('flourish_bookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('flourish_bookings', JSON.stringify(existingBookings));

        setShowSuccess(true);
    };

    const steps = [
        { num: 1, label: 'Bước 1', name: 'Thông tin cá nhân' },
        { num: 2, label: 'Bước 2', name: 'Thanh toán' },
    ];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb}>
                    <span className={styles.breadcrumbItem}>
                        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
                    </span>
                    <ChevronRight className={styles.breadcrumbSep} />
                    <span className={styles.breadcrumbItem}>
                        <Link to={`/tours/${tourId || 1}`} style={{ color: 'inherit', textDecoration: 'none' }}>{tour.title}</Link>
                    </span>
                    <ChevronRight className={styles.breadcrumbSep} />
                    <span className={styles.breadcrumbActive}>Thanh toán</span>
                </nav>

                {/* Header */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Thanh Toán</h1>
                    <p className={styles.pageSubtitle}>Hoàn tất thông tin để đặt tour của bạn</p>
                </div>

                {/* Stepper */}
                <div className={styles.stepper}>
                    {steps.map((s, idx) => (
                        <React.Fragment key={s.num}>
                            <div className={styles.stepItem} onClick={() => s.num < step && setStep(s.num)}>
                                <div className={`${styles.stepCircle} ${step === s.num ? styles.stepCircleActive : ''} ${step > s.num ? styles.stepCircleDone : ''}`}>
                                    {step > s.num ? <CheckCircle style={{ width: 18, height: 18 }} /> : s.num}
                                </div>
                                <div className={styles.stepInfo}>
                                    <span className={`${styles.stepLabel} ${step >= s.num ? styles.stepLabelActive : ''}`}>{s.label}</span>
                                    <span className={`${styles.stepName} ${step >= s.num ? styles.stepNameActive : ''}`}>{s.name}</span>
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`${styles.stepConnector} ${step > s.num ? styles.stepConnectorDone : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div className={styles.bodyLayout}>
                    {/* Left Column - Form */}
                    <div className={styles.mainCol}>
                        {step === 1 && (
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>
                                    <User className={styles.sectionIcon} />
                                    Thông Tin Liên Hệ
                                </h2>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Họ và tên *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            className={`${styles.formInput} ${errors.fullName ? styles.inputError : ''}`}
                                        />
                                        {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                                        />
                                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="0901 234 567"
                                            className={`${styles.formInput} ${errors.phone ? styles.inputError : ''}`}
                                        />
                                        {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Căn cước công dân *</label>
                                        <input
                                            type="text"
                                            name="idCard"
                                            value={formData.idCard}
                                            onChange={handleChange}
                                            placeholder="Nhập số CCCD"
                                            className={`${styles.formInput} ${errors.idCard ? styles.inputError : ''}`}
                                        />
                                        {errors.idCard && <span className={styles.errorText}>{errors.idCard}</span>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Giới tính (không bắt buộc)</label>
                                        <div className={styles.genderOptions}>
                                            <label className={`${styles.genderOption} ${formData.gender === 'Nam' ? styles.genderOptionActive : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Nam"
                                                    checked={formData.gender === 'Nam'}
                                                    onChange={handleChange}
                                                    className={styles.genderRadio}
                                                />
                                                <div className={styles.radioVisual}>
                                                    <div className={styles.radioDot} />
                                                </div>
                                                <span className={styles.genderLabel}>Nam</span>
                                            </label>
                                            <label className={`${styles.genderOption} ${formData.gender === 'Nữ' ? styles.genderOptionActive : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Nữ"
                                                    checked={formData.gender === 'Nữ'}
                                                    onChange={handleChange}
                                                    className={styles.genderRadio}
                                                />
                                                <div className={styles.radioVisual}>
                                                    <div className={styles.radioDot} />
                                                </div>
                                                <span className={styles.genderLabel}>Nữ</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                        <label className={styles.formLabel}>Ghi chú (tuỳ chọn)</label>
                                        <textarea
                                            name="note"
                                            value={formData.note}
                                            onChange={handleChange}
                                            placeholder="Yêu cầu đặc biệt, dị ứng thực phẩm,..."
                                            className={styles.formTextarea}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className={styles.ctaRow}>
                                    <button className={styles.btnBack} onClick={() => navigate(`/tours/${tourId || 1}`)}>
                                        <ArrowLeft style={{ width: 16, height: 16, marginRight: 4, display: 'inline' }} />
                                        Quay lại
                                    </button>
                                    <button className={styles.btnNext} onClick={handleNextStep}>
                                        Tiếp tục
                                        <ArrowRight className={styles.btnNextIcon} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <>
                                {/* Customer info summary */}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <ClipboardList className={styles.sectionIcon} />
                                        Thông Tin Đặt Tour
                                    </h2>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <span className={styles.formLabel}>Họ và tên</span>
                                            <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                {formData.fullName}
                                            </span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <span className={styles.formLabel}>Email</span>
                                            <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                {formData.email}
                                            </span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <span className={styles.formLabel}>Số điện thoại</span>
                                            <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                {formData.phone}
                                            </span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <span className={styles.formLabel}>Căn cước công dân</span>
                                            <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                {formData.idCard}
                                            </span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <span className={styles.formLabel}>Giới tính</span>
                                            <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                {formData.gender}
                                            </span>
                                        </div>
                                        {formData.note && (
                                            <div className={styles.formGroup}>
                                                <span className={styles.formLabel}>Ghi chú</span>
                                                <span className={styles.formInput} style={{ background: '#f9fafb', cursor: 'default' }}>
                                                    {formData.note}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Payment method */}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <CreditCard className={styles.sectionIcon} />
                                        Phương Thức Thanh Toán
                                    </h2>
                                    <div className={styles.paymentMethods}>
                                        {PAYMENT_METHODS.map(method => {
                                            const Icon = method.icon;
                                            const isActive = paymentMethod === method.id;
                                            return (
                                                <div
                                                    key={method.id}
                                                    className={`${styles.paymentOption} ${isActive ? styles.paymentOptionActive : ''}`}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                >
                                                    <div className={`${styles.paymentRadio} ${isActive ? styles.paymentRadioActive : ''}`}>
                                                        <div className={`${styles.paymentRadioDot} ${isActive ? styles.paymentRadioDotActive : ''}`} />
                                                    </div>
                                                    <div className={`${styles.paymentIcon} ${isActive ? styles.paymentIconActive : ''}`}>
                                                        <Icon className={styles.paymentIconSvg} />
                                                    </div>
                                                    <div className={styles.paymentInfo}>
                                                        <div className={styles.paymentName}>{method.name}</div>
                                                        <div className={styles.paymentDesc}>{method.desc}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className={styles.ctaRow} style={{ marginTop: 24 }}>
                                        <button className={styles.btnBack} onClick={() => setStep(1)}>
                                            <ArrowLeft style={{ width: 16, height: 16, marginRight: 4, display: 'inline' }} />
                                            Quay lại
                                        </button>
                                        <button className={styles.btnNext} onClick={handleConfirmBooking}>
                                            <ShieldCheck style={{ width: 18, height: 18 }} />
                                            Xác Nhận Đặt Tour
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className={styles.sideCol}>
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>
                                <FileText className={styles.summaryTitleIcon} />
                                Tóm Tắt Đơn Hàng
                            </h3>

                            {typeof tour.image === 'object' || (typeof tour.image === 'string' && !tour.image.startsWith('http')) ? (
                                <img src={tour.image} alt={tour.title} className={styles.summaryImage} />
                            ) : (
                                <img src={tour.image} alt={tour.title} className={styles.summaryImage} />
                            )}

                            <div className={styles.summaryTourName}>{tour.title}</div>

                            <div className={styles.summaryDetails}>
                                <div className={styles.summaryRow}>
                                    <MapPin className={styles.summaryRowIcon} />
                                    {tour.location}
                                </div>
                                <div className={styles.summaryRow}>
                                    <Calendar className={styles.summaryRowIcon} />
                                    {date}
                                </div>
                                <div className={styles.summaryRow}>
                                    <Users className={styles.summaryRowIcon} />
                                    {travelers} người lớn
                                </div>
                            </div>

                            <div className={styles.priceBreakdown}>
                                <div className={styles.priceRow}>
                                    <span>{tour.price.toLocaleString('de-DE')} VND × {travelers} người</span>
                                    <span>{totalPrice.toLocaleString('de-DE')} VND</span>
                                </div>
                                {tour.discountPercent > 0 && (
                                    <div className={styles.priceRow}>
                                        <span className={styles.discountBadge}>Giảm {tour.discountPercent}%</span>
                                        <span className={styles.discountBadge}>-{discount.toLocaleString('de-DE')} VND</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.priceRowTotal}>
                                <span className={styles.priceLabel}>Tổng cộng</span>
                                <span className={styles.priceValue}>{finalPrice.toLocaleString('de-DE')} VND</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className={styles.successOverlay}>
                    <div className={styles.successCard}>
                        <div className={styles.successIconCircle}>
                            <CheckCircle className={styles.successIconSvg} />
                        </div>
                        <h2 className={styles.successTitle}>Đặt Tour Thành Công!</h2>
                        <p className={styles.successText}>
                            Cảm ơn bạn đã đặt tour <strong>{tour.title}</strong>.<br />
                            Chúng tôi sẽ gửi xác nhận qua email <strong>{formData.email}</strong>.
                        </p>
                        <button className={styles.successBtn} onClick={() => navigate('/my-journey')}>
                            Xem Chỗ Đã Đặt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
