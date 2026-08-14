import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight, User, Mail, Phone, MapPin, CreditCard,
    Building2, Wallet, Calendar, Users, CheckCircle,
    ArrowRight, ArrowLeft, ShieldCheck, FileText, Minus, Plus, LogIn, Plane, QrCode,
} from 'lucide-react';
import bangkokImg from '../../assets/di-chuyen-di-lai-thai-lan-2.webp';
import styles from './Checkout.module.css';
import { getPublicTour } from '../../api/tours';
import { resolveMediaUrl } from '../../api/config';
import { createBooking, validateBookingPromo } from '../../api/bookings';
import { listActivePromotions } from '../../api/promotions';
import { getAccessToken } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

function isUuid(s) {
    return (
        typeof s === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s)
    );
}

function formatIsoDateViDash(iso) {
    if (!iso) return '';
    const parts = String(iso).split('-');
    if (parts.length < 3) return iso;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
}

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
    { id: 'payos', name: 'PayOS (QR / Ngân hàng)', desc: 'Quét mã QR hoặc chuyển khoản nhanh qua PayOS', icon: QrCode },
    { id: 'ewallet', name: 'Ví MoMo', desc: 'Thanh toán qua ứng dụng MoMo', icon: Wallet },
    { id: 'bank', name: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua tài khoản ngân hàng nội địa', icon: Building2 },
    { id: 'card', name: 'Thẻ tín dụng / Ghi nợ', desc: 'Visa, Mastercard, JCB', icon: CreditCard },
];

const SINGLE_ROOM_PRICE_VI = '4.500.000₫ / phòng';
const SINGLE_ROOM_HINT = `Phòng đơn dành cho khách hàng từ 12 tuổi trở lên, giá phòng đơn là: ${SINGLE_ROOM_PRICE_VI}`;

