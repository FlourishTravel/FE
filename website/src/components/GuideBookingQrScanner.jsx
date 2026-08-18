import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBookingQr } from '../utils/bookingRef';

function codesMatch(booking, scanned) {
  const needle = String(scanned || '').trim().toLowerCase();
  if (!needle) return false;
  const code = String(booking.bookingCode || '').trim().toLowerCase();
  const id = String(booking.bookingId || '').trim().toLowerCase();
  return needle === code || needle === id || id.startsWith(needle.replace(/^ft-/, ''));
}

/**
 * HDV quét QR mã đặt chỗ (đơn cũ/mới cùng payload FT-…).
 */
const GuideBookingQrScanner = ({ open, bookings, onClose, onCheckIn }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const lastScan = useRef('');
  const [manual, setManual] = useState('');
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const applyCode = useCallback(
    async (raw) => {
      const parsed = parseBookingQr(raw);
      if (!parsed) {
        setHint('Không đọc được mã đặt chỗ trên QR.');
        return;
      }
      const booking = (bookings || []).find((b) => codesMatch(b, parsed));
      if (!booking) {
        setHint(`Không thấy ${parsed} trên chuyến này.`);
        return;
      }
      if (booking.checkedInGathering || booking.allParticipantsCheckedIn) {
        setHint(`${booking.travelerName || parsed} đã điểm danh.`);
        return;
      }
      if (!booking.travelerUserId) {
        setHint('Đơn này chưa gắn tài khoản để điểm danh.');
        return;
      }
      setBusy(true);
      setHint('');
      try {
        await onCheckIn(booking.travelerUserId);
        setHint(`Đã điểm danh ${booking.travelerName || parsed}.`);
        setManual('');
      } catch (e) {
        setHint(e?.message || 'Điểm danh thất bại.');
      } finally {
        setBusy(false);
      }
    },
    [bookings, onCheckIn],
  );

  useEffect(() => {
    if (!open) {
      stopCamera();
      setHint('');
      setManual('');
      lastScan.current = '';
      return undefined;
    }
    let cancelled = false;
    const Detector = window.BarcodeDetector;
    (async () => {
      if (!Detector || !navigator.mediaDevices?.getUserMedia) {
        setHint('Máy này chưa hỗ trợ camera QR — nhập mã FT- bên dưới.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const detector = new Detector({ formats: ['qr_code'] });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes?.[0]?.rawValue;
            if (value && value !== lastScan.current) {
              lastScan.current = value;
              await applyCode(value);
            }
          } catch {
            /* keep scanning */
          }
          if (!cancelled) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch {
        setHint('Không mở được camera — nhập mã FT- bên dưới.');
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, applyCode, stopCamera]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          width: 'min(420px, 100%)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Quét QR điểm danh</h2>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
          Quét mã FT- trên vé khách. Đơn cũ cũng dùng cùng mã này.
        </p>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', borderRadius: 12, background: '#111', maxHeight: 240, objectFit: 'cover' }}
        />
        <form
          style={{ marginTop: 12, display: 'flex', gap: 8 }}
          onSubmit={(e) => {
            e.preventDefault();
            applyCode(manual);
          }}
        >
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Hoặc nhập FT-XXXXXXXX"
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px' }}
          />
          <button type="submit" disabled={busy} style={{ border: 'none', background: '#059669', color: '#fff', borderRadius: 10, padding: '8px 12px', fontWeight: 600 }}>
            Điểm danh
          </button>
        </form>
        {hint ? <p style={{ margin: '10px 0 0', fontSize: 13, color: '#374151' }}>{hint}</p> : null}
        <button type="button" onClick={onClose} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default GuideBookingQrScanner;
