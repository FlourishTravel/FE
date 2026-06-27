import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '../api/flora';
import { getAccessToken } from '../api/auth';

export const NOTIFICATIONS_CHANGED_EVENT = 'flourish:notifications-changed';

/** Gọi sau khi đánh dấu đọc / đọc tất cả để cập nhật badge header. */
export function notifyNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

function extractNotificationRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function isUnreadItem(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.read === true || item.isRead === true) return false;
  return true;
}

function countUnreadFromPayload(payload) {
  const rows = extractNotificationRows(payload);
  const unreadInPage = rows.filter(isUnreadItem).length;
  const page = payload?.data;
  const total = page?.totalElements;

  if (typeof total === 'number' && rows.length === 0) {
    return total;
  }
  // unread_only=true: mọi dòng trong trang đều chưa đọc → totalElements là tổng thật
  if (typeof total === 'number' && rows.length > 0 && unreadInPage === rows.length) {
    return total;
  }
  return unreadInPage;
}

/**
 * Số thông báo chưa đọc — dùng cho badge trên Navbar.
 */
export function useNotificationUnreadCount(enabled = true) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled || !getAccessToken()) {
      setCount(0);
      return;
    }
    try {
      const payload = await getNotifications({ unreadOnly: true, limit: 30 });
      setCount(countUnreadFromPayload(payload));
    } catch (e) {
      if (e?.status === 401) {
        setCount(0);
        return;
      }
      setCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    const intervalId = setInterval(refresh, 60_000);
    const onChanged = () => refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChanged);
    };
  }, [refresh]);

  return { count, refresh };
}

export default useNotificationUnreadCount;
