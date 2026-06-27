import { API_BASE } from './config';

async function parseJsonSafe(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error((json && json.message) || 'Không gửi được biểu mẫu. Vui lòng thử lại.');
  }
  return json;
}

export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE}/contact/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}

export async function submitContact(form) {
  const res = await fetch(`${API_BASE}/contact/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}