function formatDdMmYyyyFromDate(d) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}/${month}/${y}`;
}

/** Mốc tuổi: người lớn ≥12, trẻ em 2–11, em bé dưới 2 tuổi (theo ngày hiện tại). */
function getAgeCutoffLabels() {
    const now = new Date();
    const adultLine = new Date(now);
    adultLine.setFullYear(adultLine.getFullYear() - 12);
    const childUpper = new Date(now);
    childUpper.setFullYear(childUpper.getFullYear() - 2);
    return {
        adultBornBefore: formatDdMmYyyyFromDate(adultLine),
        childBornAfter: formatDdMmYyyyFromDate(adultLine),
        childBornBefore: formatDdMmYyyyFromDate(childUpper),
    };
}

function emptyGuestSlot() {
    return {
        fullName: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        gender: 'Nam',
        phone: '',
        idNumber: '',
    };
}

function dmyToIso(day, month, year) {
    const d = parseInt(String(day).trim(), 10);
    const m = parseInt(String(month).trim(), 10);
    const y = parseInt(String(year).trim(), 10);
    if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return '';
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return '';
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function slotDobIso(d) {
    if (!d) return '';
    return dmyToIso(d.dobDay, d.dobMonth, d.dobYear);
}

function phoneOptionalOk(p) {
    const s = normalizePhone(p);
    if (!s) return true;
    return phoneOk(p);
}

/** Gộp state ô ngày sinh với bản ghi cũ chỉ có dateOfBirth (yyyy-mm-dd). */
function slotDisplayData(raw) {
    const base = { ...emptyGuestSlot(), ...raw };
    if ((!base.dobDay && !base.dobMonth && !base.dobYear) && raw?.dateOfBirth) {
        const iso = String(raw.dateOfBirth);
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
        if (m) {
            base.dobYear = m[1];
            base.dobMonth = String(parseInt(m[2], 10));
            base.dobDay = String(parseInt(m[3], 10));
        }
    }
    if (base.gender !== 'Nữ' && base.gender !== 'Nam') base.gender = 'Nam';
    return base;
}

function buildSlotKeys(adults, children, infants) {
    const keys = [];
    for (let i = 0; i < adults; i++) keys.push({ key: `adult-${i}`, kind: 'adult', idx: i });
    for (let i = 0; i < children; i++) keys.push({ key: `child-${i}`, kind: 'child', idx: i });
    for (let i = 0; i < infants; i++) keys.push({ key: `infant-${i}`, kind: 'infant', idx: i });
    return keys;
}

function normalizePhone(p) {
    return String(p || '').replace(/\s/g, '');
}

function phoneOk(p) {
    const s = normalizePhone(p);
    if (!s) return false;
    if (/^\+?[0-9]{9,14}$/.test(s)) return true;
    return /^[0-9]{9,11}$/.test(s);
}

const Checkout = () => {
    const { tourId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const sessionIdParam = searchParams.get('sessionId');
    const isLiveTour = isUuid(tourId);
    const isLiveBooking = isLiveTour && sessionIdParam && isUuid(sessionIdParam);

    const [liveTour, setLiveTour] = useState(null);
    const [liveLoading, setLiveLoading] = useState(isLiveTour);
    const [liveError, setLiveError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('payos');
    const [paymentType, setPaymentType] = useState('full');
    const [errors, setErrors] = useState({});

    const [adults, setAdults] = useState(() => Math.max(1, parseInt(searchParams.get('adults'), 10) || 1));
    const [children, setChildren] = useState(() => Math.max(0, parseInt(searchParams.get('children'), 10) || 0));
    const [infants, setInfants] = useState(() => Math.max(0, parseInt(searchParams.get('infants'), 10) || 0));

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        note: '',
        promoInput: '',
    });
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [promoResult, setPromoResult] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [publicPromos, setPublicPromos] = useState([]);
    const [slotData, setSlotData] = useState({});
    const [singleRoom, setSingleRoom] = useState({});

    const ageCutoffLabels = useMemo(() => getAgeCutoffLabels(), []);

    const tour = useMemo(() => {
        if (isLiveTour && liveTour) {
            const imgs = (liveTour.images || []).map((i) => resolveMediaUrl(i?.imageUrl)).filter(Boolean);
            const loc =
                (liveTour.locations || []).map((l) => l.locationName).filter(Boolean).join(' · ') ||
                liveTour.category?.name ||
                '—';
            return {
                title: liveTour.title,
                location: loc,
                price: liveTour.basePrice != null ? Number(liveTour.basePrice) : 0,
                discountPercent: 0,
                duration:
                    liveTour.durationDays && liveTour.durationNights != null
                        ? `${liveTour.durationDays} Ngày / ${liveTour.durationNights} Đêm`
                        : '—',
                image: imgs[0] || bangkokImg,
                slug: liveTour.slug,
            };
        }
        return TOUR_DATA[tourId] || DEFAULT_TOUR;
    }, [isLiveTour, liveTour, tourId]);

    const bookableSessions = useMemo(() => {
        if (!liveTour?.sessions) return [];
        return liveTour.sessions.filter(
            (s) =>
                s.status === 'scheduled' &&
                (s.maxParticipants ?? 0) > (s.currentParticipants ?? 0),
        );
    }, [liveTour]);

    const sessionOk = useMemo(() => {
        if (!isLiveTour || !liveTour || !sessionIdParam) return false;
        return bookableSessions.some((s) => s.id === sessionIdParam);
    }, [isLiveTour, liveTour, sessionIdParam, bookableSessions]);

    const selectedSession = useMemo(() => {
        if (!liveTour?.sessions || !sessionIdParam) return null;
        return liveTour.sessions.find((s) => s.id === sessionIdParam) || null;
    }, [liveTour, sessionIdParam]);

    const date = useMemo(() => {
        if (selectedSession?.startDate) {
            const end = selectedSession.endDate ? ` → ${formatIsoDateViDash(selectedSession.endDate)}` : '';
            return `${formatIsoDateViDash(selectedSession.startDate)}${end}`;
        }
        return searchParams.get('date') || 'Chưa chọn ngày';
    }, [selectedSession, searchParams]);

    const tourOrderCode = useMemo(() => {
        if (isLiveTour && tour?.slug && sessionIdParam) {
            const p = String(tour.slug).replace(/-/g, '').toUpperCase().slice(0, 10);
            const s = String(sessionIdParam).replace(/-/g, '').toUpperCase().slice(0, 12);
            return `${p}-${s}`;
        }
        return `FT-${String(tourId || 'demo').toUpperCase()}-${String(Date.now()).slice(-6)}`;
    }, [isLiveTour, tour, sessionIdParam, tourId]);

    const useLivePricing = isLiveTour && liveTour && selectedSession && sessionOk;
    const totalPassengers = adults + children + infants;
    const maxParty = useMemo(() => {
        if (!selectedSession) return 20;
        const rem = Math.max(0, (selectedSession.maxParticipants ?? 0) - (selectedSession.currentParticipants ?? 0));
        return Math.max(1, Math.min(20, rem || 20));
    }, [selectedSession]);

    const adultPrice = tour.price;
    const childPrice = useLivePricing ? adultPrice : Math.round(tour.price * 0.7);
    const adultTotal = adults * adultPrice;
    const childTotal = children * childPrice;
    const subtotalBeforePromo = useLivePricing
        ? adultPrice * Math.max(1, totalPassengers)
        : adultTotal + childTotal;
    const mockDiscount = !useLivePricing ? subtotalBeforePromo * ((tour.discountPercent || 0) / 100) : 0;
    const promoDiscount = promoResult?.valid && promoResult.discountAmount != null ? Number(promoResult.discountAmount) : 0;
    const finalPrice = Math.max(0, subtotalBeforePromo - mockDiscount - promoDiscount);
    const amountDue = paymentType === 'deposit' ? Math.round(finalPrice * 0.3) : finalPrice;
    const remainingAmount = paymentType === 'deposit' ? finalPrice - amountDue : 0;

    const slotList = useMemo(() => buildSlotKeys(adults, children, infants), [adults, children, infants]);

    const returnUrl = `/checkout/${tourId}?${searchParams.toString()}`;

    const selectSession = useCallback(
        (sessionId) => {
            const next = new URLSearchParams(searchParams);
            next.set('sessionId', sessionId);
            setSearchParams(next, { replace: true });
            setPromoResult(null);
            setSubmitError('');
        },
        [searchParams, setSearchParams],
    );

    useEffect(() => {
        if (!isLiveTour) {
            setLiveLoading(false);
            return undefined;
        }
        let cancel = false;
        setLiveLoading(true);
        setLiveError('');
        (async () => {
            try {
                const data = await getPublicTour(tourId);
                if (!cancel) setLiveTour(data);
            } catch (e) {
                if (!cancel) setLiveError(e.message || 'Không tải được tour.');
            } finally {
                if (!cancel) setLiveLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [tourId, isLiveTour]);

    useEffect(() => {
        if (!isLiveTour || liveLoading || !liveTour || sessionIdParam) return;
        const first = bookableSessions[0];
        if (!first?.id) return;
        const next = new URLSearchParams(searchParams);
        next.set('sessionId', first.id);
        setSearchParams(next, { replace: true });
    }, [isLiveTour, liveLoading, liveTour, sessionIdParam, bookableSessions, searchParams, setSearchParams]);

    useEffect(() => {
        if (isLiveTour) setPaymentType('full');
    }, [isLiveTour]);

    useEffect(() => {
        if (!user) return;
        setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || user.name || '',
            email: prev.email || user.email || '',
        }));
    }, [user]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const rows = await listActivePromotions();
                if (!alive) return;
                setPublicPromos((rows || []).filter((p) => p.isPublic !== false && !p.gifted && !p.upcoming));
            } catch {
                if (alive) setPublicPromos([]);
            }
        })();
        return () => { alive = false; };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const passengerSummary = useCallback(() => {
        const parts = [];
        if (adults > 0) parts.push(`${adults} người lớn`);
        if (children > 0) parts.push(`${children} trẻ em`);
        if (infants > 0) parts.push(`${infants} em bé`);
        return parts.join(', ') || '1 người lớn';
    }, [adults, children, infants]);

    const patchSlot = useCallback((key, patch) => {
        setSlotData((prev) => ({
            ...prev,
            [key]: { ...emptyGuestSlot(), ...prev[key], ...patch },
        }));
        setErrors((prev) => (prev[`slot_${key}`] ? { ...prev, [`slot_${key}`]: '' } : prev));
    }, []);

    const applyPromo = async (overrideCode) => {
        const code = String(overrideCode || formData.promoInput).trim().toUpperCase();
        if (!code) {
            setPromoResult({ valid: false, message: 'Nhập mã ưu đãi.' });
            return;
        }
        if (!isLiveTour || !sessionOk || !sessionIdParam) {
            setPromoResult({ valid: false, message: 'Chọn đợt khởi hành trước khi áp dụng mã ưu đãi.' });
            return;
        }
        setFormData((prev) => ({ ...prev, promoInput: code }));
        setPromoLoading(true);
        setPromoResult(null);
        try {
            const r = await validateBookingPromo({
                code,
                sessionId: sessionIdParam,
                guestCount: Math.max(1, totalPassengers),
            });
            setPromoResult({
                valid: !!r.valid,
                discountAmount: r.discountAmount,
                message: r.message,
                code: r.valid ? code : null,
            });
        } catch (e) {
            const msg = e.status === 401
                ? 'Vui lòng đăng nhập để áp dụng mã ưu đãi.'
                : (e.message || 'Không kiểm tra được mã.');
            setPromoResult({ valid: false, message: msg });
        } finally {
            setPromoLoading(false);
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
        if (!phoneOk(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!agreeTerms) newErrors.terms = 'Vui lòng đồng ý điều khoản';

        for (const s of slotList) {
            if (s.kind === 'infant') continue;
            const d = slotDisplayData(slotData[s.key]);
            if (!d.fullName.trim()) {
                newErrors[`slot_${s.key}`] = 'Nhập họ tên hành khách';
            } else if (!slotDobIso(d)) {
                newErrors[`slot_${s.key}`] = 'Nhập ngày sinh hợp lệ (dd/mm/yyyy)';
            } else if (s.kind === 'adult' && !d.idNumber?.trim()) {
                newErrors[`slot_${s.key}`] = 'Nhập số CCCD/CMND';
            } else if (!phoneOptionalOk(d.phone)) {
                newErrors[`slot_${s.key}`] = 'Số điện thoại hành khách không hợp lệ';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const step1Complete = useMemo(() => {
        if (!formData.fullName.trim() || !formData.email.trim() || !phoneOk(formData.phone) || !agreeTerms) return false;
        for (const s of slotList) {
            if (s.kind === 'infant') continue;
            const d = slotDisplayData(slotData[s.key]);
            const idOk = s.kind !== 'adult' || !!d.idNumber?.trim();
            if (!d.fullName.trim() || !slotDobIso(d) || !idOk || !phoneOptionalOk(d.phone)) return false;
        }
        return true;
    }, [formData, agreeTerms, slotList, slotData]);

    const goStep2 = () => {
        if (validateStep1()) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const buildSpecialRequests = () => {
        const parts = [];
        if (formData.note.trim()) parts.push(formData.note.trim());
        const sr = [];
        for (let i = 0; i < adults; i++) {
            if (singleRoom[`adult-${i}`]) sr.push(`Người lớn #${i + 1}`);
        }
        if (sr.length) parts.push(`Yêu cầu phòng đơn: ${sr.join(', ')}. ${SINGLE_ROOM_HINT}`);
        const metaLines = [];
        for (const s of slotList) {
            if (s.kind === 'infant') continue;
            const d = slotDisplayData(slotData[s.key]);
            if (!d.fullName?.trim()) continue;
            const bits = [];
            if (d.gender) bits.push(`Giới tính: ${d.gender}`);
            const gp = normalizePhone(d.phone);
            if (gp) bits.push(`SĐT: ${gp}`);
            if (bits.length) metaLines.push(`${d.fullName.trim()} — ${bits.join(', ')}`);
        }
        if (metaLines.length) {
            parts.push(['Thông tin bổ sung hành khách (theo form đặt chỗ):', ...metaLines].join('\n'));
        }
        return parts.length ? parts.join('\n\n') : undefined;
    };

    const buildGuestsPayload = () => {
        const guests = [];
        for (const s of slotList) {
            if (s.kind === 'infant') {
                const d = slotDisplayData(slotData[s.key]);
                if (d?.fullName?.trim()) {
                    const dob = slotDobIso(d);
                    guests.push({
                        fullName: d.fullName.trim(),
                        idNumber: d.idNumber?.trim() || undefined,
                        dateOfBirth: dob || undefined,
                    });
                }
                continue;
            }
            const d = slotDisplayData(slotData[s.key]);
            if (!d?.fullName?.trim()) continue;
            const dob = slotDobIso(d);
            guests.push({
                fullName: d.fullName.trim(),
                idNumber: d.idNumber?.trim() || undefined,
                dateOfBirth: dob || undefined,
            });
        }
        return guests.length ? guests : undefined;
    };

    const handleConfirmBooking = async () => {
        setSubmitError('');
        if (isLiveTour) {
            if (!sessionOk || !liveTour || !sessionIdParam) {
                setSubmitError('Vui lòng chọn đợt khởi hành còn chỗ.');
                return;
            }
            const token = getAccessToken();
            if (!token) {
                navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
                return;
            }
            setSubmitting(true);
            try {
                const guestCount = Math.max(1, totalPassengers);
                const result = await createBooking({
                    sessionId: sessionIdParam,
                    guestCount,
                    specialRequests: buildSpecialRequests(),
                    contactPhone: normalizePhone(formData.phone),
                    pickupAddress: formData.address.trim() || undefined,
                    promotionCode: promoResult?.valid && promoResult.code ? promoResult.code : undefined,
                    guests: buildGuestsPayload(),
                    paymentMethod,
                });
                if (result?.paymentUrl) {
                    window.location.assign(result.paymentUrl);
                    return;
                }
                setStep(3);
            } catch (e) {
                setSubmitError(e.message || 'Không tạo được đơn.');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        const booking = {
            id: Date.now(),
            tourId: tourId || '1',
            tourTitle: tour.title,
            tourLocation: tour.location,
            tourImage: typeof tour.image === 'string' && tour.image.startsWith('http') ? tour.image : '',
            tourDuration: tour.duration,
            date,
            adults,
            children,
            infants,
            totalPassengers,
            totalPrice: finalPrice,
            amountDue,
            remainingAmount,
            paymentType,
            paymentMethod,
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            address: formData.address,
            note: formData.note,
            status: paymentType === 'deposit' ? 'deposit_paid' : 'confirmed',
            bookedAt: new Date().toISOString(),
        };
        const existingBookings = JSON.parse(localStorage.getItem('flourish_bookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('flourish_bookings', JSON.stringify(existingBookings));
        setStep(3);
    };

    if (isLiveTour && liveLoading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    Đang tải thông tin tour...
                </div>
            </div>
        );
    }

    if (isLiveTour && liveError) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container} style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <p style={{ marginBottom: 16, color: '#b91c1c' }}>{liveError}</p>
                    <Link to={`/tours/${tourId}`}>← Quay lại chi tiết tour</Link>
                </div>
            </div>
        );
    }

    const renderSessionPicker = (compact = false) => {
        if (!isLiveTour) return null;
        if (bookableSessions.length === 0) {
            return (
                <p className={styles.sessionEmpty}>
                    Hiện chưa có đợt khởi hành còn chỗ.{' '}
                    <Link to={`/tours/${tourId}`}>Quay lại trang tour</Link>
                </p>
            );
        }
        return (
            <div className={compact ? styles.sessionListCompact : styles.sessionList}>
                {bookableSessions.map((s, idx) => {
                    const rem = Math.max(0, (s.maxParticipants ?? 0) - (s.currentParticipants ?? 0));
                    const active = sessionIdParam === s.id;
                    const dateLabel = `Đợt ${idx + 1} · ${formatIsoDateViDash(s.startDate)}${
                        s.endDate ? ` → ${formatIsoDateViDash(s.endDate)}` : ''
                    }`;
                    return (
                        <button
                            key={s.id}
                            type="button"
                            className={`${styles.sessionOption} ${active ? styles.sessionOptionActive : ''}`}
                            onClick={() => selectSession(s.id)}
                        >
                            <Calendar className={styles.sessionOptionIcon} />
                            <span className={styles.sessionOptionText}>
                                <strong>{dateLabel}</strong>
                                <span>Còn {rem} chỗ</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const stepsMeta = [
        { num: 1, short: '1', name: 'Nhập thông tin' },
        { num: 2, short: '2', name: 'Thanh toán' },
        { num: 3, short: '3', name: 'Hoàn tất' },
    ];

    const renderStepper = (compact = false) => (
        <div className={compact ? styles.checkoutStepperCompact : styles.stepper}>
            {stepsMeta.map((s, idx) => (
                <React.Fragment key={s.num}>
                    <div
                        className={compact ? styles.stepItemCompact : styles.stepItem}
                        onClick={() => {
                            if (s.num < step) setStep(s.num);
                        }}
                        style={{ cursor: s.num < step ? 'pointer' : 'default' }}
                    >
                        <div
                            className={
                                compact
                                    ? `${styles.stepCircleSm} ${step === s.num ? styles.stepCircleSmActive : ''} ${step > s.num ? styles.stepCircleSmDone : ''}`
                                    : `${styles.stepCircle} ${step === s.num ? styles.stepCircleActive : ''} ${step > s.num ? styles.stepCircleDone : ''}`
                            }
                        >
                            {step > s.num ? <CheckCircle style={{ width: compact ? 14 : 18, height: compact ? 14 : 18 }} /> : s.short}
                        </div>
                        <div className={compact ? styles.stepTextSm : styles.stepInfo}>
                            {compact ? (
                                <>
                                    <span className={styles.stepNumSm}>Bước {s.num}</span>
                                    <span className={styles.stepNameSm}>{s.name}</span>
                                </>
                            ) : (
                                <>
                                    <span className={`${styles.stepLabel} ${step >= s.num ? styles.stepLabelActive : ''}`}>Bước {s.num}</span>
                                    <span className={`${styles.stepName} ${step >= s.num ? styles.stepNameActive : ''}`}>{s.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {idx < stepsMeta.length - 1 && (
                        <div
                            className={
                                compact
                                    ? `${styles.stepConnectorSm} ${step > s.num ? styles.stepConnectorSmDone : ''}`
                                    : `${styles.stepConnector} ${step > s.num ? styles.stepConnectorDone : ''}`
                            }
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    if (step === 3) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.container}>
                    <nav className={styles.breadcrumb}>
                        <span className={styles.breadcrumbItem}>
                            <Link to="/">Trang chủ</Link>
                        </span>
                        <ChevronRight className={styles.breadcrumbSep} />
                        <span className={styles.breadcrumbActive}>Hoàn tất</span>
                    </nav>
                    <div className={styles.checkoutTopBar}>
                        <div className={styles.checkoutTopLeft} />
                        {renderStepper(true)}
                    </div>
                    <div className={styles.formSection}>
                        <div className={styles.successPage}>
                            <CheckCircle className={styles.successPageIcon} />
                            <h1 className={styles.checkoutMainTitle}>Đặt tour thành công</h1>
                            <p className={styles.checkoutMainSubtitle}>
                                Cảm ơn bạn đã chọn FlourishTravel. Thông tin xác nhận sẽ được gửi tới{' '}
                                <strong>{formData.email}</strong> (nếu đặt qua hệ thống thanh toán, vui lòng hoàn tất giao dịch trên cổng thanh toán).
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                                <button type="button" className={styles.btnNext} onClick={() => navigate('/my-journey')}>
                                    Xem chuyến đi của tôi
                                </button>
                                <button type="button" className={styles.btnBack} onClick={() => navigate('/')}>
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <nav className={styles.breadcrumb}>
                    <span className={styles.breadcrumbItem}>
                        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Trang chủ
                        </Link>
                    </span>
                    <ChevronRight className={styles.breadcrumbSep} />
                    <span className={styles.breadcrumbItem}>
                        <Link to={`/tours/${tourId || 1}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {tour.title}
                        </Link>
                    </span>
                    <ChevronRight className={styles.breadcrumbSep} />
                    <span className={styles.breadcrumbActive}>Đặt tour</span>
                </nav>

                <div className={styles.checkoutTopBar}>
                    <div className={styles.checkoutTopLeft}>
                        <h1 className={styles.checkoutMainTitle}>Đặt tour của bạn</h1>
                        <p className={styles.checkoutMainSubtitle}>
                            Hãy đảm bảo tất cả thông tin chi tiết trên trang này đã chính xác trước khi tiến hành thanh toán.
                        </p>
                    </div>
                    {renderStepper(true)}
                </div>

                <div className={styles.bodyLayout}>
                    <div className={styles.mainCol}>
                        {step === 1 && (
                            <>
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <User className={styles.sectionIcon} />
                                        Thông tin liên lạc
                                    </h2>
                                    <div className={styles.loginBanner}>
                                        <LogIn style={{ width: 18, height: 18, flexShrink: 0 }} />
                                        <span>
                                            Đăng nhập để nhận ưu đãi, tích điểm và quản lý đơn hàng dễ dàng hơn!{' '}
                                            <Link to={`/login?return=${encodeURIComponent(returnUrl)}`}>Đăng nhập</Link>
                                        </span>
                                    </div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Họ tên (*)</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: Nguyễn Văn A"
                                                className={`${styles.formInput} ${errors.fullName ? styles.inputError : ''}`}
                                            />
                                            {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Số điện thoại (*)</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: 0901234567 / +84901234567"
                                                className={`${styles.formInput} ${errors.phone ? styles.inputError : ''}`}
                                            />
                                            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Email (*)</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: email@example.com"
                                                className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                                            />
                                            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Địa chỉ</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Ví dụ: 190 Pasteur, Phường Xuân Hoà, TP.HCM"
                                                className={styles.formInput}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isLiveTour ? (
                                    <div className={styles.formSection}>
                                        <h2 className={styles.sectionTitle}>
                                            <Calendar className={styles.sectionIcon} />
                                            Chọn đợt khởi hành
                                        </h2>
                                        <p className={styles.sessionPickerHint}>
                                            Chọn ngày đi còn chỗ cho tour này. Giá và số chỗ cập nhật theo từng đợt.
                                        </p>
                                        {renderSessionPicker()}
                                        {sessionIdParam && !sessionOk ? (
                                            <p className={styles.sessionWarn}>
                                                Đợt đã chọn không còn chỗ hoặc đã đóng — vui lòng chọn đợt khác.
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <Users className={styles.sectionIcon} />
                                        Hành khách
                                    </h2>
                                    <div className={styles.counterGrid}>
                                        <div className={styles.counterCard}>
                                            <div className={styles.counterLabel}>Người lớn</div>
                                            <div className={styles.counterHint}>Từ 12 tuổi trở lên</div>
                                            <div className={styles.counterRow}>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                                                    disabled={adults <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className={styles.counterVal}>{adults}</span>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() =>
                                                        setAdults((a) => Math.min(maxParty - children - infants, a + 1))
                                                    }
                                                    disabled={adults + children + infants >= maxParty}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.counterCard}>
                                            <div className={styles.counterLabel}>Trẻ em</div>
                                            <div className={styles.counterHint}>Từ 2 - 11 tuổi</div>
                                            <div className={styles.counterRow}>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                                                    disabled={children <= 0}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className={styles.counterVal}>{children}</span>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() =>
                                                        setChildren((c) => Math.min(maxParty - adults - infants, c + 1))
                                                    }
                                                    disabled={adults + children + infants >= maxParty}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.counterCard}>
                                            <div className={styles.counterLabel}>Em bé</div>
                                            <div className={styles.counterHint}>Dưới 2 tuổi</div>
                                            <div className={styles.counterRow}>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() => setInfants((n) => Math.max(0, n - 1))}
                                                    disabled={infants <= 0}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className={styles.counterVal}>{infants}</span>
                                                <button
                                                    type="button"
                                                    className={styles.counterBtnSm}
                                                    onClick={() =>
                                                        setInfants((n) => Math.min(maxParty - adults - children, n + 1))
                                                    }
                                                    disabled={adults + children + infants >= maxParty}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {isLiveTour && sessionOk ? (
                                        <p style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                                            Tối đa {maxParty} khách cho đợt đã chọn (theo chỗ còn lại).
                                        </p>
                                    ) : null}
                                </div>

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <FileText className={styles.sectionIcon} />
                                        Thông tin hành khách
                                    </h2>
                                    {adults > 0 && (
                                        <>
                                            <div className={styles.passengerHintBox}>{SINGLE_ROOM_HINT}</div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 10px' }}>
                                                Người lớn{' '}
                                                <span style={{ fontWeight: 400, color: '#6b7280' }}>
                                                    (sinh trước ngày {ageCutoffLabels.adultBornBefore})
                                                </span>
                                            </p>
                                            {slotList
                                                .filter((s) => s.kind === 'adult')
                                                .map((s) => {
                                                    const d = slotDisplayData(slotData[s.key]);
                                                    return (
                                                        <div key={s.key} className={styles.guestInlineCard}>
                                                            <div className={styles.guestInlineHeader}>
                                                                <div className={styles.guestInlineBadge}>#{s.idx + 1}</div>
                                                                <div className={styles.guestInlineSubtitle}>Người lớn</div>
                                                            </div>
                                                            <div className={styles.guestFieldGrid}>
                                                                <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                                    <label className={styles.formLabel}>Họ tên (*)</label>
                                                                    <input
                                                                        className={`${styles.formInput} ${errors[`slot_${s.key}`] ? styles.inputError : ''}`}
                                                                        value={d.fullName}
                                                                        onChange={(e) => patchSlot(s.key, { fullName: e.target.value })}
                                                                        placeholder="Ví dụ: Nguyễn Văn A"
                                                                    />
                                                                </div>
                                                                <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                                    <label className={styles.formLabel}>Ngày sinh (*)</label>
                                                                    <div className={styles.dobRow}>
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={2}
                                                                            placeholder="dd"
                                                                            value={d.dobDay}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobDay: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                                })
                                                                            }
                                                                        />
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={2}
                                                                            placeholder="mm"
                                                                            value={d.dobMonth}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobMonth: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                                })
                                                                            }
                                                                        />
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={4}
                                                                            placeholder="yyyy"
                                                                            value={d.dobYear}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobYear: e.target.value.replace(/\D/g, '').slice(0, 4),
                                                                                })
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className={styles.dobLabels}>
                                                                        <span className={styles.dobHint}>dd</span>
                                                                        <span className={styles.dobHint}>mm</span>
                                                                        <span className={styles.dobHint}>yyyy</span>
                                                                    </div>
                                                                </div>
                                                                <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                                    <span className={styles.formLabel}>Giới tính (*)</span>
                                                                    <div className={styles.genderRow}>
                                                                        <label className={styles.genderOpt}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`gender-${s.key}`}
                                                                                checked={d.gender === 'Nam'}
                                                                                onChange={() => patchSlot(s.key, { gender: 'Nam' })}
                                                                            />
                                                                            Nam
                                                                        </label>
                                                                        <label className={styles.genderOpt}>
                                                                            <input
                                                                                type="radio"
                                                                                name={`gender-${s.key}`}
                                                                                checked={d.gender === 'Nữ'}
                                                                                onChange={() => patchSlot(s.key, { gender: 'Nữ' })}
                                                                            />
                                                                            Nữ
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <label className={styles.formLabel}>Số điện thoại</label>
                                                                    <input
                                                                        type="tel"
                                                                        className={styles.formInput}
                                                                        value={d.phone}
                                                                        onChange={(e) => patchSlot(s.key, { phone: e.target.value })}
                                                                        placeholder="Ví dụ: 0901234567 / +84901234567"
                                                                    />
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <label className={styles.formLabel}>CCCD / CMND (*)</label>
                                                                    <input
                                                                        className={styles.formInput}
                                                                        value={d.idNumber}
                                                                        onChange={(e) => patchSlot(s.key, { idNumber: e.target.value })}
                                                                        placeholder="Số giấy tờ"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className={styles.singleRoomRow}>
                                                                <span>Phòng đơn</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!singleRoom[s.key]}
                                                                    onChange={(e) =>
                                                                        setSingleRoom((prev) => ({ ...prev, [s.key]: e.target.checked }))
                                                                    }
                                                                />
                                                            </div>
                                                            {errors[`slot_${s.key}`] ? (
                                                                <div className={styles.errorText}>{errors[`slot_${s.key}`]}</div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                        </>
                                    )}

                                    {children > 0 ? (
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '18px 0 10px' }}>
                                            Trẻ em{' '}
                                            <span style={{ fontWeight: 400, color: '#6b7280' }}>
                                                (2–11 tuổi: sinh sau ngày {ageCutoffLabels.childBornAfter} và đến ngày{' '}
                                                {ageCutoffLabels.childBornBefore})
                                            </span>
                                        </p>
                                    ) : null}
                                    {slotList
                                        .filter((s) => s.kind === 'child')
                                        .map((s) => {
                                            const d = slotDisplayData(slotData[s.key]);
                                            return (
                                                <div key={s.key} className={styles.guestInlineCard}>
                                                    <div className={styles.guestInlineHeader}>
                                                        <div className={styles.guestInlineBadge}>#{s.idx + 1}</div>
                                                        <div className={styles.guestInlineSubtitle}>Trẻ em</div>
                                                    </div>
                                                    <div className={styles.guestFieldGrid}>
                                                        <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                            <label className={styles.formLabel}>Họ tên (*)</label>
                                                            <input
                                                                className={`${styles.formInput} ${errors[`slot_${s.key}`] ? styles.inputError : ''}`}
                                                                value={d.fullName}
                                                                onChange={(e) => patchSlot(s.key, { fullName: e.target.value })}
                                                                placeholder="Ví dụ: Nguyễn Văn A"
                                                            />
                                                        </div>
                                                        <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                            <label className={styles.formLabel}>Ngày sinh (*)</label>
                                                            <div className={styles.dobRow}>
                                                                <input
                                                                    className={styles.formInput}
                                                                    inputMode="numeric"
                                                                    maxLength={2}
                                                                    placeholder="dd"
                                                                    value={d.dobDay}
                                                                    onChange={(e) =>
                                                                        patchSlot(s.key, {
                                                                            dobDay: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                        })
                                                                    }
                                                                />
                                                                <input
                                                                    className={styles.formInput}
                                                                    inputMode="numeric"
                                                                    maxLength={2}
                                                                    placeholder="mm"
                                                                    value={d.dobMonth}
                                                                    onChange={(e) =>
                                                                        patchSlot(s.key, {
                                                                            dobMonth: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                        })
                                                                    }
                                                                />
                                                                <input
                                                                    className={styles.formInput}
                                                                    inputMode="numeric"
                                                                    maxLength={4}
                                                                    placeholder="yyyy"
                                                                    value={d.dobYear}
                                                                    onChange={(e) =>
                                                                        patchSlot(s.key, {
                                                                            dobYear: e.target.value.replace(/\D/g, '').slice(0, 4),
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                            <div className={styles.dobLabels}>
                                                                <span className={styles.dobHint}>dd</span>
                                                                <span className={styles.dobHint}>mm</span>
                                                                <span className={styles.dobHint}>yyyy</span>
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                            <span className={styles.formLabel}>Giới tính (*)</span>
                                                            <div className={styles.genderRow}>
                                                                <label className={styles.genderOpt}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`gender-${s.key}`}
                                                                        checked={d.gender === 'Nam'}
                                                                        onChange={() => patchSlot(s.key, { gender: 'Nam' })}
                                                                    />
                                                                    Nam
                                                                </label>
                                                                <label className={styles.genderOpt}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`gender-${s.key}`}
                                                                        checked={d.gender === 'Nữ'}
                                                                        onChange={() => patchSlot(s.key, { gender: 'Nữ' })}
                                                                    />
                                                                    Nữ
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.formLabel}>Số điện thoại</label>
                                                            <input
                                                                type="tel"
                                                                className={styles.formInput}
                                                                value={d.phone}
                                                                onChange={(e) => patchSlot(s.key, { phone: e.target.value })}
                                                                placeholder="Ví dụ: 0901234567 / +84901234567"
                                                            />
                                                        </div>
                                                    </div>
                                                    {errors[`slot_${s.key}`] ? (
                                                        <div className={styles.errorText}>{errors[`slot_${s.key}`]}</div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}

                                    {infants > 0 ? (
                                        <>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '18px 0 10px' }}>
                                                Em bé <span style={{ fontWeight: 400, color: '#6b7280' }}>(Dưới 2 tuổi — tuỳ chọn)</span>
                                            </p>
                                            {slotList
                                                .filter((s) => s.kind === 'infant')
                                                .map((s) => {
                                                    const d = slotDisplayData(slotData[s.key]);
                                                    return (
                                                        <div key={s.key} className={styles.guestInlineCard}>
                                                            <div className={styles.guestInlineHeader}>
                                                                <div className={styles.guestInlineBadge}>#{s.idx + 1}</div>
                                                                <div className={styles.guestInlineSubtitle}>Em bé</div>
                                                            </div>
                                                            <div className={styles.guestFieldGrid}>
                                                                <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                                    <label className={styles.formLabel}>Họ tên</label>
                                                                    <input
                                                                        className={styles.formInput}
                                                                        value={d.fullName}
                                                                        onChange={(e) => patchSlot(s.key, { fullName: e.target.value })}
                                                                        placeholder="Tuỳ chọn"
                                                                    />
                                                                </div>
                                                                <div className={`${styles.formGroup} ${styles.guestFieldFull}`}>
                                                                    <label className={styles.formLabel}>Ngày sinh (tuỳ chọn)</label>
                                                                    <div className={styles.dobRow}>
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={2}
                                                                            placeholder="dd"
                                                                            value={d.dobDay}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobDay: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                                })
                                                                            }
                                                                        />
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={2}
                                                                            placeholder="mm"
                                                                            value={d.dobMonth}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobMonth: e.target.value.replace(/\D/g, '').slice(0, 2),
                                                                                })
                                                                            }
                                                                        />
                                                                        <input
                                                                            className={styles.formInput}
                                                                            inputMode="numeric"
                                                                            maxLength={4}
                                                                            placeholder="yyyy"
                                                                            value={d.dobYear}
                                                                            onChange={(e) =>
                                                                                patchSlot(s.key, {
                                                                                    dobYear: e.target.value.replace(/\D/g, '').slice(0, 4),
                                                                                })
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className={styles.dobLabels}>
                                                                        <span className={styles.dobHint}>dd</span>
                                                                        <span className={styles.dobHint}>mm</span>
                                                                        <span className={styles.dobHint}>yyyy</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </>
                                    ) : null}
                                </div>

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <BadgePercentIcon />
                                        Mã ưu đãi
                                    </h2>
                                    <div className={styles.promoRow}>
                                        <input
                                            type="text"
                                            name="promoInput"
                                            value={formData.promoInput}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: CHAT5, WELCOME50"
                                            className={styles.formInput}
                                            autoComplete="off"
                                        />
                                        <button type="button" className={styles.btnApply} onClick={() => applyPromo()} disabled={promoLoading || !sessionOk}>
                                            {promoLoading ? '...' : 'Áp dụng'}
                                        </button>
                                    </div>
                                    {publicPromos.length > 0 ? (
                                        <div className={styles.promoChips}>
                                            {publicPromos.map((p) => (
                                                <button
                                                    key={p.id || p.code}
                                                    type="button"
                                                    className={styles.promoChip}
                                                    onClick={() => applyPromo(p.code)}
                                                    disabled={promoLoading || !sessionOk}
                                                >
                                                    {p.code}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                    {isLiveTour && !sessionOk ? (
                                        <p className={styles.promoMsg} style={{ color: '#b45309' }}>
                                            Chọn đợt khởi hành trước khi áp dụng mã giảm giá.
                                        </p>
                                    ) : null}
                                    {promoResult?.message ? (
                                        <p className={styles.promoMsg} style={{ color: promoResult.valid ? '#047857' : '#b91c1c' }}>
                                            {promoResult.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <FileText className={styles.sectionIcon} />
                                        Ghi chú
                                    </h2>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        placeholder="Vui lòng cho chúng tôi biết nếu Quý khách có ghi chú hoặc yêu cầu đặc biệt. Ví dụ: Bữa ăn chay, đến muộn, ..."
                                        className={styles.formTextarea}
                                        rows={4}
                                    />
                                </div>

                                <div className={styles.ctaRow}>
                                    <button type="button" className={styles.btnBack} onClick={() => navigate(`/tours/${tourId || 1}`)}>
                                        <ArrowLeft style={{ width: 16, height: 16 }} />
                                        Quay lại
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                {submitError ? (
                                    <div
                                        className={styles.formSection}
                                        style={{
                                            padding: '14px 16px',
                                            background: '#fef2f2',
                                            color: '#b91c1c',
                                            borderRadius: 12,
                                            fontSize: 14,
                                        }}
                                    >
                                        {submitError}
                                    </div>
                                ) : null}
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <ClipboardListIcon />
                                        Xác nhận thông tin
                                    </h2>
                                    <p style={{ fontSize: 14, color: '#4b5563', marginTop: 0 }}>
                                        {formData.fullName} · {formData.phone} · {formData.email}
                                    </p>
                                    <p style={{ fontSize: 14, color: '#4b5563' }}>{passengerSummary()}</p>
                                </div>

                                {!useLivePricing ? (
                                    <div className={styles.formSection}>
                                        <h2 className={styles.sectionTitle}>Loại thanh toán</h2>
                                        <div className={styles.paymentTypeGrid}>
                                            <div
                                                className={`${styles.paymentTypeCard} ${paymentType === 'deposit' ? styles.paymentTypeCardActive : ''}`}
                                                onClick={() => setPaymentType('deposit')}
                                            >
                                                <div className={styles.paymentTypeName}>Đặt cọc 30%</div>
                                                <div className={styles.paymentTypeAmount}>{Math.round(finalPrice * 0.3).toLocaleString('de-DE')} VND</div>
                                            </div>
                                            <div
                                                className={`${styles.paymentTypeCard} ${paymentType === 'full' ? styles.paymentTypeCardActive : ''}`}
                                                onClick={() => setPaymentType('full')}
                                            >
                                                <div className={styles.paymentTypeName}>Thanh toán toàn bộ</div>
                                                <div className={styles.paymentTypeAmount}>{finalPrice.toLocaleString('de-DE')} VND</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>
                                        <CreditCard className={styles.sectionIcon} />
                                        Phương thức thanh toán
                                    </h2>
                                    <div className={styles.paymentMethods}>
                                        {PAYMENT_METHODS.map((method) => {
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
                                    <div className={styles.ctaRow} style={{ marginTop: 20 }}>
                                        <button type="button" className={styles.btnBack} onClick={() => setStep(1)}>
                                            <ArrowLeft style={{ width: 16, height: 16 }} />
                                            Quay lại
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.btnNext}
                                            onClick={handleConfirmBooking}
                                            disabled={submitting}
                                        >
                                            <ShieldCheck style={{ width: 18, height: 18 }} />
                                            {submitting
                                                ? 'Đang xử lý...'
                                                : useLivePricing || paymentType === 'full'
                                                  ? `Xác nhận & thanh toán ${finalPrice.toLocaleString('de-DE')} VND`
                                                  : `Xác nhận cọc ${amountDue.toLocaleString('de-DE')} VND`}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.sideCol}>
                        <div className={styles.summaryCard}>
                            <h3 className={styles.summaryTitle}>
                                <FileText className={styles.summaryTitleIcon} />
                                Tóm tắt đơn hàng
                            </h3>
                            <img src={tour.image} alt="" className={styles.summaryImage} />
                            <div className={styles.summaryTourName}>{tour.title}</div>
                            <div className={styles.tourCodeLine}>{tourOrderCode}</div>

                            <div className={styles.scheduleBlock}>
                                <div className={styles.scheduleBlockTitle}>
                                    <Plane style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                                    Lịch khởi hành / di chuyển
                                </div>
                                {isLiveTour ? (
                                    <>
                                        <p className={styles.sessionPickerHint}>Chọn đợt còn chỗ:</p>
                                        {renderSessionPicker(true)}
                                    </>
                                ) : null}
                                <div className={styles.scheduleLeg}>
                                    <span className={styles.scheduleLegLabel}>Ngày đi</span>
                                    <div className={styles.scheduleLegBody}>
                                        {selectedSession?.startDate ? formatIsoDateViDash(selectedSession.startDate) : date}
                                        <br />
                                        <span style={{ color: '#9ca3af', fontSize: 11 }}>
                                            Giá tour áp dụng theo hệ thống; vé máy bay (nếu có) theo xác nhận riêng từ điều hành.
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.scheduleLeg}>
                                    <span className={styles.scheduleLegLabel}>Ngày về</span>
                                    <div className={styles.scheduleLegBody}>
                                        {selectedSession?.endDate ? formatIsoDateViDash(selectedSession.endDate) : '—'}
                                    </div>
                                </div>
                            </div>

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
                                    {passengerSummary()}
                                </div>
                            </div>

                            <details className={styles.accordion} defaultOpen>
                                <summary className={styles.accordionSummary}>Chi tiết chi phí</summary>
                                <div className={styles.accordionBody}>
                                    {useLivePricing ? (
                                        <>
                                            <div className={styles.priceRow}>
                                                <span>
                                                    {adultPrice.toLocaleString('de-DE')} VND × {Math.max(1, totalPassengers)} khách
                                                </span>
                                                <span>{subtotalBeforePromo.toLocaleString('de-DE')} VND</span>
                                            </div>
                                            {promoDiscount > 0 ? (
                                                <div className={styles.priceRow}>
                                                    <span>Giảm (mã ưu đãi)</span>
                                                    <span>-{promoDiscount.toLocaleString('de-DE')} VND</span>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        <>
                                            {adults > 0 ? (
                                                <div className={styles.priceRow}>
                                                    <span>
                                                        {adultPrice.toLocaleString('de-DE')} × {adults} người lớn
                                                    </span>
                                                    <span>{adultTotal.toLocaleString('de-DE')} VND</span>
                                                </div>
                                            ) : null}
                                            {children > 0 ? (
                                                <div className={styles.priceRow}>
                                                    <span>
                                                        {childPrice.toLocaleString('de-DE')} × {children} trẻ em
                                                    </span>
                                                    <span>{childTotal.toLocaleString('de-DE')} VND</span>
                                                </div>
                                            ) : null}
                                            {infants > 0 ? (
                                                <div className={styles.priceRow}>
                                                    <span>Em bé</span>
                                                    <span>0 VND</span>
                                                </div>
                                            ) : null}
                                            {mockDiscount > 0 ? (
                                                <div className={styles.priceRow}>
                                                    <span>Giảm giá demo</span>
                                                    <span>-{mockDiscount.toLocaleString('de-DE')} VND</span>
                                                </div>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </details>

                            <div className={styles.totalRed}>
                                <span className={styles.totalRedLabel}>Tổng tiền</span>
                                <span className={styles.totalRedValue}>{finalPrice.toLocaleString('de-DE')}₫</span>
                            </div>

                            {step === 1 && (
                                <>
                                    <div className={styles.termsRow}>
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => {
                                                setAgreeTerms(e.target.checked);
                                                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                                            }}
                                        />
                                        <span>
                                            Tôi đồng ý với{' '}
                                            <Link to="/privacy-policy">Chính sách bảo vệ dữ liệu cá nhân</Link> và{' '}
                                            <Link to="/terms-of-service">Các điều khoản</Link>
                                        </span>
                                    </div>
                                    {errors.terms ? <div className={styles.errorText}>{errors.terms}</div> : null}
                                    <button
                                        type="button"
                                        className={`${styles.sidebarSubmit} ${step1Complete ? styles.sidebarSubmitEnabled : styles.sidebarSubmitDisabled}`}
                                        onClick={goStep2}
                                        disabled={!step1Complete}
                                    >
                                        {step1Complete ? 'Tiếp tục thanh toán' : 'Chưa nhập đủ thông tin'}
                                    </button>
                                </>
                            )}

                            {step === 2 && paymentType === 'deposit' && !useLivePricing ? (
                                <div className={styles.depositSummary}>
                                    <div className={styles.depositSummaryRow}>
                                        <span>Cọc 30%</span>
                                        <span className={styles.depositAmount}>{amountDue.toLocaleString('de-DE')} VND</span>
                                    </div>
                                    <div className={styles.depositSummaryRow}>
                                        <span>Còn lại</span>
                                        <span>{remainingAmount.toLocaleString('de-DE')} VND</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

function BadgePercentIcon() {
    return (
        <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 9h.01M15 15h.01M16 8l-8 8" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
}

function ClipboardListIcon() {
    return <FileText className={styles.sectionIcon} />;
}

export default Checkout;
