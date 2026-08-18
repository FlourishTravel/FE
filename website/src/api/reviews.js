import { authorizedFetch, parseAuthorizedJson } from './http';
import { API_BASE } from './config';

export async function listMyReviews() {
  const res = await authorizedFetch(`${API_BASE}/reviews/me`);
  const json = await parseAuthorizedJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function listFeaturedReviews(limit = 6) {
  const res = await fetch(`${API_BASE}/reviews/featured`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải được đánh giá nổi bật');
  const rows = Array.isArray(json?.data) ? json.data : [];
  return limit > 0 ? rows.slice(0, limit) : rows;
}

export async function listPublicReviews(tourId) {
  const q = tourId ? `?tourId=${encodeURIComponent(tourId)}` : '';
  const res = await fetch(`${API_BASE}/reviews/public${q}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải được đánh giá');
  return Array.isArray(json?.data) ? json.data : [];
}

export async function createReview({ bookingId, rating, comment, feedbackTags, guideRating, guideFeedbackTags }) {
  const res = await authorizedFetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId,
      rating,
      comment,
      feedbackTags,
      guideRating,
      guideFeedbackTags,
    }),
  });
  const json = await parseAuthorizedJson(res);
  return json?.data || json;
}
