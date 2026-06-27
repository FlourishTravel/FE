import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

/**
 * Ngữ cảnh phòng chat theo booking (tour, lịch, có được chat không).
 * @param {string} bookingId UUID
 */
export async function getTourChatContext(bookingId) {
  const res = await authorizedFetch(`${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/context`);
  const json = await parseAuthorizedJson(res);
  return json?.data ?? null;
}

/**
 * Tin nhắn (cũ → mới).
 * @param {string} bookingId
 * @param {{ limit?: number }} [opts]
 */
export async function listBookingChatMessages(bookingId, opts = {}) {
  const q = opts.limit != null ? `?limit=${encodeURIComponent(String(opts.limit))}` : '';
  const res = await authorizedFetch(
    `${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/messages${q}`,
  );
  const json = await parseAuthorizedJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Gửi tin nhắn text.
 * @param {string} bookingId
 * @param {string} content
 */
export async function sendBookingChatMessage(bookingId, content) {
  const res = await authorizedFetch(`${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const json = await parseAuthorizedJson(res);
  return json?.data ?? null;
}
