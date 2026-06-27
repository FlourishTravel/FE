import { API_BASE } from './config';

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Yêu cầu thất bại');
  return json;
}

/** @param {'news'|'story'|'career'|'help'} type */
export async function listSiteContent(type) {
  const q = type ? `?type=${encodeURIComponent(type)}` : '';
  const res = await fetch(`${API_BASE}/content${q}`);
  const json = await parseJson(res);
  return Array.isArray(json.data) ? json.data : [];
}

export async function getSiteContentBySlug(slug) {
  const res = await fetch(`${API_BASE}/content/${encodeURIComponent(slug)}`);
  const json = await parseJson(res);
  return json.data;
}
