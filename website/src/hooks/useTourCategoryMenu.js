import { useEffect, useState } from 'react';
import { listCategories } from '../api/categories';
import { buildTourNavMenu, TOUR_MENU_FALLBACK } from '../config/navConfig';

export function useTourCategoryMenu() {
  const [items, setItems] = useState(TOUR_MENU_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listCategories()
      .then((list) => {
        if (!alive) return;
        setItems(buildTourNavMenu(Array.isArray(list) ? list : []));
      })
      .catch(() => {
        if (!alive) return;
        setItems(TOUR_MENU_FALLBACK);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading };
}
