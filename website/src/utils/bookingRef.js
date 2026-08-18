/** UUID hoặc mã đặt chỗ FT-XXXXXXXX trên hóa đơn / vé. */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BOOKING_CODE_RE = /^ft-[0-9a-f]{8}$/i;

export function isBookingRef(value) {
  const s = String(value || '').trim();
  return UUID_RE.test(s) || BOOKING_CODE_RE.test(s);
}

/** Payload QR trên vé: cùng mã FT- với đơn cũ và đơn mới. */
export function bookingQrPayload(bookingCode, bookingId) {
  const code = String(bookingCode || '').trim();
  if (BOOKING_CODE_RE.test(code)) return code.toUpperCase();
  const id = String(bookingId || '').trim();
  if (UUID_RE.test(id)) return `FT-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  return '';
}

/** Đọc mã từ QR (FT-…, UUID, hoặc URL chứa mã). */
export function parseBookingQr(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  const codeMatch = s.match(/ft-[0-9a-f]{8}/i);
  if (codeMatch) return codeMatch[0].toUpperCase();
  const uuidMatch = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) return uuidMatch[0];
  return isBookingRef(s) ? s : null;
}
