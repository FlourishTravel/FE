import { adminGet, adminSend } from './adminHttp';

export async function listAdminDestinations() {
  const res = await adminGet('/admin/destinations');
  return res.content || [];
}

export async function createAdminDestination(payload) {
  return adminSend('/admin/destinations', { method: 'POST', body: payload });
}

export async function updateAdminDestination(id, payload) {
  return adminSend(`/admin/destinations/${id}`, { method: 'PUT', body: payload });
}

export async function deleteAdminDestination(id) {
  return adminSend(`/admin/destinations/${id}`, { method: 'DELETE' });
}
