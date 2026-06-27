import { API_BASE } from './config';

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Yêu cầu thất bại');
  return json;
}

export async function listCatalogTickets({ category, destination } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (destination) params.set('destination', destination);
  const res = await fetch(`${API_BASE}/catalog/tickets?${params}`);
  const json = await parseJson(res);
  return Array.isArray(json.data) ? json.data : [];
}

export async function getCatalogTicket(slug) {
  const res = await fetch(`${API_BASE}/catalog/tickets/${encodeURIComponent(slug)}`);
  const json = await parseJson(res);
  return json.data;
}
