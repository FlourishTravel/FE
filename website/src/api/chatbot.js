import { API_BASE } from './config';
import { getAccessToken } from './auth';

/**
 * Flora AI chat — POST /chatbot/message (backward compatible).
 */
export async function sendChatbotMessage(body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const payload = {
    content: body.content || body.message || '',
    message: body.message || body.content || undefined,
    sessionId: body.sessionId || null,
    userId: body.userId || null,
    state: body.state || null,
    bookingId: body.bookingId || null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    locale: body.locale || 'vi',
    source: body.source || 'flora',
  };

  const res = await fetch(`${API_BASE}/chatbot/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gửi tin nhắn thất bại');
  return json;
}
