import { API_BASE } from './config';

/**
 * Gửi tin nhắn lên chatbot API.
 * @param {{ content: string, sessionId?: string, userId?: string, state?: object }} body
 * @returns {Promise<{ success: boolean, data?: { reply, tours, quickReplies, state } }>}
 */
export async function sendChatbotMessage(body) {
  const res = await fetch(`${API_BASE}/chatbot/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: body.content || '',
      sessionId: body.sessionId || null,
      userId: body.userId || null,
      state: body.state || null,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gửi tin nhắn thất bại');
  }
  return json;
}
