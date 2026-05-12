/**
 * Base URL cho Backend API (FlourishTravel).
 * Có thể set trong .env: VITE_API_URL=http://localhost:8080/api
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Origin gốc (không có /api) — dùng ghép URL ảnh tĩnh `/uploads/...`. */
export const ORIGIN_BASE = String(API_BASE).replace(/\/?api\/?$/, '') || 'http://localhost:8080';

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
