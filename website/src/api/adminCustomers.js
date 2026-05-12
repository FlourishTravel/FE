import { API_BASE } from './config';

/**
 * API client cho Quản Lý Khách Hàng (Admin).
 *
 * Backend endpoints (đều yêu cầu ADMIN):
 *   - GET    /users/admin/customers?q=&tier=&active=&page=&size=
 *   - GET    /users/admin/stats
 *   - GET    /users/admin/customers/{id}
 *   - PATCH  /users/admin/customers/{id}            (AdminUpdateCustomerRequest)
 *   - POST   /users/admin/customers/{id}/activate
 *   - POST   /users/admin/customers/{id}/deactivate
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
 * Danh sách khách hàng cho admin (paginated).
 * @returns {Promise<{ content, totalElements, totalPages, number, size }>}
 */
export async function listAdminCustomers({ q, tier, active, page = 0, size = 20 } = {}) {
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (tier && tier !== 'all') search.set('tier', tier);
  if (active !== undefined && active !== null && active !== 'all') search.set('active', String(active));
  search.set('page', String(page));
  search.set('size', String(size));

  const res = await fetch(`${API_BASE}/users/admin/customers?${search.toString()}`, {
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

/** Stats tổng quan trang admin Khách Hàng. */
export async function getAdminCustomerStats() {
  const res = await fetch(`${API_BASE}/users/admin/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Chi tiết khách hàng. */
export async function getAdminCustomerDetail(id) {
  const res = await fetch(`${API_BASE}/users/admin/customers/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Cập nhật thông tin khách hàng. */
export async function updateAdminCustomer(id, payload) {
  const res = await fetch(`${API_BASE}/users/admin/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Kích hoạt KH. */
export async function activateAdminCustomer(id) {
  const res = await fetch(`${API_BASE}/users/admin/customers/${id}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Vô hiệu hoá KH. */
export async function deactivateAdminCustomer(id) {
  const res = await fetch(`${API_BASE}/users/admin/customers/${id}/deactivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({}),
  });
  const json = await parseJson(res);
  return json?.data;
}
