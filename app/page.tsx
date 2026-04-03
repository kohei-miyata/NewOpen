import Link from "next/link";
import { getStores, getRankedStores, getCoupons, getComingSoonStores } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import CouponCard from "@/components/CouponCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";

export default async function Home() {
  const [allStores, ranked, coupons, comingSoon] = await Promise.all([
    getStores(),
    getRankedStores(),
    getCoupons(),
    getComingSoonStores(),
  ]);

  const recentStores = allStores.slice(0, 4);
  const topStores = ranked.slice(0, 3);
  const latestCoupons = coupons.slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-400 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">NewOpen</h1>
          <p className="mt-3 text-lg opacity-90">あなたの街の新規オープン情報をいち早くお届け</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link
              href="/stores"
              className="bg-white text-orange-500 font-bold px-6 py-2.5 rounded-full hover:bg-orange-50 transition-colors text-sm"
            >
              新規オープン一覧
            </Link>
            <Link
              href="/coupons"
              className="bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-700 transition-colors text-sm"
            >
              クーポンを見る
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* 最近見たお店 */}
        <RecentlyViewedSection />

        {/* まもなくオープン */}
        {comingSoon.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">まもなくオープン</h2>
              <Link href="/stores?filter=coming_soon" className="text-sm text-orange-500 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comingSoon.slice(0, 4).map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}

        {/* 最新オープン */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">最新オープン</h2>
            <Link href="/stores" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>

        {/* ランキング */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">いいね！ランキング TOP3</h2>
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

        {/* クーポン */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">お得なクーポン</h2>
            <Link href="/coupons" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
