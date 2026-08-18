/** UUID hoặc mã đặt chỗ FT-XXXXXXXX trên hóa đơn / vé. */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BOOKING_CODE_RE = /^ft-[0-9a-f]{8}$/i;

export function isBookingRef(value) {
  const s = String(value || '').trim();
  return UUID_RE.test(s) || BOOKING_CODE_RE.test(s);
}
