import { API_BASE } from './config';

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Yêu cầu thất bại');
  return json;
}

/** Mã khuyến mãi đang hiệu lực (public). */
export async function listActivePromotions() {
  const res = await fetch(`${API_BASE}/promotions/active`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}
