import { adminGet, adminSend } from './adminHttp';

export async function listAdminCatalogTickets({ page = 0, size = 100 } = {}) {
  return adminGet(`/admin/catalog/tickets?page=${page}&size=${size}`, size);
}

export async function createAdminCatalogTicket(payload) {
  return adminSend('/admin/catalog/tickets', { method: 'POST', body: payload });
}

export async function updateAdminCatalogTicket(id, payload) {
  return adminSend(`/admin/catalog/tickets/${id}`, { method: 'PUT', body: payload });
}

export async function deleteAdminCatalogTicket(id) {
  return adminSend(`/admin/catalog/tickets/${id}`, { method: 'DELETE' });
}
