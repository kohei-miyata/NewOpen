"use client";

import { useEffect, useState } from "react";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24時間

interface Props {
  storeId: string;
  initialViews: number;
}

export default function ViewTracker({ storeId, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `viewed_${storeId}`;
    const last = Number(localStorage.getItem(key) ?? 0);
    if (Date.now() - last < COOLDOWN_MS) return;

    localStorage.setItem(key, String(Date.now()));
    fetch(`/api/stores/${storeId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then(() => setViews((v) => v + 1))
      .catch(() => {});
  }, [storeId]);

  return <span>{views.toLocaleString()} 閲覧</span>;
}
