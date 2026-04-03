"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  storeId: string;
  initialViews: number;
}

export default function ViewTracker({ storeId, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    fetch(`/api/stores/${storeId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then(() => setViews((v) => v + 1))
      .catch(() => {});
  }, [storeId]);

  return <span>{views.toLocaleString()} 閲覧</span>;
}
