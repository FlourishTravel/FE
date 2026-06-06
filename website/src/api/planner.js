import { API_BASE } from './config';

async function parseJson(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/**
 * Gửi yêu cầu tạo lịch trình bằng AI.
 * @param {{
 *   destinations: string[],
 *   startDate: string,
 *   endDate: string,
 *   adults: number,
 *   children: number,
 *   budgetVnd: number,
 *   budgetPerPerson: boolean,
 *   styles: string[],
 *   experienceLevel: number,
 *   includeFlight: boolean,
 *   hotelStars: number,
 *   transport: string[]
 * }} body
 * @returns {Promise<object>}
 */
export async function generatePlannerApi(body) {
  const res = await fetch(`${API_BASE}/planner/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await parseJson(res);
  return json?.data;
}
