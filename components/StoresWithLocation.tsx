"use client";

import { useEffect, useState, useCallback } from "react";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";
import { FaMapMarkerAlt } from "react-icons/fa";

const LOC_DISMISSED_KEY = "newopen_loc_dismissed";
const LOC_GRANTED_KEY = "newopen_loc_granted";

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

type LocationState = "prompt" | "locating" | "granted" | "denied" | "dismissed";

export default function StoresWithLocation({ stores }: Props) {
  const [sorted, setSorted] = useState<Store[]>(stores);
  const [locationState, setLocationState] = useState<LocationState>("prompt");
  const [shown, setShown] = useState(PAGE_SIZE);

  const sortByLocation = useCallback((lat: number, lng: number) => {
    setSorted([...stores].sort((a, b) => {
      const dA = a.lat != null && a.lng != null ? haversineKm(lat, lng, a.lat, a.lng) : Infinity;
      const dB = b.lat != null && b.lng != null ? haversineKm(lat, lng, b.lat, b.lng) : Infinity;
      return dA - dB;
    }));
  }, [stores]);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationState("dismissed"); return; }

    try {
      if (localStorage.getItem(LOC_DISMISSED_KEY)) { setLocationState("dismissed"); return; }
      // 以前に許可済みなら自動取得（バナー非表示）
      if (localStorage.getItem(LOC_GRANTED_KEY)) {
        setLocationState("locating");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            sortByLocation(pos.coords.latitude, pos.coords.longitude);
            setLocationState("granted");
          },
          () => {
            // 取得失敗（権限が剥奪された等）→ バナーを再表示
            localStorage.removeItem(LOC_GRANTED_KEY);
            setLocationState("prompt");
          },
          { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
        );
        return;
      }
    } catch {}
    // バナーを表示（"prompt" のまま）
  }, [sortByLocation]);

  function handleAllow() {
    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try { localStorage.setItem(LOC_GRANTED_KEY, "1"); } catch {}
        sortByLocation(pos.coords.latitude, pos.coords.longitude);
        setLocationState("granted");
      },
      (err) => {
        setLocationState(err.code === err.PERMISSION_DENIED ? "denied" : "dismissed");
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  }

  function handleDismiss() {
    try { localStorage.setItem(LOC_DISMISSED_KEY, "1"); } catch {}
    setLocationState("dismissed");
  }

  const visible = sorted.slice(0, shown);
  const hasMore = shown < sorted.length;

  return (
    <div>
      {/* 位置情報許可バナー */}
      {locationState === "prompt" && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-sm text-orange-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500 shrink-0" size={14} />
            現在地を使うと<span className="font-bold">近くのお店を優先表示</span>できます
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAllow}
              className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
            >
              許可する
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {locationState === "locating" && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
          現在地を取得中...
        </p>
      )}
      {locationState === "granted" && (
        <p className="text-xs text-orange-500 mb-3 flex items-center gap-1">
          <FaMapMarkerAlt size={10} />
          現在地に近い順に表示しています
        </p>
      )}
      {locationState === "denied" && (
        <p className="text-xs text-gray-400 mb-3">
          現在地の利用が拒否されています。
          スマートフォンの場合は設定アプリ → プライバシー → 位置情報 から「許可」に変更できます。
        </p>
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
