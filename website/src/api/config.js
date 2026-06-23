/**
 * Base URL cho Backend API (FlourishTravel).
 * Set trong website/.env: VITE_API_URL=https://flourishtravel-rtdye.ondigitalocean.app/api
 * vite.config.js load .env từ thư mục website và inject vào import.meta.env.VITE_API_URL
 */
const DEFAULT_API_URL = 'https://flourishtravel-rtdye.ondigitalocean.app/api';

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

/** Origin gốc (không có /api) — dùng ghép URL ảnh tĩnh `/uploads/...`. */
export const ORIGIN_BASE = API_BASE.replace(/\/?api\/?$/, '') || 'https://flourishtravel-rtdye.ondigitalocean.app';

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
