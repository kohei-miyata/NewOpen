"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface StoreRow {
  id: string;
  name: string;
  category: string;
  address: string;
  views: number;
  likes: number;
  open_date: string;
}

type SortKey = "name" | "likes" | "views" | "open_date";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300 ml-0.5">↕</span>;
  return <span className="text-orange-500 ml-0.5">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function AdminStoreTable({ stores }: { stores: StoreRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("likes");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  }, [stores, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const v = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name, "ja") * v;
      if (sortKey === "likes") return (a.likes - b.likes) * v;
      if (sortKey === "views") return (a.views - b.views) * v;
      if (sortKey === "open_date") return a.open_date.localeCompare(b.open_date) * v;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNums = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(
    (p) => p <= totalPages
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="店舗名・カテゴリ・エリアで検索..."
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
        />
        <span className="text-xs text-gray-400">{sorted.length}件</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                onClick={() => handleSort("name")}
              >
                店舗名 <SortArrow active={sortKey === "name"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">カテゴリ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">エリア</th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                onClick={() => handleSort("likes")}
              >
                いいね <SortArrow active={sortKey === "likes"} dir={sortDir} />
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                onClick={() => handleSort("views")}
              >
                閲覧数 <SortArrow active={sortKey === "views"} dir={sortDir} />
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
                onClick={() => handleSort("open_date")}
              >
                オープン日 <SortArrow active={sortKey === "open_date"} dir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  該当する店舗が見つかりませんでした
                </td>
              </tr>
            ) : (
              paged.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/stores/${s.id}`}
                      className="font-medium text-gray-900 hover:text-orange-500 transition-colors"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.category}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[8rem] truncate">{s.address}</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">{s.likes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-500">{s.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{s.open_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-xs text-gray-500">
            {sorted.length}件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, sorted.length)}件
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-orange-300 transition-colors"
            >
              ← 前へ
            </button>
            {pageNums.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  p === page
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-orange-300 transition-colors"
            >
              次へ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
