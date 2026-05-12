import { API_BASE } from './config';

/**
 * API client cho trang admin Tài Chính.
 *
 * Backend endpoints (ADMIN-only):
 *   - GET    /finance/admin/overview
 *   - GET    /finance/admin/transactions?q=&kind=&status=&provider=&from=&to=&page=&size=
 *   - GET    /finance/admin/transactions/{kind}/{id}
 *   - PATCH  /finance/admin/payments/{id}             { status, feeAmount, failureReason, adminNote }
 *   - GET    /finance/admin/export?...                (CSV)
 */

const TOKEN_STORAGE_KEY = 'flourish_token';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  if (!res.ok) {
    const message = (json && json.message) || `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/** Stat cards + chart + top tours. */
export async function getFinanceOverview() {
  const res = await fetch(`${API_BASE}/finance/admin/overview`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Danh sách giao dịch (payment + refund). */
export async function listTransactions({
  q, kind, status, provider, from, to, page = 0, size = 20,
} = {}) {
  const search = new URLSearchParams();
  if (q) search.set('q', q);
  if (kind && kind !== 'all') search.set('kind', kind);
  if (status && status !== 'all') search.set('status', status);
  if (provider && provider !== 'all') search.set('provider', provider);
  if (from) search.set('from', from);
  if (to) search.set('to', to);
  search.set('page', String(page));
  search.set('size', String(size));

  const res = await fetch(`${API_BASE}/finance/admin/transactions?${search.toString()}`, {
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

/** Chi tiết 1 giao dịch. */
export async function getTransactionDetail(kind, id) {
  const res = await fetch(`${API_BASE}/finance/admin/transactions/${kind}/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Cập nhật payment (note / status / fee / failureReason). */
export async function updatePayment(id, payload) {
  const res = await fetch(`${API_BASE}/finance/admin/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

/**
 * Xuất CSV. Trả về Blob; cố gắng trigger download phía client.
 */
export async function exportTransactionsCsv(filters = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      search.set(key, String(value));
    }
  }
  const res = await fetch(`${API_BASE}/finance/admin/export?${search.toString()}`, {
    method: 'GET',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    let message = `Xuất báo cáo thất bại (HTTP ${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text.slice(0, 200);
    } catch { /* ignore */ }
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
