"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Store } from "@/types";

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface Props {
  stores: Store[];
  comingSoon?: Store[];
}

export default function StoreCalendar({ stores, comingSoon = [] }: Props) {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000); // JST
  const todayStr = today.toISOString().split("T")[0];

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(todayStr);

  const allStores = useMemo(() => [...stores, ...comingSoon], [stores, comingSoon]);

  const dateMap = useMemo(() => {
    const map: Record<string, Store[]> = {};
    allStores.forEach((store) => {
      if (!map[store.openDate]) map[store.openDate] = [];
      map[store.openDate].push(store);
    });
    return map;
  }, [allStores]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function formatDate(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const selectedStores = selectedDay ? (dateMap[selectedDay] ?? []) : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-lg"
        >
          ‹
        </button>
        <h3 className="font-bold text-gray-900 text-base">
          {year}年 {month + 1}月
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-lg"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const dateStr = formatDate(d);
          const stores = dateMap[dateStr] ?? [];
          const count = stores.length;
          const hasStores = count > 0;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          const isSelected = selectedDay === dateStr;
          const dayOfWeek = new Date(year, month, d).getDay();

          return (
            <button
              key={d}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              disabled={!hasStores}
              className={`relative flex flex-col items-center justify-start pt-1 pb-2 rounded-xl text-sm transition-all min-h-[44px]
                ${isSelected ? "bg-orange-500 text-white shadow-md" : ""}
                ${!isSelected && isToday ? "ring-2 ring-orange-400 ring-inset" : ""}
                ${!isSelected && hasStores ? "hover:bg-orange-50 cursor-pointer" : ""}
                ${!hasStores ? "cursor-default opacity-60" : ""}
                ${!isSelected && dayOfWeek === 0 ? "text-red-400" : ""}
                ${!isSelected && dayOfWeek === 6 ? "text-blue-400" : ""}
                ${!isSelected && dayOfWeek !== 0 && dayOfWeek !== 6 && !isToday ? "text-gray-700" : ""}
              `}
            >
              <span className="font-medium leading-none">{d}</span>
              {hasStores && (
                <span
                  className={`mt-1 text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/30 text-white"
                      : isFuture
                      ? "bg-orange-100 text-orange-500"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-orange-500" />
          オープン済み
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-orange-100 border border-orange-300" />
          まもなく
        </span>
      </div>

      {/* 選択日の店舗一覧 */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {selectedStores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">この日のオープン情報はありません</p>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {new Date(selectedDay + "T00:00:00").toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} のオープン ({selectedStores.length}件)
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedStores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/stores/${store.id}`}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-orange-50 rounded-xl px-3 py-2 transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={store.imageUrl || "/placeholder.png"}
                      alt={store.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                        {store.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {store.category} · {store.address}
                      </p>
                    </div>
                    <span className="text-gray-300 group-hover:text-orange-400 text-lg flex-shrink-0">›</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
