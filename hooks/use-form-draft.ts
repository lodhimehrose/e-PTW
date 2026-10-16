"use client";

import { useCallback, useEffect, useState } from "react";

export function useFormDraft<T>(key: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setData({ ...initial, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setHydrated(true);
  }, [key, initial]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* ignore */ }
  }, [key, data, hydrated]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setData(initial);
  }, [key, initial]);

  return { data, setData, clearDraft, hydrated };
}
