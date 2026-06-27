import { adminGet, adminSend } from './adminHttp';

export async function listAdminContactRequests({ status, page = 0, size = 100 } = {}) {
  const search = new URLSearchParams();
  if (status && status !== 'all') search.set('status', status);
  search.set('page', String(page));
  search.set('size', String(size));
  return adminGet(`/admin/contact-requests?${search.toString()}`, size);
}

export async function updateAdminContactRequest(id, payload) {
  return adminSend(`/admin/contact-requests/${id}`, { method: 'PATCH', body: payload });
}
