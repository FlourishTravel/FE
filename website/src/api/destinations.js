import { API_BASE } from './config';

async function parseJsonSafe(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error((json && json.message) || 'Không tải được điểm đến.');
  }
  return json;
}

function unwrapArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

export async function listDestinations() {
  const res = await fetch(`${API_BASE}/destinations`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJsonSafe(res);
  return unwrapArray(json);
}

export async function getDestination(slug) {
  const encoded = encodeURIComponent(slug);
  const res = await fetch(`${API_BASE}/destinations/${encoded}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}
