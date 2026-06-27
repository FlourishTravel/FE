import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

export async function getMe() {
  const res = await authorizedFetch(`${API_BASE}/users/me`);
  return parseAuthorizedJson(res);
}

export async function updateMe(body) {
  const res = await authorizedFetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseAuthorizedJson(res);
}

export async function getTravelPreferences() {
  const res = await authorizedFetch(`${API_BASE}/users/me/travel-preferences`);
  return parseAuthorizedJson(res);
}

export async function updateTravelPreferences(body) {
  const res = await authorizedFetch(`${API_BASE}/users/me/travel-preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseAuthorizedJson(res);
}
