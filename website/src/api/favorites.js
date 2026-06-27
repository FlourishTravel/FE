import { API_BASE } from './config';
import { getAccessToken } from './auth';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJsonSafe(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error((json && json.message) || 'Không thể xử lý danh sách yêu thích.');
  }
  return json;
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function getFavoriteTourId(item) {
  if (!item) return null;
  if (item.tourId) return String(item.tourId);
  if (item.id && !item.tour) return String(item.id);
  if (item.tour?.id) return String(item.tour.id);
  return null;
}

export async function listFavorites() {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const json = await parseJsonSafe(res);
  const rows = unwrapList(json);
  return rows
    .map((item) => ({
      ...item,
      tourId: getFavoriteTourId(item),
    }))
    .filter((item) => item.tourId);
}

export async function addFavorite(tourId) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ tourId }),
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}

export async function removeFavorite(tourId) {
  const encoded = encodeURIComponent(tourId);
  const res = await fetch(`${API_BASE}/favorites/${encoded}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await parseJsonSafe(res);
}
