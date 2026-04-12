"use client";

import { useState } from "react";
import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { Store } from "@/types";

interface Props {
  stores: Store[];
  isLoggedIn: boolean;
  likedStoreIds: Set<string>;
}

export default function LikesSearchList({ stores, isLoggedIn, likedStoreIds }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? stores.filter((s) => {
        const q = query.trim().toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      })
    : stores;

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2.5 gap-2 shadow-sm">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="お店名・エリア・カテゴリで検索..."
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            クリア
          </button>
        )}
      </div>

      {/* 件数 */}
      {query && (
        <p className="text-xs text-gray-500 px-1">
          {filtered.length} 件 / {stores.length} 件中
        </p>
      )}

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">
          {query ? `「${query}」に一致するお店はありません` : "まだいいねしたお店はありません"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isLoggedIn={isLoggedIn}
              initialLiked={likedStoreIds.has(store.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
