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
    throw err;
  }
  return json;
}

export async function listSessionExpenses(sessionId) {
  const res = await fetch(`${API_BASE}/guide/sessions/${encodeURIComponent(sessionId)}/expenses`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function createSessionExpense(sessionId, payload) {
  const res = await fetch(`${API_BASE}/guide/sessions/${encodeURIComponent(sessionId)}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function deleteSessionExpense(sessionId, expenseId) {
  const res = await fetch(
    `${API_BASE}/guide/sessions/${encodeURIComponent(sessionId)}/expenses/${encodeURIComponent(expenseId)}`,
    { method: 'DELETE', headers: { ...authHeaders() } },
  );
  await parseJson(res);
}
