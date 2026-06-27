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

export async function listFeaturedReviews(limit = 6) {
  const res = await fetch(`${API_BASE}/reviews/featured?limit=${limit}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải đánh giá');
  return Array.isArray(json.data) ? json.data : [];
}

export async function listPublicReviews({ tourId, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (tourId) params.set('tourId', tourId);
  if (limit) params.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/reviews/public?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải đánh giá');
  return Array.isArray(json.data) ? json.data : [];
}
