import { API_BASE } from './config';
import { getAccessToken } from './auth';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function createReview({ bookingId, rating, comment, feedbackTags }) {
  const body = { bookingId, rating, comment };
  if (feedbackTags?.length) body.feedbackTags = feedbackTags;
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không gửi được đánh giá');
  return json;
}
