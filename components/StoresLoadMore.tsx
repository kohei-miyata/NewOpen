"use client";

import { useState } from "react";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";

const PAGE_SIZE = 12;

export default function StoresLoadMore({ stores }: { stores: Store[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const visible = stores.slice(0, shown);
  const hasMore = shown < stores.length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-3">{visible.length} / {stores.length}件表示中</p>
          <button
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="px-8 py-3 border border-orange-300 text-orange-500 font-medium rounded-full hover:bg-orange-50 transition-colors text-sm"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
