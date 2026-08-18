import { useCallback, useEffect, useRef, useState } from 'react';
import { getGuideSessionLiveMap } from '../api/guideTours';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_IMAGES = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.L) return Promise.resolve(window.L);

  if (!document.querySelector('link[data-leaflet]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    link.setAttribute('data-leaflet', '1');
    document.head.appendChild(link);
  }

  if (window.__leafletLoading) return window.__leafletLoading;

  window.__leafletLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', () => reject(new Error('leaflet')));
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.setAttribute('data-leaflet', '1');
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('leaflet'));
    document.head.appendChild(script);
  });

  return window.__leafletLoading;
}

function formatAgo(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  return `${hours} giờ trước`;
}

function mapsLink(lat, lon) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

/**
 * Bản đồ HDV — chỉ vẽ marker khi BE báo live (đang trong ngày tour).
 */
export default function GuideGuestLiveMap({ sessionId, styles }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    try {
      const next = await getGuideSessionLiveMap(sessionId);
      setData(next);
      setError('');
    } catch (e) {
      setError(e?.message || 'Không tải được bản đồ.');
    }
  }, [sessionId]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const intervalMs = data?.live ? 12_000 : 60_000;
  useEffect(() => {
    if (!sessionId) return undefined;
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [sessionId, intervalMs, load]);

  useEffect(() => {
    let cancelled = false;
    const live = Boolean(data?.live);
    const markers = Array.isArray(data?.markers) ? data.markers : [];

    (async () => {
      if (!live || !mapEl.current) {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          layerRef.current = null;
        }
        return;
      }
      try {
        const L = await loadLeaflet();
        if (cancelled || !mapEl.current) return;
        L.Icon.Default.imagePath = LEAFLET_IMAGES;

        if (!mapRef.current) {
          mapRef.current = L.map(mapEl.current, { scrollWheelZoom: false });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
          }).addTo(mapRef.current);
        }

        if (layerRef.current) {
          layerRef.current.clearLayers();
        } else {
          layerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        const latLngs = [];
        markers.forEach((m) => {
          if (m.latitude == null || m.longitude == null) return;
          const latlng = [m.latitude, m.longitude];
          latLngs.push(latlng);
          const color = m.stale ? '#9ca3af' : '#059669';
          L.circleMarker(latlng, {
            radius: 9,
            color,
            fillColor: color,
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindPopup(
              `<strong>${m.displayName || m.bookingCode || 'Khách'}</strong><br/>${
                m.bookingCode || ''
              }<br/>${m.stale ? 'Cũ · ' : ''}${formatAgo(m.capturedAt)}`,
            )
            .addTo(layerRef.current);
        });

        if (latLngs.length === 1) {
          mapRef.current.setView(latLngs[0], 15);
        } else if (latLngs.length > 1) {
          mapRef.current.fitBounds(latLngs, { padding: [28, 28], maxZoom: 16 });
        } else {
          mapRef.current.setView([16.0, 108.0], 5);
        }
        setTimeout(() => mapRef.current?.invalidateSize(), 80);
      } catch {
        if (!cancelled) setError('Không tải được bản đồ nền.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
    }
  }, []);

  const live = Boolean(data?.live);
  const markers = Array.isArray(data?.markers) ? data.markers : [];

  return (
    <div className={styles.locatorCard}>
      <div className={styles.locatorHeader}>
        <div className={styles.locatorTitle}>
          <span className="material-icons-round" style={{ fontSize: '18px' }}>my_location</span>
          Vị trí đoàn
          <span
            className={`${styles.onlineIndicator} ${live ? '' : styles.onlineOff}`}
            title={live ? 'Đang trong chuyến' : 'Ngoài cửa sổ chuyến đi'}
          />
        </div>
      </div>

      {error ? <p className={styles.mapHint}>{error}</p> : null}
      <p className={styles.mapHint}>{data?.message || 'Đang tải bản đồ…'}</p>

      {live ? (
        <>
          <div className={styles.mapPlaceholder}>
            <div ref={mapEl} className={styles.mapCanvas} />
          </div>
          {markers.length > 0 ? (
            <ul className={styles.markerList}>
              {markers.map((m) => (
                <li key={m.bookingId || `${m.latitude}-${m.longitude}`}>
                  <a href={mapsLink(m.latitude, m.longitude)} target="_blank" rel="noreferrer">
                    {m.displayName || m.bookingCode || 'Khách'}
                  </a>
                  <span>
                    {m.stale ? 'cũ · ' : ''}
                    {formatAgo(m.capturedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapContent}>
            <span className="material-icons-round" style={{ fontSize: '48px', color: '#d1d5db' }}>map</span>
            <p>Bản đồ realtime</p>
            <p className={styles.mapHint}>Chỉ hiện khi đoàn đang trong ngày tour.</p>
          </div>
        </div>
      )}
    </div>
  );
}
