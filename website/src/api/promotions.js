import { API_BASE } from './config';
import { getAccessToken } from './auth';

async function parseJson(res) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Yêu cầu thất bại');
  return json;
}

/** Mã khuyến mãi đang hiệu lực. Gửi token nếu có để kèm voucher tặng riêng. */
export async function listActivePromotions() {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/promotions/active`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}
