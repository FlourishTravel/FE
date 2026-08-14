/**
 * Base URL cho Backend API (FlourishTravel).
 * Set trong website/.env: VITE_API_URL=https://flourishtravelapp.khanhtn45.id.vn/api
 * Local: VITE_API_URL=http://localhost:8080
 * vite.config.js load .env từ thư mục website và inject vào import.meta.env.VITE_API_URL
 */
const DEFAULT_API_URL = 'https://flourishtravelapp.khanhtn45.id.vn/api';

/** Gộp /api/api → /api khi env cấu hình lệch. */
export function normalizeApiBase(url) {
  let base = (url || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  while (base.endsWith('/api/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

/** Origin site (bỏ suffix /api) — ghép /uploads/... khi BE trả path tương đối */
export const ORIGIN_BASE = API_BASE.replace(/\/?api\/?$/, '') || 'https://flourishtravelapp.khanhtn45.id.vn';

if (import.meta.env.DEV) {
  console.info('[FlourishTravel] API_BASE =', API_BASE);
}

/**
 * Đổi URL media local/dev sang API production (tránh Mixed Content khi DB còn localhost).
 * @param {string} url
 * @returns {string}
 */
function rewriteDevMediaHost(url) {
  return url
    .replace(/^http:\/\/localhost:8080(?=\/|$)/i, API_BASE)
    .replace(/^http:\/\/127\.0\.0\.1:8080(?=\/|$)/i, API_BASE);
}

/**
 * @param {string | null | undefined} url
 * @returns {string}
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  let s = String(url).trim();
  if (!s) return '';
  s = rewriteDevMediaHost(s);
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/uploads/') || s.startsWith('/api/uploads/')) {
    const path = s.startsWith('/api/') ? s.slice(4) : s;
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  }
  if (s.startsWith('/')) return `${ORIGIN_BASE}${s}`;
  return s;
}
