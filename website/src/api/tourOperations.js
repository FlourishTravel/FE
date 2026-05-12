import { API_BASE } from './config';

/**
 * API client cho trang Điều hành tour (Tour Operations / Dispatch).
 *
 * Backend endpoints (đều yêu cầu ADMIN):
 *   - GET    /tour-operations/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD&q=
 *   - GET    /tour-operations/guides?date=YYYY-MM-DD&excludeSessionId=
 *   - PUT    /tour-operations/sessions/{id}/guide           {guideId, notify, note}
 *   - DELETE /tour-operations/sessions/{id}/guide
 *   - PUT    /tour-operations/sessions/{id}/status          {status, note}
 */

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

/**
 * Lấy danh sách session khởi hành trong khoảng [from, to] (định dạng YYYY-MM-DD).
 * @param {{ from: string, to: string, q?: string }} params
 * @returns {Promise<Array<TourOperationDto>>}
 */
export async function listOperationSessions({ from, to, q } = {}) {
  const search = new URLSearchParams();
  if (from) search.set('from', from);
  if (to) search.set('to', to);
  if (q) search.set('q', q);

  const res = await fetch(`${API_BASE}/tour-operations/sessions?${search.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Danh sách HDV (TOUR_GUIDE active) kèm workload tháng và cờ trùng lịch.
 * @param {{ date?: string, excludeSessionId?: string }} params
 */
export async function listAvailableGuides({ date, excludeSessionId } = {}) {
  const search = new URLSearchParams();
  if (date) search.set('date', date);
  if (excludeSessionId) search.set('excludeSessionId', excludeSessionId);
  const qs = search.toString();

  const res = await fetch(`${API_BASE}/tour-operations/guides${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/** Gán / đổi HDV cho 1 session. */
export async function assignGuide(sessionId, { guideId, notify = true, note } = {}) {
  const res = await fetch(`${API_BASE}/tour-operations/sessions/${sessionId}/guide`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ guideId, notify, note }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Huỷ gán HDV (đưa session về trạng thái cần điều phối). */
export async function unassignGuide(sessionId) {
  const res = await fetch(`${API_BASE}/tour-operations/sessions/${sessionId}/guide`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Đổi trạng thái session (scheduled | cancelled | completed). */
export async function updateSessionStatus(sessionId, status, note) {
  const res = await fetch(`${API_BASE}/tour-operations/sessions/${sessionId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, note }),
  });
  const json = await parseJson(res);
  return json?.data;
}
