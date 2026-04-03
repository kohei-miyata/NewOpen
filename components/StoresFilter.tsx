"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  currentArea: string;
  currentCategory: string;
}

export default function StoresFilter({ categories, currentArea, currentCategory }: Props) {
  const router = useRouter();
  const [area, setArea] = useState(currentArea);
  const formRef = useRef<HTMLFormElement>(null);

  function buildUrl(newArea: string, newCategory: string) {
    const params = new URLSearchParams();
    if (newArea.trim()) params.set("area", newArea.trim());
    if (newCategory) params.set("category", newCategory);
    const qs = params.toString();
    return `/stores${qs ? `?${qs}` : ""}`;
  }

  function handleCategoryClick(cat: string) {
    const next = currentCategory === cat ? "" : cat;
    router.push(buildUrl(area, next));
  }

  function handleReset() {
    setArea("");
    router.push("/stores");
  }

  return (
    <form
      ref={formRef}
      className="mb-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildUrl(area, currentCategory));
      }}
    >
      {/* エリア検索バー */}
      <div className="flex gap-2">
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
          placeholder="エリア・駅名・店名で検索 例: 渋谷"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          検索
        </button>
        {(currentArea || currentCategory) && (
          <button
            type="button"
            onClick={handleReset}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            リセット
          </button>
        )}
      </div>

      {/* カテゴリボタン */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleCategoryClick("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentCategory
              ? "bg-orange-500 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          すべて
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </form>
  );
}
