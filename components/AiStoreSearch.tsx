"use client";

import { useState } from "react";
import type { Store } from "@/types";
import StoreCard from "@/components/StoreCard";
import { SparklesIcon } from "@heroicons/react/24/outline";

const SUGGESTIONS = [
  "一人でも入りやすいカフェ",
  "テラス席のあるランチ",
  "個室がある美容院",
  "テイクアウトできるお店",
];

interface Props {
  allStores: Store[];
  isLoggedIn: boolean;
  likedStoreIds: Set<string>;
}

export default function AiStoreSearch({ allStores, isLoggedIn, likedStoreIds }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Store[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { ids }: { ids: string[] } = await res.json();
      const matched = ids
        .map((id) => allStores.find((s) => s.id === id))
        .filter((s): s is Store => !!s);
      setResults(matched);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-10 hidden">
      {/* 入力 */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">AI でお店を探す</span>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); search(query); }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: 一人でも入りやすいカフェ / 子連れOKのランチ"
            className="flex-1 border border-orange-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                検索中
              </span>
            ) : "探す"}
          </button>
        </form>

        {/* サジェスト */}
        {results === null && !loading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => search(s)}
                className="text-xs bg-white border border-orange-200 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 結果 */}
      {loading && (
        <div className="mt-6 text-center text-sm text-gray-400">
          <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-orange-400 rounded-full animate-spin mr-2 align-middle" />
          AIがお店を探しています...
        </div>
      )}

      {results !== null && !loading && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            「{query}」の検索結果 —{" "}
            {results.length > 0 ? `${results.length} 件` : "該当するお店が見つかりませんでした"}
          </p>
          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isLoggedIn={isLoggedIn}
                  initialLiked={likedStoreIds.has(store.id)}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => { setResults(null); setQuery(""); }}
            className="mt-4 text-xs text-orange-500 hover:underline"
          >
            ← 検索をリセット
          </button>
        </div>
      )}
    </div>
  );
}
