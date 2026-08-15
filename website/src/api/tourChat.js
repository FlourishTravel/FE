import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

/**
 * Ngữ cảnh phòng chat theo booking (tour, lịch, thành viên, có được chat không).
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
 * Gửi tin nhắn text, có thể trả lời một tin khác.
 * @param {string} bookingId
 * @param {string} content
 * @param {string} [replyToMessageId]
 */
export async function sendBookingChatMessage(bookingId, content, replyToMessageId) {
  const body = { content };
  if (replyToMessageId) body.replyToMessageId = replyToMessageId;
  const res = await authorizedFetch(`${API_BASE}/chat/bookings/${encodeURIComponent(bookingId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseAuthorizedJson(res);
  return json?.data ?? null;
}

/**
 * Bật/tắt (hoặc đổi) icon cảm xúc trên tin nhắn.
 * @param {string} messageId
 * @param {string} reactionType emoji, ví dụ 👍
 */
export async function toggleChatReaction(messageId, reactionType) {
  const res = await authorizedFetch(
    `${API_BASE}/chat/messages/${encodeURIComponent(messageId)}/reactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType }),
    },
  );
  const json = await parseAuthorizedJson(res);
  return json?.data ?? null;
}

export const CHAT_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];
