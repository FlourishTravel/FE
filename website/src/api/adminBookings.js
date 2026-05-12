import { API_BASE } from './config';

/**
 * API client cho Quản Lý Đặt Chỗ (Admin).
 *
 * Backend endpoints (đều yêu cầu ADMIN):
 *   - GET    /bookings/admin?q=&status=&from=&to=&page=&size=
 *   - GET    /bookings/admin/stats
 *   - GET    /bookings/admin/{id}
 *   - PATCH  /bookings/admin/{id}/status            { status, note }
 *   - POST   /bookings/admin/{id}/mark-paid         { amount?, note? }
 *   - POST   /bookings/admin/{id}/refund/approve    { refundId?, amount?, reason? }
 *   - POST   /bookings/admin/{id}/refund/reject     { refundId?, reason }
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
 * Danh sách booking cho admin (paginated).
 * @returns {Promise<{ content: AdminBookingSummaryDto[], totalElements, totalPages, number, size }>}
 */
export async function listAdminBookings({ q, status, from, to, page = 0, size = 20 } = {}) {
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (status && status !== 'all') search.set('status', status);
  if (from) search.set('from', from);
  if (to) search.set('to', to);
  search.set('page', String(page));
  search.set('size', String(size));

  const res = await fetch(`${API_BASE}/bookings/admin?${search.toString()}`, {
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

/** Stats tổng quan (Stat cards). */
export async function getAdminBookingStats() {
  const res = await fetch(`${API_BASE}/bookings/admin/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Chi tiết booking. */
export async function getAdminBookingDetail(id) {
  const res = await fetch(`${API_BASE}/bookings/admin/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Đổi trạng thái booking (pending | paid | confirmed | completed | cancelled). */
export async function updateBookingStatus(id, status, note) {
  const res = await fetch(`${API_BASE}/bookings/admin/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, note }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Ghi nhận thanh toán thủ công (chuyển khoản). amount mặc định = balance còn lại. */
export async function markBookingPaid(id, { amount, note } = {}) {
  const res = await fetch(`${API_BASE}/bookings/admin/${id}/mark-paid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, note }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Duyệt 1 refund pending. amount mặc định = số tiền refund gốc. */
export async function approveBookingRefund(id, { refundId, amount, reason } = {}) {
  const res = await fetch(`${API_BASE}/bookings/admin/${id}/refund/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ refundId, amount, reason }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Từ chối 1 refund pending (reason bắt buộc). */
export async function rejectBookingRefund(id, { refundId, reason }) {
  const res = await fetch(`${API_BASE}/bookings/admin/${id}/refund/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ refundId, reason }),
  });
  const json = await parseJson(res);
  return json?.data;
}
