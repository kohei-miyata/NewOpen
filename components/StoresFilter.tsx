"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { Category } from "@/types";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { FaUtensils, FaCoffee, FaBeer, FaCut, FaDumbbell, FaShoppingBag } from "react-icons/fa";
import { MdCake } from "react-icons/md";
import { GiNoodles } from "react-icons/gi";
import { BsThreeDots } from "react-icons/bs";
import type { IconType } from "react-icons";

const CATEGORY_ICONS: Partial<Record<Category, IconType>> = {
  レストラン: FaUtensils,
  カフェ:     FaCoffee,
  スイーツ:   MdCake,
  居酒屋:     FaBeer,
  ラーメン:   GiNoodles,
  美容院:     FaCut,
  ジム:       FaDumbbell,
  ショップ:   FaShoppingBag,
  その他:     BsThreeDots,
};

interface Props {
  categories: Category[];
  currentArea: string;
  currentCategory: string;
  currentFilter: string;
}

export default function StoresFilter({ categories, currentArea, currentCategory, currentFilter }: Props) {
  const router = useRouter();
  const [area, setArea] = useState(currentArea);
  const formRef = useRef<HTMLFormElement>(null);

  function buildUrl(newArea: string, newCategory: string, newFilter: string) {
    const params = new URLSearchParams();
    if (newArea.trim()) params.set("area", newArea.trim());
    if (newCategory) params.set("category", newCategory);
    if (newFilter) params.set("filter", newFilter);
    const qs = params.toString();
    return `/stores${qs ? `?${qs}` : ""}`;
  }

  function handleCategoryClick(cat: string) {
    const next = currentCategory === cat ? "" : cat;
    router.push(buildUrl(area, next, currentFilter));
  }

  function handleFilterToggle() {
    const next = currentFilter === "coming_soon" ? "" : "coming_soon";
    router.push(buildUrl(area, currentCategory, next));
  }

  function handleReset() {
    setArea("");
    router.push("/stores");
  }

  const hasFilter = !!(currentArea || currentCategory || currentFilter);

  return (
    <form
      ref={formRef}
      className="mb-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildUrl(area, currentCategory, currentFilter));
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
        {hasFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            リセット
          </button>
        )}
      </div>

      {/* フィルターボタン群 */}
      <div className="flex gap-2 flex-wrap">
        {/* すべて */}
        <button
          type="button"
          onClick={() => router.push(buildUrl(area, "", currentFilter))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentCategory
              ? "bg-orange-500 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          すべて
        </button>

        {/* まもなくオープン */}
        <button
          type="button"
          onClick={handleFilterToggle}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentFilter === "coming_soon"
              ? "bg-blue-500 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500"
          }`}
        >
          <CalendarDaysIcon className="w-4 h-4 inline-block mr-1" />まもなくオープン
        </button>

        {/* カテゴリ */}
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              {Icon && <Icon size={13} />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* アクティブフィルター表示 */}
      {(currentFilter === "coming_soon" || currentCategory || currentArea) && (
        <div className="flex gap-2 flex-wrap text-xs">
          {currentFilter === "coming_soon" && (
            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full">
              まもなくオープン（30日以内）
            </span>
          )}
          {currentCategory && (
            <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
              {currentCategory}
            </span>
          )}
          {currentArea && (
            <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
              エリア: {currentArea}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
