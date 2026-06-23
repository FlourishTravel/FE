import { API_BASE } from './config';
import { getAccessToken } from './auth';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/users/me`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải được hồ sơ');
  return json;
}

export async function updateMe(body) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Cập nhật thất bại');
  return json;
}

export async function getTravelPreferences() {
  const res = await fetch(`${API_BASE}/users/me/travel-preferences`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Không tải sở thích');
  return json;
}

export async function updateTravelPreferences(body) {
  const res = await fetch(`${API_BASE}/users/me/travel-preferences`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Cập nhật sở thích thất bại');
  return json;
}
