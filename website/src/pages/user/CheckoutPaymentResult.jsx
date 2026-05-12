import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { resumeMomoPayUrl, syncMomoFromReturn } from '../../api/bookings';
import { getAccessToken } from '../../api/auth';

/**
 * Trang MoMo redirect về (returnUrl) và luồng mở lại cổng MoMo (?momo=1).
 * Query: resultCode, orderId, bookingId, message, extra (MoMo), pending, method, momo, continue
 */
const CheckoutPaymentResult = () => {
    const [params] = useSearchParams();
    const resultCode = params.get('resultCode');
    const message = params.get('message');
    const orderId = params.get('orderId');
    const bookingId = params.get('bookingId');
    const pending = params.get('pending');
    const method = params.get('method');
    const extra = params.get('extra');
    const momoParam = params.get('momo');
    const continueParam = params.get('continue');

    const [redirectError, setRedirectError] = useState('');
    const [redirecting, setRedirecting] = useState(false);
    const [syncingPaid, setSyncingPaid] = useState(false);
    const [syncError, setSyncError] = useState('');

    const momoOk = resultCode === '0';
    const momoFail = resultCode != null && resultCode !== '' && resultCode !== '0';

    const shouldOpenMomo =
        bookingId &&
        (momoParam === '1' || continueParam === '1') &&
        (resultCode == null || resultCode === '') &&
        pending !== '1' &&
        !(method && method !== 'ewallet');

    useEffect(() => {
        if (!shouldOpenMomo) return undefined;
        const token = getAccessToken();
        if (!token) {
            setRedirectError('Vui lòng đăng nhập để tiếp tục thanh toán MoMo.');
            return undefined;
        }
        let cancelled = false;
        setRedirecting(true);
        setRedirectError('');
        (async () => {
            try {
                const { paymentUrl } = await resumeMomoPayUrl(bookingId);
                if (cancelled) return;
                if (paymentUrl) {
                    window.location.assign(paymentUrl);
                    return;
                }
                setRedirectError('Không nhận được liên kết thanh toán từ máy chủ.');
            } catch (e) {
                if (!cancelled) setRedirectError(e.message || 'Không mở được cổng MoMo.');
            } finally {
                if (!cancelled) setRedirecting(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [shouldOpenMomo, bookingId]);

    /** IPN MoMo thường không tới localhost — gọi BE tra cứu MoMo + cập nhật paid. */
    useEffect(() => {
        if (!momoOk || !orderId) return undefined;
        const token = getAccessToken();
        if (!token) {
            setSyncError('Vui lòng đăng nhập (cùng tài khoản đã đặt tour) để cập nhật trạng thái đơn trên hệ thống.');
            return undefined;
        }
        let cancelled = false;
        setSyncingPaid(true);
        setSyncError('');
        (async () => {
            try {
                await syncMomoFromReturn(orderId);
            } catch (e) {
                if (!cancelled) setSyncError(e.message || 'Không cập nhật được trạng thái đơn.');
            } finally {
                if (!cancelled) setSyncingPaid(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [momoOk, orderId]);

    let title = 'Kết quả thanh toán';
    let desc = '';
    let icon = <Loader2 className="animate-spin text-emerald-600" size={48} />;

    if (redirectError && shouldOpenMomo) {
        title = 'Không mở được trang thanh toán MoMo';
        desc = redirectError;
        icon = <XCircle className="text-red-600" size={48} />;
    } else if (redirecting || (shouldOpenMomo && !redirectError)) {
        title = 'Đang chuyển đến MoMo';
        desc = 'Vui lòng đợi, hệ thống đang mở trang thanh toán (QR / thẻ)...';
        icon = <Loader2 className="animate-spin text-emerald-600" size={48} />;
    } else if (momoOk) {
        title = 'Thanh toán thành công';
        if (syncingPaid) {
            desc = 'Đang cập nhật trạng thái đơn trên hệ thống...';
            icon = <Loader2 className="animate-spin text-emerald-600" size={48} />;
        } else {
            desc =
                'Cảm ơn bạn! Đơn đặt tour đã được ghi nhận. Bạn có thể xem chi tiết trong mục Chuyến đi của tôi.';
            icon = <CheckCircle className="text-emerald-600" size={48} />;
        }
    } else if (momoFail) {
        title = 'Thanh toán chưa hoàn tất';
        desc = message || `Mã lỗi: ${resultCode}. Vui lòng thử lại hoặc chọn phương thức khác.`;
        icon = <XCircle className="text-red-600" size={48} />;
    } else if (pending === '1') {
        title = 'Chờ cấu hình thanh toán';
        desc =
            'Hệ thống chưa gắn đủ thông tin cổng MoMo (biến môi trường MOMO_* trên backend). Vui lòng liên hệ quản trị.';
    } else if (method && method !== 'ewallet') {
        title = 'Đặt chỗ đã tạo';
        desc = `Phương thức bạn chọn (${method}) sẽ được hướng dẫn qua email hoặc nhân viên.`;
        icon = <CheckCircle className="text-emerald-600" size={48} />;
    } else if (bookingId) {
        title = 'Đang xử lý';
        desc = 'Nếu bạn vừa hoàn tất trên MoMo, trạng thái đơn sẽ cập nhật trong vài phút.';
    } else {
        desc = 'Không có thông tin giao dịch trong URL.';
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="flex justify-center mb-4">{icon}</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{desc}</p>
                {momoOk && syncError ? (
                    <div className="text-left text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6">
                        {syncError}
                        <p className="mt-2 text-xs text-amber-900/80">
                            Nếu MoMo đã trừ tiền, vào &quot;Chuyến đi của tôi&quot; và làm mới sau vài giây, hoặc liên hệ hỗ trợ kèm mã{' '}
                            <strong>{orderId || '—'}</strong>.
                        </p>
                    </div>
                ) : null}
                {redirectError && !shouldOpenMomo ? (
                    <div className="text-left text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
                        {redirectError}
                        <div className="mt-3">
                            <Link to="/login" className="font-semibold text-red-800 underline">
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                ) : null}
                {(orderId || bookingId) && (
                    <div className="text-left text-xs text-gray-500 space-y-1 mb-6 bg-gray-50 rounded-lg p-3">
                        {bookingId ? <div>Mã đặt chỗ: {bookingId}</div> : null}
                        {orderId ? <div>Mã giao dịch: {orderId}</div> : null}
                        {extra ? <div>Extra: {extra}</div> : null}
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/my-journey"
                        className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700"
                    >
                        Chuyến đi của tôi
                    </Link>
                    <Link
                        to="/tours"
                        className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl border border-gray-200 text-gray-800 font-semibold text-sm hover:bg-gray-50"
                    >
                        Về danh sách tour
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPaymentResult;
