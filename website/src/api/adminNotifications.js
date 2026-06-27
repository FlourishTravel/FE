import { adminGet, adminSend } from './adminHttp';

export async function broadcastAdminNotification(payload) {
  return adminSend('/admin/notifications/broadcast', {
    method: 'POST',
    body: {
      title: payload.title,
      body: payload.body ?? payload.message,
      type: payload.type || 'general',
      targetRole: payload.targetRole ?? mapAudience(payload.audience),
    },
  });
}

function mapAudience(audience) {
  switch (audience) {
    case 'ALL_USERS':
      return 'ALL';
    case 'TRAVELERS':
      return 'TRAVELER';
    case 'GUIDES':
      return 'TOUR_GUIDE';
    case 'ADMINS':
      return 'ADMIN';
    default:
      return 'TRAVELER';
  }
}

function mapNotificationRow(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    message: row.message ?? row.body,
    audience: row.audience ?? row.recipientEmail ?? '—',
    channel: row.channel ?? 'IN_APP',
    status: row.status ?? 'SENT',
  };
}

export async function listAdminNotifications({ page = 0, size = 30 } = {}) {
  const result = await adminGet(`/admin/notifications?page=${page}&size=${size}`, size);
  return {
    ...result,
    content: result.content.map(mapNotificationRow),
  };
}
