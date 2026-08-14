import React, { useEffect, useState } from 'react';
import { listSiteContent } from '../api/content';
import { resolveMediaUrl } from '../api/config';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

function mapRow(row) {
  return {
    id: row.id || row.slug,
    slug: row.slug,
    title: row.title,
    excerpt: row.summary || '',
    body: row.body || '',
    image: resolveMediaUrl(row.imageUrl) || FALLBACK_IMAGE,
    date: formatDate(row.publishedAt || row.createdAt),
    category: row.category || '',
  };
}

/**
 * @param {'news'|'story'|'career'|'help'|'guide'} type
 * @param {Array} staticFallback chỉ dùng khi API lỗi
 */
export function useSiteContent(type, staticFallback = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const rows = await listSiteContent(type);
        if (!alive) return;
        setApiOk(true);
        setItems(Array.isArray(rows) ? rows.map(mapRow) : []);
      } catch {
        if (alive) {
          setApiOk(false);
          setItems(staticFallback);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type]);

  return { items, loading, apiOk };
}

export default useSiteContent;
