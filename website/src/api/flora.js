import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

export async function getFloraJourney(bookingId) {
  const res = await authorizedFetch(`${API_BASE}/flora/bookings/${bookingId}/journey`);
  return parseAuthorizedJson(res);
}

export async function postFloraLocation(bookingId, body) {
  const res = await authorizedFetch(`${API_BASE}/flora/bookings/${bookingId}/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseAuthorizedJson(res);
}

export async function getNotifications({ unreadOnly = false, limit = 20 } = {}) {
  const q = new URLSearchParams();
  if (unreadOnly) q.set('unread_only', 'true');
  if (limit) q.set('limit', String(limit));
  const res = await authorizedFetch(`${API_BASE}/notifications?${q}`);
  return parseAuthorizedJson(res);
}

export async function postFloraNearbyRecommendations(bookingId, body = {}) {
  const res = await authorizedFetch(`${API_BASE}/flora/bookings/${bookingId}/nearby-recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseAuthorizedJson(res);
}

export async function markNotificationRead(id) {
  const res = await authorizedFetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return parseAuthorizedJson(res);
}

export async function markAllNotificationsRead() {
  const res = await authorizedFetch(`${API_BASE}/notifications/read-all`, {
    method: 'POST',
  });
  return parseAuthorizedJson(res);
}

export async function getFloraPreferences() {
  const res = await authorizedFetch(`${API_BASE}/flora/preferences/me`);
  return parseAuthorizedJson(res);
}

export async function updateFloraPreferences(body) {
  const res = await authorizedFetch(`${API_BASE}/flora/preferences/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseAuthorizedJson(res);
}

export async function getPostTourFeedbackContext(bookingId) {
  const res = await authorizedFetch(`${API_BASE}/flora/bookings/${bookingId}/post-tour-feedback`);
  return parseAuthorizedJson(res);
}

export async function previewFeedbackPreferences(selectedTagIds) {
  const res = await authorizedFetch(`${API_BASE}/flora/feedback/preference-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedTagIds }),
  });
  return parseAuthorizedJson(res);
}
