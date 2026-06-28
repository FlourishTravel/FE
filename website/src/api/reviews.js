import { authorizedFetch, parseAuthorizedJson } from './http';
import { API_BASE } from './config';

export async function listMyReviews() {
  const res = await authorizedFetch(`${API_BASE}/reviews/me`);
  const json = await parseAuthorizedJson(res);
  return Array.isArray(json?.data) ? json.data : [];
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
