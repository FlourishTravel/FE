import { API_BASE } from './config';

/**
 * API client cho Category (danh mục tour).
 * - GET là public, các mutation cần Authorization: Bearer <token> (role ADMIN).
 * - Token sẽ được đọc từ localStorage (key 'flourish_token') khi đã wire-up đăng nhập thật.
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

export async function listCategories() {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  return json?.data ?? [];
}

export async function createCategory(payload) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function updateCategory(id, payload) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  await parseJson(res);
}

export async function listArchivedCategories() {
  const res = await fetch(`${API_BASE}/categories/archived`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data ?? [];
}

export async function restoreCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${id}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}
