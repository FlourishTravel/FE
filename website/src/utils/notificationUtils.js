export function normalizeNotifications(payload) {
    const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data?.content)
            ? payload.data.content
            : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.content)
                    ? payload.content
                    : [];
    return rows.map((item, index) => ({
        id: item.id || `notification-${index}`,
        title: item.title || 'Thông báo',
        message: item.message || item.body || '',
        read: Boolean(item.read || item.isRead),
        createdAt: item.createdAt || item.created_at || '',
        type: item.type || item.category || '',
    }));
}

export function formatNotificationTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}
