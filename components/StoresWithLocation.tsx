"use client";

import { useEffect, useState } from "react";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PAGE_SIZE = 12;

interface Props {
  stores: Store[];
}

export default function StoresWithLocation({ stores }: Props) {
  const [sorted, setSorted] = useState<Store[]>(stores);
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const s = [...stores].sort((a, b) => {
          const dA = a.lat != null && a.lng != null
            ? haversineKm(latitude, longitude, a.lat, a.lng) : Infinity;
          const dB = b.lat != null && b.lng != null
            ? haversineKm(latitude, longitude, b.lat, b.lng) : Infinity;
          return dA - dB;
        });
        setSorted(s);
        setGranted(true);
        setLocating(false);
      },
      () => {
        setError("位置情報を取得できませんでした。デフォルト順で表示します。");
        setLocating(false);
      },
      { timeout: 5000 }
    );
  }, [stores]);

  const visible = sorted.slice(0, shown);
  const hasMore = shown < sorted.length;

  return (
    <div>
      {locating && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
          現在地を取得中...
        </p>
      )}
      {granted && (
        <p className="text-xs text-orange-500 mb-3">現在地に近い順に表示しています</p>
      )}
      {error && (
        <p className="text-xs text-gray-400 mb-3">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-3">{visible.length} / {sorted.length}件表示中</p>
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
