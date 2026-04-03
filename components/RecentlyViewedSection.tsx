"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Store } from "@/types";

const KEY = "newopen_recently_viewed";

export default function RecentlyViewedSection() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (!ids.length) return;

      fetch(`/api/stores/recent?ids=${ids.join(",")}`)
        .then((r) => r.json())
        .then((data: Store[]) => {
          // localStorage の順序を保持
          const sorted = ids
            .map((id) => data.find((s) => s.id === id))
            .filter(Boolean) as Store[];
          setStores(sorted);
        })
        .catch(() => {});
    } catch {}
  }, []);

  if (!stores.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">最近見たお店</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=60"}
              alt={store.name}
              className="w-full h-24 object-cover"
            />
            <div className="p-2">
              <span className="text-xs text-orange-500 font-medium">{store.category}</span>
              <p className="text-xs font-bold text-gray-900 mt-0.5 line-clamp-2">{store.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
