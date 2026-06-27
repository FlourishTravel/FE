import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  refreshTokenApi,
  saveAuthTokens,
} from './auth';

const USER_STORAGE_KEY = 'flourish_user';

let refreshInFlight = null;

export function clearAuthSession() {
  clearAuthTokens();
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Fetch có Bearer token; tự refresh khi 401; phát event session-expired khi hết phiên.
 */
export async function authorizedFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    window.dispatchEvent(new Event('flourish:session-expired'));
    return response;
  }

  try {
    if (!refreshInFlight) {
      refreshInFlight = refreshTokenApi(refreshToken).finally(() => {
        refreshInFlight = null;
      });
    }
    const data = await refreshInFlight;
    if (!data?.accessToken) {
      throw new Error('Refresh failed');
    }
    saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    const retryHeaders = new Headers(options.headers || {});
    retryHeaders.set('Authorization', `Bearer ${data.accessToken}`);
    response = await fetch(url, { ...options, headers: retryHeaders });
    if (response.status === 401) {
      clearAuthSession();
      window.dispatchEvent(new Event('flourish:session-expired'));
    }
  } catch {
    clearAuthSession();
    window.dispatchEvent(new Event('flourish:session-expired'));
  }

  return response;
}

export async function parseAuthorizedJson(res) {
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
