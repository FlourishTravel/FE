import { useCallback, useMemo, useState } from 'react';
import { createDefaultFilters } from './tourFilterConfig';
import { buildFilterChips, countActiveFilters } from './tourFilterUtils';

export function useTourFilters(initialSearch = '', categories = []) {
  const [draft, setDraft] = useState(() => createDefaultFilters(initialSearch));
  const [applied, setApplied] = useState(() => createDefaultFilters(initialSearch));

  const patchDraft = useCallback((patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const apply = useCallback(() => {
    setApplied({ ...draft });
  }, [draft]);

  const reset = useCallback(() => {
    const defaults = createDefaultFilters();
    setDraft(defaults);
    setApplied(defaults);
  }, []);

  const removeFromApplied = useCallback((patch) => {
    setApplied((prev) => {
      const next = { ...prev, ...patch };
      setDraft(next);
      return next;
    });
  }, []);

  const activeCount = useMemo(() => countActiveFilters(applied), [applied]);
  const draftCount = useMemo(() => countActiveFilters(draft), [draft]);

  const chips = useMemo(
    () => buildFilterChips(applied, removeFromApplied, categories),
    [applied, removeFromApplied, categories],
  );

  const syncFilters = useCallback((patch) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      setApplied(next);
      return next;
    });
  }, []);

  return {
    draft,
    applied,
    patchDraft,
    apply,
    reset,
    syncFilters,
    activeCount,
    draftCount,
    chips,
  };
}
