"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";
import { MapPinIcon, SparklesIcon, ClockIcon } from "@heroicons/react/24/outline";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortByDistance(stores: Store[], lat: number, lng: number): Store[] {
  return [...stores].sort((a, b) => {
    const dA = a.lat != null && a.lng != null ? haversineKm(lat, lng, a.lat, a.lng) : Infinity;
    const dB = b.lat != null && b.lng != null ? haversineKm(lat, lng, b.lat, b.lng) : Infinity;
    return dA - dB;
  });
}

interface Props {
  allStores: Store[];
  comingSoon: Store[];
}

export default function TopStoresSections({ allStores, comingSoon }: Props) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGranted(true);
      },
      () => {},
      { timeout: 6000 }
    );
  }, []);

  const recentSorted = userPos ? sortByDistance(allStores, userPos.lat, userPos.lng).slice(0, 4) : allStores.slice(0, 4);
  const comingSoonSorted = userPos ? sortByDistance(comingSoon, userPos.lat, userPos.lng).slice(0, 4) : comingSoon.slice(0, 4);

  return (
    <>
      {/* まもなくオープン */}
      {comingSoon.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-500" />まもなくオープン
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {granted ? <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />現在地に近い順</span> : "30日以内にオープン予定のお店"}
              </p>
            </div>
            <Link href="/stores?filter=coming_soon" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonSorted.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* 最新オープン */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-orange-500" />最新オープン
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {granted ? <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />現在地に近い順</span> : "新しくオープンしたお店をチェック"}
            </p>
          </div>
          <Link href="/stores" className="text-sm text-orange-500 hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentSorted.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>
    </>
  );
}
