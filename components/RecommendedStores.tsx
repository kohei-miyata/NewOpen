"use client";

import { useEffect, useState, useCallback } from "react";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineRecommend } from "react-icons/md";

const RECENTLY_VIEWED_KEY = "newopen_recently_viewed";
const LOC_DISMISSED_KEY   = "newopen_loc_dismissed";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function daysSinceOpen(openDate: string): number {
  const open = new Date(openDate);
  const now = new Date();
  return Math.floor((now.getTime() - open.getTime()) / (1000 * 60 * 60 * 24));
}

function buildCategoryPreference(recentIds: string[], allStores: Store[]): Map<string, number> {
  const storeMap = new Map(allStores.map((s) => [s.id, s]));
  const counts: Record<string, number> = {};
  for (const id of recentIds) {
    const cat = storeMap.get(id)?.category;
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const pts = [20, 12, 6];
  const pref = new Map<string, number>();
  ranked.slice(0, 3).forEach(([cat], i) => pref.set(cat, pts[i]));
  return pref;
}

function calcScore(
  store: Store,
  maxLikes: number,
  categoryPref: Map<string, number>,
  userLat?: number,
  userLng?: number
): number {
  let score = 0;

  // 距離スコア (0-40)
  if (userLat != null && userLng != null && store.lat != null && store.lng != null) {
    const km = haversineKm(userLat, userLng, store.lat, store.lng);
    if      (km <= 1)  score += 40;
    else if (km <= 5)  score += 30;
    else if (km <= 20) score += 20;
    else if (km <= 50) score += 10;
  }

  // 鮮度スコア (0-30)
  const days = daysSinceOpen(store.openDate);
  if      (days === 0)  score += 30;
  else if (days <= 7)   score += 25;
  else if (days <= 30)  score += 20;
  else if (days <= 90)  score += 10;
  else if (days <= 365) score += 5;

  // 応援数スコア (0-20)
  if (maxLikes > 0) score += (store.likes / maxLikes) * 20;

  // 本日・今週オープンブースト (0-10)
  if      (days === 0) score += 10;
  else if (days <= 7)  score += 5;

  // 閲覧履歴カテゴリスコア (0-20)
  score += categoryPref.get(store.category) ?? 0;

  return score;
}

interface Props {
  stores: Store[];
  isLoggedIn: boolean;
  likedStoreIds: Set<string>;
  displayName?: string | null;
}

type LocationState = "prompt" | "locating" | "granted" | "denied" | "dismissed";

export default function RecommendedStores({ stores, isLoggedIn, likedStoreIds, displayName }: Props) {
  const [recommended, setRecommended] = useState<Store[]>([]);
  const [locationState, setLocationState] = useState<LocationState>("prompt");
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const buildRecommended = useCallback((userLat?: number, userLng?: number) => {
    const maxLikes = Math.max(...stores.map((s) => s.likes), 1);
    let recentIds: string[] = [];
    try { recentIds = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]"); } catch {}
    const categoryPref = buildCategoryPreference(recentIds, stores);

    const scored = stores
      .map((s) => ({ store: s, score: calcScore(s, maxLikes, categoryPref, userLat, userLng) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.store);
    setRecommended(scored);

    const hasPref = categoryPref.size > 0;
    if (userLat != null) {
      setLocationLabel(hasPref ? "現在地・閲覧履歴・新着・人気をもとにおすすめ" : "現在地・新着・人気をもとにおすすめ");
    } else {
      setLocationLabel(hasPref ? "閲覧履歴・新着・人気をもとにおすすめ" : "新着・人気をもとにおすすめ");
    }
  }, [stores]);

  // 初期表示：位置情報なしでまず描画
  useEffect(() => {
    buildRecommended();

    if (!navigator.geolocation) { setLocationState("dismissed"); return; }

    try {
      if (localStorage.getItem(LOC_DISMISSED_KEY)) { setLocationState("dismissed"); return; }
    } catch {}

    // バナーを表示（"prompt" のまま）
  }, [buildRecommended]);

  function handleAllowLocation() {
    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        buildRecommended(pos.coords.latitude, pos.coords.longitude);
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

  const title = displayName ? `${displayName}さんへのおすすめ` : "あなたへのおすすめ";

  if (recommended.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <MdOutlineRecommend className="text-orange-500" size={24} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {locationLabel && locationState !== "prompt" && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt size={10} className="text-orange-400" />
              {locationLabel}
            </p>
          )}
        </div>
      </div>

      {/* 位置情報許可バナー */}
      {locationState === "prompt" && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-sm text-orange-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500 shrink-0" size={14} />
            現在地を使うと<span className="font-bold">近くのお店を優先表示</span>できます
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {locationState === "prompt" && (
              <button
                onClick={handleAllowLocation}
                className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
              >
                許可する
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 取得中 */}
      {locationState === "locating" && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
          現在地を取得中...
        </p>
      )}

      {/* 拒否時 */}
      {locationState === "denied" && (
        <p className="text-xs text-gray-400 mb-3">
          現在地の利用が拒否されています。
          スマートフォンの場合は設定アプリ → ブラウザ → 位置情報 から「許可」に変更できます。
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isLoggedIn={isLoggedIn}
            initialLiked={likedStoreIds.has(store.id)}
          />
        ))}
      </div>
    </section>
  );
}
