import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Clock } from 'lucide-react';
import styles from './Checkout.module.css';

const TOUR_INFO = {
    1: { title: 'Bangkok – Pattaya', price: 8999000, image: 'https://images.unsplash.com/photo-1508009603885-027cf6d0bf6b?w=200&q=80' },
    2: { title: 'Siem Reap – Phnom Penh', price: 5490000, image: 'https://images.unsplash.com/photo-1600994945419-7565d75cb942?w=200&q=80' },
    99: { title: 'Costa Rica Trek', price: 12990000, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80' },
};

const COUNTDOWN_SECONDS = 5 * 60;

const Checkout = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState('form');
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    const tour = TOUR_INFO[tourId] || TOUR_INFO[1];
    const travelers = Math.max(1, parseInt(new URLSearchParams(window.location.search).get('travelers'), 10) || 1);
    const total = tour.price * travelers;

    useEffect(() => {
        if (step !== 'momo') return;
        const t = setInterval(() => {
            setCountdown((c) => (c <= 1 ? 0 : c - 1));
        }, 1000);
        return () => clearInterval(t);
    }, [step]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod === 'momo') {
            setStep('momo');
        } else {
            alert('Đã ghi nhận đơn. Phương thức khác sẽ được xử lý sau.');
            navigate('/my-journey');
        }
    };

    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
                    <ArrowLeft className={styles.backIcon} />
                    Quay lại
                </button>

                <h1 className={styles.title}>Thanh toán</h1>

                {step === 'form' && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.summaryCard}>
                            <img src={tour.image} alt="" className={styles.summaryImage} />
                            <div className={styles.summaryInfo}>
                                <h2 className={styles.summaryTitle}>{tour.title}</h2>
                                <p className={styles.summaryMeta}>{travelers} khách</p>
                                <p className={styles.summaryTotal}>Tổng: <strong>{total.toLocaleString('vi-VN')} VND</strong></p>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Họ tên</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nguyễn Văn A" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Số điện thoại</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="0901 234 567" />
                        </div>

                        <div className={styles.paymentSection}>
                            <h3 className={styles.paymentTitle}>Phương thức thanh toán</h3>
                            <div className={styles.paymentOptions}>
                                <button
                                    type="button"
                                    className={paymentMethod === 'momo' ? styles.paymentOptionActive : styles.paymentOption}
                                    onClick={() => setPaymentMethod('momo')}
                                >
                                    <Smartphone className={styles.paymentIcon} />
                                    <span>Ví MoMo</span>
                                </button>
                                <button
                                    type="button"
                                    className={paymentMethod === 'bank' ? styles.paymentOptionActive : styles.paymentOption}
                                    onClick={() => setPaymentMethod('bank')}
                                >
                                    <CreditCard className={styles.paymentIcon} />
                                    <span>Chuyển khoản ngân hàng</span>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={!paymentMethod}>
                            Tiếp tục thanh toán
                        </button>
                    </form>
                )}

                {step === 'momo' && (
                    <div className={styles.momoStep}>
                        <div className={styles.momoCard}>
                            <p className={styles.momoTitle}>Quét mã QR bằng ứng dụng MoMo</p>
                            <div className={styles.qrWrap}>
                                <div className={styles.qrPlaceholder}>
                                    <span>QR Code</span>
                                    <span className={styles.qrAmount}>{total.toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>
                            <div className={styles.countdownWrap}>
                                <Clock className={styles.clockIcon} />
                                <span>Hết hạn sau: <strong className={countdown < 60 ? styles.countdownUrgent : ''}>{timeStr}</strong></span>
                            </div>
                            <p className={styles.momoNote}>Mở app MoMo → Quét mã → Xác nhận thanh toán</p>
                        </div>
                        <Link to="/my-journey" className={styles.doneLink}>Tôi đã thanh toán xong</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
