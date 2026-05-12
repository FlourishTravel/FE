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

function authHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Ngữ cảnh phòng chat theo booking (tour, lịch, có được chat không).
 * @param {string} bookingId UUID
 */
export async function getTourChatContext(bookingId) {
  const res = await fetch(`${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/context`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const json = await parseJson(res);
  return json?.data ?? null;
}

/**
 * Tin nhắn (cũ → mới).
 * @param {string} bookingId
 * @param {{ limit?: number }} [opts]
 */
export async function listBookingChatMessages(bookingId, opts = {}) {
  const q = opts.limit != null ? `?limit=${encodeURIComponent(String(opts.limit))}` : '';
  const res = await fetch(
    `${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/messages${q}`,
    { method: 'GET', headers: authHeaders() },
  );
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Gửi tin nhắn text.
 * @param {string} bookingId
 * @param {string} content
 */
export async function sendBookingChatMessage(bookingId, content) {
  const res = await fetch(`${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  const json = await parseJson(res);
  return json?.data ?? null;
}
