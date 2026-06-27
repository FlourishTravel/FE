import { adminGet, adminSend } from './adminHttp';

function mapPromotionRow(row) {
  if (!row || typeof row !== 'object') return row;
  const active = row.isActive !== false && row.active !== false;
  const discountPercent = row.discountType === 'percent' ? row.discountValue : row.discountPercent;
  return {
    ...row,
    title: row.title ?? row.name,
    name: row.name ?? row.title,
    active,
    isActive: active,
    discountPercent: discountPercent ?? row.discountValue ?? 0,
    startAt: row.startAt ?? row.validFrom,
    endAt: row.endAt ?? row.validTo,
    validFrom: row.validFrom ?? row.startAt,
    validTo: row.validTo ?? row.endAt,
  };
}

export async function listAdminPromotions({ page = 0, size = 100 } = {}) {
  const result = await adminGet(`/admin/promotions?page=${page}&size=${size}`, size);
  return {
    ...result,
    content: result.content.map(mapPromotionRow),
  };
}

export async function createAdminPromotion(payload) {
  return adminSend('/admin/promotions', { method: 'POST', body: payload });
}

export async function updateAdminPromotion(id, payload) {
  return adminSend(`/admin/promotions/${id}`, { method: 'PUT', body: payload });
}

export async function toggleAdminPromotionActive(id, active) {
  if (active === false) {
    return adminSend(`/admin/promotions/${id}/deactivate`, { method: 'POST' });
  }
  return adminSend(`/admin/promotions/${id}`, { method: 'PUT', body: { isActive: true } });
}
