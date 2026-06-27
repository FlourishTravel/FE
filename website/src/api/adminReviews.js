import { adminGet, adminSend } from './adminHttp';

function mapReviewRow(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    published: row.published ?? row.isPublished ?? false,
    featured: row.featured ?? row.isFeatured ?? false,
    content: row.content ?? row.comment ?? '',
    authorName: row.authorName ?? row.userName ?? row.customerName,
    tourTitle: row.tourTitle ?? row.tourName,
  };
}

export async function listAdminReviews({ page = 0, size = 100 } = {}) {
  const result = await adminGet(`/admin/reviews?page=${page}&size=${size}`, size);
  return {
    ...result,
    content: result.content.map(mapReviewRow),
  };
}

export async function publishAdminReview(id, published) {
  return updateAdminReviewModeration(id, { isPublished: published });
}

export async function featureAdminReview(id, featured) {
  return updateAdminReviewModeration(id, { isFeatured: featured });
}

export async function updateAdminReviewModeration(id, payload) {
  return adminSend(`/admin/reviews/${id}`, { method: 'PATCH', body: payload });
}
