"use client";

import { useEffect, useState } from "react";
import CouponCard from "@/components/CouponCard";
import type { CouponWithLocation } from "@/lib/db";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  coupons: CouponWithLocation[];
  usedIds: Set<string>;
  isLoggedIn: boolean;
}

export default function CouponsWithLocation({ coupons, usedIds, isLoggedIn }: Props) {
  const [sorted, setSorted] = useState<CouponWithLocation[]>(coupons);
  const [locating, setLocating] = useState(false);
  const [granted, setGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const s = [...coupons].sort((a, b) => {
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
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? "denied" : "failed");
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
    );
  }, [coupons]);

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
      {error === "denied" && (
        <p className="text-xs text-gray-400 mb-3">
          現在地の利用が拒否されています。アドレスバー横のアイコンから位置情報を「許可」に変更してください。
        </p>
      )}
      {error === "failed" && (
        <p className="text-xs text-gray-400 mb-3">位置情報を取得できませんでした。デフォルト順で表示します。</p>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">該当するクーポンが見つかりませんでした</p>
          <a href="/coupons" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
            すべてのクーポンを見る →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} isUsed={usedIds.has(coupon.id)} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
