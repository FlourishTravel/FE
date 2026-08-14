import { API_BASE } from './config';
import { getAccessToken } from './auth';
import { authorizedFetch, parseAuthorizedJson } from './http';

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Yêu cầu thất bại');
  return json;
}

/** Mã khuyến mãi đang hiệu lực. Đã đăng nhập thì gồm cả voucher được tặng riêng. */
export async function listActivePromotions() {
  const token = getAccessToken();
  if (token) {
    const res = await authorizedFetch(`${API_BASE}/promotions/active`);
    const json = await parseAuthorizedJson(res);
    return Array.isArray(json?.data) ? json.data : [];
  }
  const res = await fetch(`${API_BASE}/promotions/active`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}
