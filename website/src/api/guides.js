import { API_BASE } from './config';

async function parseJsonSafe(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error((json && json.message) || 'Không tải được hướng dẫn viên.');
  }
  return json;
}

function unwrapArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

export async function listPublicGuides() {
  const res = await fetch(`${API_BASE}/guides`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJsonSafe(res);
  return unwrapArray(json);
}

export async function getPublicGuide(id) {
  const encoded = encodeURIComponent(id);
  const res = await fetch(`${API_BASE}/guides/${encoded}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}
