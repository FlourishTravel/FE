import { API_BASE } from './config';

const TOKEN_STORAGE_KEY = 'flourish_token';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const message = (json && json.message) || `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/** Danh sách khách + lịch sử check-in/check-out HDV của một đợt. */
export async function getAdminSessionGuests(sessionId) {
  const res = await fetch(`${API_BASE}/admin/sessions/${sessionId}/guests`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Danh sách chờ chỗ / chờ lịch mới của tour. */
export async function getAdminTourWaitlist(tourId) {
  const res = await fetch(`${API_BASE}/admin/tours/${tourId}/waitlist`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}
