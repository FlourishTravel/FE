import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

export async function listGuideExpensesAdmin(status = 'all') {
  const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const res = await authorizedFetch(`${API_BASE}/admin/guide-expenses${q}`);
  const json = await parseAuthorizedJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function updateGuideExpenseStatus(expenseId, { status, adminNote }) {
  const res = await authorizedFetch(`${API_BASE}/admin/guide-expenses/${encodeURIComponent(expenseId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNote }),
  });
  const json = await parseAuthorizedJson(res);
  return json?.data;
}
