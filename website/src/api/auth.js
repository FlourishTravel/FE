import { API_BASE } from './config';

/**
 * API client cho luồng Authentication (Đăng nhập / Đăng ký / Refresh / Logout).
 *
 * Backend endpoints (context-path = /api):
 *   - POST /api/auth/login           { email, password }
 *   - POST /api/auth/register        { email, password, fullName, phone }
 *   - POST /api/auth/refresh         { refreshToken }
 *   - POST /api/auth/logout          { refreshToken }
 *
 * Response của login/register (BE wrap trong ApiResponse):
 *   {
 *     "success": true,
 *     "data": {
 *        "accessToken": "...",
 *        "refreshToken": "...",
 *        "expiresIn": 900,
 *        "user": { id, email, fullName, role, avatarUrl }
 *     }
 *   }
 */

export const TOKEN_STORAGE_KEY = 'flourish_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'flourish_refresh_token';

async function parseJson(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

export function saveAuthTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

/** POST /auth/login */
export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** POST /auth/register */
export async function registerApi({ email, password, fullName, phone }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, phone }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** POST /auth/refresh */
export async function refreshTokenApi(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await parseJson(res);
  return json?.data;
}

/** POST /auth/logout */
export async function logoutApi(refreshToken) {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshToken || null }),
    });
  } catch {
    // Logout là best-effort, lỗi mạng vẫn coi như đã đăng xuất ở client.
  }
}
