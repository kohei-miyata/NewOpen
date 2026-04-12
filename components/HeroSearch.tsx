"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { FaUtensils, FaCoffee, FaCut, FaDumbbell, FaShoppingBag } from "react-icons/fa";
import { MdCake } from "react-icons/md";
import type { IconType } from "react-icons";

const QUICK_CATEGORIES: { label: string; icon: IconType }[] = [
  { label: "レストラン", icon: FaUtensils },
  { label: "カフェ",     icon: FaCoffee },
  { label: "スイーツ",   icon: MdCake },
  { label: "美容院",     icon: FaCut },
  { label: "ジム",       icon: FaDumbbell },
  { label: "ショップ",   icon: FaShoppingBag },
];

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/stores?area=${encodeURIComponent(q)}`);
    } else {
      router.push("/stores");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* 検索バー */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center bg-white rounded-full px-4 py-3 shadow-lg gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="お店名・エリア・住所で検索..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-white text-orange-500 font-bold px-5 py-3 rounded-full shadow-lg hover:bg-orange-50 transition-colors text-sm shrink-0"
        >
          検索
        </button>
      </form>

      {/* クイックカテゴリ */}
      <div className="flex gap-2 justify-center flex-wrap">
        {QUICK_CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => router.push(`/stores?category=${encodeURIComponent(label)}`)}
            className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => router.push("/stores")}
          className="inline-flex items-center gap-1 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
        >
          すべて見る
          <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
