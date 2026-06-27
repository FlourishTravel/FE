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

/**
 * @param {'news'|'story'|'career'|'help'} type
 * @param {Array} staticFallback
 */
export function useSiteContent(type, staticFallback = []) {
  const [items, setItems] = useState(staticFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await listSiteContent(type);
        if (!alive) return;
        if (rows.length > 0) {
          setItems(rows.map((row) => ({
            id: row.id || row.slug,
            slug: row.slug,
            title: row.title,
            excerpt: row.summary || '',
            body: row.body || '',
            image: resolveMediaUrl(row.imageUrl) || FALLBACK_IMAGE,
            date: formatDate(row.publishedAt || row.createdAt),
            category: row.category || '',
          })));
        } else {
          setItems(staticFallback);
        }
      } catch {
        if (alive) setItems(staticFallback);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [type]);

  return { items, loading };
}

export default useSiteContent;
