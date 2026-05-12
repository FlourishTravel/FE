import { API_BASE } from './config';

/**
 * API Quản lý nhân viên (ADMIN).
 *
 * GET    /users/admin/staff/stats
 * GET    /users/admin/staff?q=&employmentStatus=&roleName=&department=&page=&size=
 * GET    /users/admin/staff/{id}
 * POST   /users/admin/staff
 * PATCH  /users/admin/staff/{id}
 * POST   /users/admin/staff/{id}/activate
 * POST   /users/admin/staff/{id}/deactivate
 * PATCH  /users/admin/staff/{id}/password  { newPassword }
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

export async function getStaffStats() {
  const res = await fetch(`${API_BASE}/users/admin/staff/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function listStaff({
  q,
  employmentStatus,
  roleName,
  department,
  page = 0,
  size = 20,
} = {}) {
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (employmentStatus && employmentStatus !== 'all') search.set('employmentStatus', employmentStatus);
  if (roleName && roleName !== 'all') search.set('roleName', roleName);
  if (department && department !== 'all') search.set('department', department);
  search.set('page', String(page));
  search.set('size', String(size));

  const res = await fetch(`${API_BASE}/users/admin/staff?${search.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  const data = json?.data || {};
  return {
    content: Array.isArray(data.content) ? data.content : [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    number: data.number ?? 0,
    size: data.size ?? size,
  };
}

export async function getStaffDetail(id) {
  const res = await fetch(`${API_BASE}/users/admin/staff/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function createStaff(body) {
  const res = await fetch(`${API_BASE}/users/admin/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function updateStaff(id, body) {
  const res = await fetch(`${API_BASE}/users/admin/staff/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function activateStaff(id) {
  const res = await fetch(`${API_BASE}/users/admin/staff/${id}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function deactivateStaff(id) {
  const res = await fetch(`${API_BASE}/users/admin/staff/${id}/deactivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function resetStaffPassword(id, newPassword) {
  const res = await fetch(`${API_BASE}/users/admin/staff/${id}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ newPassword }),
  });
  const json = await parseJson(res);
  return json?.data;
}
