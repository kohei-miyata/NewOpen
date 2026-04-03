"use client";

import { useEffect } from "react";

const KEY = "newopen_recently_viewed";
const MAX = 6;

export default function RecentlyViewedSaver({ storeId }: { storeId: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [storeId, ...ids.filter((id) => id !== storeId)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, [storeId]);

  return null;
}
