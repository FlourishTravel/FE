import { API_BASE } from './config';
import { getAccessToken } from './auth';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getFloraJourney(bookingId) {
  const res = await fetch(`${API_BASE}/flora/bookings/${bookingId}/journey`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải hành trình');
  return json;
}

export async function postFloraLocation(bookingId, body) {
  const res = await fetch(`${API_BASE}/flora/bookings/${bookingId}/location`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không gửi vị trí');
  return json;
}

export async function getNotifications({ unreadOnly = false, limit = 20 } = {}) {
  const q = new URLSearchParams();
  if (unreadOnly) q.set('unread_only', 'true');
  if (limit) q.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/notifications?${q}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải thông báo');
  return json;
}

export async function postFloraNearbyRecommendations(bookingId, body = {}) {
  const res = await fetch(`${API_BASE}/flora/bookings/${bookingId}/nearby-recommendations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải gợi ý gần đây');
  return json;
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Lỗi đánh dấu đã đọc');
  return json;
}

export async function getFloraPreferences() {
  const res = await fetch(`${API_BASE}/flora/preferences/me`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải sở thích');
  return json;
}

export async function updateFloraPreferences(body) {
  const res = await fetch(`${API_BASE}/flora/preferences/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không lưu sở thích');
  return json;
}

export async function getPostTourFeedbackContext(bookingId) {
  const res = await fetch(`${API_BASE}/flora/bookings/${bookingId}/post-tour-feedback`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải phản hồi chuyến đi');
  return json;
}

export async function previewFeedbackPreferences(selectedTagIds) {
  const res = await fetch(`${API_BASE}/flora/feedback/preference-preview`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ selectedTagIds }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không xem trước sở thích');
  return json;
}
