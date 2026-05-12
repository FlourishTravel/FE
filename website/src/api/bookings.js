import { API_BASE } from './config';
import { TOKEN_STORAGE_KEY } from './auth';

async function parseJson(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const message = (json && json.message) || `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/**
 * Danh sách đặt tour của user đăng nhập.
 * @returns {Promise<Array<object>>}
 */
export async function listMyBookings() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Chi tiết một đơn đặt (user đăng nhập, đúng chủ đơn).
 * @param {string} bookingId UUID
 * @returns {Promise<object>}
 */
export async function getMyBookingDetail(bookingId) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await parseJson(res);
  return json?.data ?? null;
}

/**
 * Hủy đơn chờ thanh toán.
 * @param {string} bookingId
 */
export async function cancelMyBooking(bookingId) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return parseJson(res);
}

/**
 * Yêu cầu hoàn tiền (đơn đã thanh toán).
 * @param {string} bookingId
 * @param {string} [reason]
 */
export async function requestBookingRefund(bookingId, reason) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/request-refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return parseJson(res);
}

/**
 * Tạo đơn đặt tour (đăng nhập bắt buộc).
 * BE trả về paymentUrl để chuyển tiếp thanh toán.
 * @param {object} body — sessionId, guestCount, specialRequests?, contactPhone?, promotionCode?, ...
 */
export async function createBooking(body) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await parseJson(res);
  return json?.data ?? null;
}

/**
 * Lấy lại payUrl MoMo cho đơn pending (sau khi mở link "Thanh toán ngay" /checkout/result?...&momo=1).
 * @param {string} bookingId UUID
 * @returns {Promise<{ paymentUrl?: string }>}
 */
export async function resumeMomoPayUrl(bookingId) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(bookingId)}/momo-pay-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: '{}',
  });
  const json = await parseJson(res);
  return json?.data ?? {};
}

/**
 * Đồng bộ DB sau khi MoMo redirect về (resultCode=0) — tra cứu MoMo Query API rồi ghi paid.
 * @param {string} orderId mã đơn MoMo (vd. FT-xxxxxxxx)
 */
export async function syncMomoFromReturn(orderId) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/momo/sync-from-return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ orderId }),
  });
  return parseJson(res);
}

/**
 * Kiểm tra lịch + chỗ (và trùng chuyến nếu đã đăng nhập) trước khi sang checkout.
 * @returns {Promise<{ valid: boolean, message?: string }>}
 */
export async function validateBookingSession({ sessionId, guestCount, tourId }) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/validate-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      sessionId,
      guestCount: guestCount != null ? guestCount : 1,
      ...(tourId ? { tourId } : {}),
    }),
  });
  const json = await parseJson(res);
  return json?.data ?? { valid: false, message: 'Không có phản hồi từ máy chủ.' };
}

/**
 * Kiểm tra mã khuyến mãi (nếu đăng nhập, BE kiểm tra luôn trùng lịch với đơn đang có).
 * @returns {Promise<{ valid: boolean, discountAmount?: number, message?: string }>}
 */
export async function validateBookingPromo({ code, sessionId, guestCount }) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const res = await fetch(`${API_BASE}/bookings/validate-promo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      code,
      sessionId,
      guestCount: guestCount != null ? guestCount : 1,
    }),
  });
  const json = await parseJson(res);
  return json?.data ?? { valid: false, message: '' };
}
