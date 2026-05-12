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
    const message = (json && json.message) || `Yeu cau that bai (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

export async function listMyGuideSessions(params = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set('month', String(params.month));
  if (params.year) search.set('year', String(params.year));
  if (params.week) search.set('week', params.week);
  const qs = search.toString();

  const res = await fetch(`${API_BASE}/guide/sessions${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function getMyGuideSessionDetail(sessionId) {
  const res = await fetch(`${API_BASE}/guide/sessions/${sessionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data || null;
}

export async function getSessionMembers(sessionId) {
  const res = await fetch(`${API_BASE}/guide/sessions/${sessionId}/members`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/** Booking đã thanh toán + khách trong đơn, điểm đón, check-in — trang Quản lý khách HDV. */
export async function getGuideSessionGuests(sessionId) {
  const res = await fetch(`${API_BASE}/guide/sessions/${sessionId}/guests`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data || null;
}

export async function checkinSessionMember({ sessionId, userId, checkInType = 'gathering' }) {
  const res = await fetch(`${API_BASE}/guide/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ sessionId, userId, checkInType }),
  });
  const json = await parseJson(res);
  return json?.data || null;
}

/** Điểm danh theo dòng người tham gia (session_participants). */
export async function participantCheckIn(sessionId, participantId) {
  const res = await fetch(
    `${API_BASE}/guide/sessions/${sessionId}/participants/${participantId}/check-in`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    },
  );
  const json = await parseJson(res);
  return json?.data || null;
}

/** Check-out (trả khách) theo dòng người tham gia. */
export async function participantCheckOut(sessionId, participantId) {
  const res = await fetch(
    `${API_BASE}/guide/sessions/${sessionId}/participants/${participantId}/check-out`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    },
  );
  const json = await parseJson(res);
  return json?.data || null;
}

/** Điểm danh / check-out tại một hoạt động trong lịch trình tour (theo tour_activity). */
export async function participantActivityCheckIn(sessionId, participantId, activityId) {
  const res = await fetch(
    `${API_BASE}/guide/sessions/${sessionId}/participants/${participantId}/activities/${activityId}/check-in`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    },
  );
  const json = await parseJson(res);
  return json?.data || null;
}

export async function participantActivityCheckOut(sessionId, participantId, activityId) {
  const res = await fetch(
    `${API_BASE}/guide/sessions/${sessionId}/participants/${participantId}/activities/${activityId}/check-out`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    },
  );
  const json = await parseJson(res);
  return json?.data || null;
}
