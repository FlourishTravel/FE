import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { bookingQrPayload } from '../utils/bookingRef';

/**
 * QR mã đặt chỗ — vẽ lúc mở vé từ FT- / UUID, nên đơn cũ cũng có.
 */
const BookingQr = ({ bookingCode, bookingId, size = 200, label = 'Đưa mã này cho HDV khi check-in' }) => {
  const payload = bookingQrPayload(bookingCode, bookingId);
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!payload) {
      setSrc('');
      return undefined;
    }
    let alive = true;
    QRCode.toDataURL(payload, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#111827', light: '#ffffff' },
    })
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {
        if (alive) setSrc('');
      });
    return () => {
      alive = false;
    };
  }, [payload, size]);

  if (!payload) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      {src ? (
        <img
          src={src}
          alt={`QR ${payload}`}
          width={size}
          height={size}
          style={{ display: 'block', margin: '0 auto', background: '#fff', borderRadius: 12 }}
        />
      ) : (
        <div style={{ width: size, height: size, margin: '0 auto', background: '#f3f4f6', borderRadius: 12 }} />
      )}
      <p
        style={{
          margin: '10px 0 0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: '#047857',
        }}
      >
        {payload}
      </p>
      {label ? (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{label}</p>
      ) : null}
    </div>
  );
};

export default BookingQr;
