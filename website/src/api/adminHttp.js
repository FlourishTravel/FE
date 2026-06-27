import { API_BASE } from './config';
import { authorizedFetch, parseAuthorizedJson } from './http';

export function normalizeAdminListPayload(data, size = 50) {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size,
    };
  }
  if (data && Array.isArray(data.content)) {
    return {
      content: data.content,
      totalElements: data.totalElements ?? data.content.length,
      totalPages: data.totalPages ?? 1,
      number: data.number ?? 0,
      size: data.size ?? size,
    };
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size,
  };
}

export async function adminGet(path, size = 50) {
  const res = await authorizedFetch(`${API_BASE}${path}`);
  const json = await parseAuthorizedJson(res);
  return normalizeAdminListPayload(json?.data, size);
}

export async function adminSend(path, { method = 'POST', body } = {}) {
  const res = await authorizedFetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await parseAuthorizedJson(res);
  return json?.data;
}
