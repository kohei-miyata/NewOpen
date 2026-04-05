import Link from "next/link";
import type { Metadata } from "next";
import { getStores, getRankedStores, getCoupons, getComingSoonStores, getTodayOpenStores, getUsedCouponIds } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import StoreCard from "@/components/StoreCard";
import CouponCard from "@/components/CouponCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import TopStoresSections from "@/components/TopStoresSections";
import StoreCalendar from "@/components/StoreCalendar";
import {
  CalendarDaysIcon,
  SparklesIcon,
  TicketIcon,
  HeartIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "NewOpen | あなたの街の新規オープン情報",
  description: "新規オープン店舗をいち早くチェック。レストラン・カフェ・スイーツ・美容院など、あなたの街の最新オープン情報をお届けします。",
  openGraph: {
    title: "NewOpen | あなたの街の新規オープン情報",
    description: "新規オープン店舗をいち早くチェック。あなたの街の最新オープン情報をお届けします。",
    type: "website",
  },
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [allStores, ranked, coupons, comingSoon, todayStores, usedCouponIds] = await Promise.all([
    getStores(),
    getRankedStores(10),
    getCoupons(),
    getComingSoonStores(),
    getTodayOpenStores(),
    user ? getUsedCouponIds(user.id, supabase) : Promise.resolve(new Set<string>()),
  ]);

  const topStores = ranked.slice(0, 3);
  const latestCoupons = coupons.slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
            新規オープン情報プラットフォーム
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center gap-3">
            <svg width="72" height="72" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.25"/>
              <circle cx="20" cy="20" r="17" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
              <text x="19" y="18" textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="24" fill="white">N</text>
            </svg>
            EW OPEN
          </h1>
          <p className="mt-4 text-xl sm:text-2xl opacity-90 font-medium">
            あなたの街の<span className="font-extrabold underline decoration-white/60 decoration-2">新規オープン</span>情報をいち早くお届け
          </p>
          <p className="mt-2 text-sm opacity-75">レストラン・カフェ・美容院・ジムなど、気になるお店が見つかる</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/stores"
              className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg text-sm"
            >
              お店を探す →
            </Link>
            <Link
              href="/for-owners"
              className="bg-white/20 backdrop-blur border border-white/40 text-white font-bold px-8 py-3 rounded-full hover:bg-white/30 transition-colors text-sm"
            >
              掲載を検討する
            </Link>
          </div>

          {/* 統計バー */}
          <div className="mt-12 flex justify-center gap-8 sm:gap-16 flex-wrap text-center">
            <div>
              <p className="text-3xl font-extrabold">{allStores.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">掲載店舗数</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{comingSoon.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">まもなくオープン</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{coupons.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">お得なクーポン</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* ── オープンカレンダー ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDaysIcon className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">オープンカレンダー</h2>
              <p className="text-xs text-gray-500">日付をタップしてオープン店舗を確認</p>
            </div>
          </div>
          <StoreCalendar stores={allStores} comingSoon={comingSoon} />
        </section>

        {/* ── 本日オープン ── */}
        {todayStores.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">本日オープン</h2>
                  <p className="text-xs text-gray-500">今日オープンしたばかりのお店</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}

        {/* ── まもなくオープン・最新オープン（現在地ソート） ── */}
        <TopStoresSections allStores={allStores} comingSoon={comingSoon} />

        {/* ── クーポン ── */}
        {latestCoupons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">お得なクーポン</h2>
                  <p className="text-xs text-gray-500">新規オープン記念の特別クーポン</p>
                </div>
              </div>
              <Link href="/coupons" className="text-sm text-orange-500 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} isUsed={usedCouponIds.has(coupon.id)} isLoggedIn={!!user} />
              ))}
            </div>
          </section>
        )}

        {/* ── ランキング ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartIcon className="w-6 h-6 text-orange-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">いいね！ランキング TOP3</h2>
                <p className="text-xs text-gray-500">みんなが気になっているお店</p>
              </div>
            </div>
            <Link href="/ranking" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStores.map((store, i) => (
              <StoreCard key={store.id} store={store} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* ── 最近見たお店 ── */}
        <RecentlyViewedSection />

        {/* ── オーナー向け誘導バナー ── */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-3">
            <BuildingStorefrontIcon className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-xs text-orange-400 font-bold mb-2 tracking-wide">店舗オーナー様へ</p>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">新規オープンを無料で掲載しませんか？</h2>
          <p className="text-sm text-gray-300 mb-6">SNS埋め込み・クーポン・写真ギャラリーもすべて0円</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/for-owners"
              className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-orange-50 transition-colors text-sm"
            >
              詳しく見る →
            </Link>
            <Link
              href="/auth/signup?role=owner"
              className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm"
            >
              無料登録する
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
