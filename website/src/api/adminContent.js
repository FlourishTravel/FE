import { adminGet, adminSend } from './adminHttp';

export async function listAdminContents({ type, page = 0, size = 100 } = {}) {
  const search = new URLSearchParams();
  if (type && type !== 'all') search.set('type', type);
  search.set('page', String(page));
  search.set('size', String(size));
  return adminGet(`/admin/content?${search.toString()}`, size);
}

export async function createAdminContent(payload) {
  return adminSend('/admin/content', { method: 'POST', body: payload });
}

export async function updateAdminContent(id, payload) {
  return adminSend(`/admin/content/${id}`, { method: 'PUT', body: payload });
}

export async function deleteAdminContent(id) {
  return adminSend(`/admin/content/${id}`, { method: 'DELETE' });
}
