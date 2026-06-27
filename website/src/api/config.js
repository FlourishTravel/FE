/**
 * Base URL cho Backend API (FlourishTravel).
 * Set trong website/.env: VITE_API_URL=https://flourishtravel.khanhtn45.id.vn/api
 * Local: VITE_API_URL=http://localhost:8080
 * vite.config.js load .env từ thư mục website và inject vào import.meta.env.VITE_API_URL
 */
const DEFAULT_API_URL = 'https://flourishtravel.khanhtn45.id.vn/api';

/** Gộp /api/api → /api khi env cấu hình lệch. */
export function normalizeApiBase(url) {
  let base = (url || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  while (base.endsWith('/api/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

/** Origin site (bỏ suffix /api) — ghép /uploads/... */
export const ORIGIN_BASE = API_BASE.replace(/\/?api\/?$/, '') || 'https://flourishtravel.khanhtn45.id.vn';

if (import.meta.env.DEV) {
  console.info('[FlourishTravel] API_BASE =', API_BASE);
}

/**
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return `${ORIGIN_BASE}${s}`;
  return s;
}
