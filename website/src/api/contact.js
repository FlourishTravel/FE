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
  const res = await fetch(`${API_BASE}/contact-requests/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}

/** Gửi form liên hệ / hỗ trợ (Help, Footer). */
export async function submitContact(form) {
  const payload = {
    name: (form.name || form.fullName || '').trim(),
    email: (form.email || '').trim(),
    phone: form.phone?.trim() || null,
    message: (form.message || '').trim(),
    tourId: form.tourId || null,
  };
  const res = await fetch(`${API_BASE}/contact-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(res);
  return json?.data || json;
}
