"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AccessTracker() {
  const pathname = usePathname();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (tracked.current.has(pathname)) return;
    tracked.current.add(pathname);

    // fire-and-forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
