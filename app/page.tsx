import Link from "next/link";
import type { Metadata } from "next";
import { getStores, getRankedStores, getCoupons, getComingSoonStores, getTodayOpenStores, getThisWeekOpenStores, getUsedCouponIds, getUserLikedStoreIds } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import StoreCard from "@/components/StoreCard";
import CouponCard from "@/components/CouponCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import TopStoresSections from "@/components/TopStoresSections";
import StoreCalendar from "@/components/StoreCalendar";
import CategoryShortcuts from "@/components/CategoryShortcuts";
import AreaLinks from "@/components/AreaLinks";
import AreaRanking from "@/components/AreaRanking";
import HeroSearch from "@/components/HeroSearch";
import RecommendedStores from "@/components/RecommendedStores";
import type { Category } from "@/types";
import { FaCalendarAlt, FaCalendarCheck, FaTicketAlt, FaHeart, FaStore, FaTags, FaTrophy } from "react-icons/fa";
import { MdOutlineNewReleases, MdOutlineLocationOn } from "react-icons/md";

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
  const role = (user?.user_metadata?.role as string) ?? null;
  const isGeneral = user && role !== "owner" && role !== "admin";

  const [allStores, ranked, coupons, comingSoon, todayStores, thisWeekStores, usedCouponIds, likedStoreIds] = await Promise.all([
    getStores(),
    getRankedStores(10),
    getCoupons(),
    getComingSoonStores(),
    getTodayOpenStores(),
    getThisWeekOpenStores(),
    user ? getUsedCouponIds(user.id, supabase) : Promise.resolve(new Set<string>()),
    user ? getUserLikedStoreIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  const topStores = ranked.slice(0, 3);
  const latestCoupons = coupons.slice(0, 3);

  // 今週オープン予定 / まもなくオープン / 最新オープン を件数の多い順に並べる
  // TopStoresSections（まもなく＋最新）は内部順序を prop で制御
  const geoInnerOrder: Array<"coming_soon" | "latest"> =
    comingSoon.length >= allStores.length
      ? ["coming_soon", "latest"]
      : ["latest", "coming_soon"];

  // 今週オープン予定と「まもなく+最新のブロック」のどちらを先に出すか
  // ブロックの代表値 = まもなく・最新の大きい方
  const geoBlockCount = Math.max(comingSoon.length, allStores.length);
  const thisWeekFirst = thisWeekStores.length > geoBlockCount;

  // カテゴリ別件数
  const categoryCounts = allStores.reduce<Partial<Record<Category, number>>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  // エリア別件数（都道府県抽出）
  const prefMap: Record<string, number> = {};
  for (const s of allStores) {
    const m = s.address.match(/^(.+?[都道府県])/);
    if (m) prefMap[m[1]] = (prefMap[m[1]] ?? 0) + 1;
  }
  const topAreas = Object.entries(prefMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([prefecture, count]) => ({ prefecture, count }));

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10">
          {/* ブランド行 */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.25"/>
                <circle cx="20" cy="20" r="17" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                <text x="19" y="18" textAnchor="middle" dominantBaseline="central" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="24" fill="white">N</text>
              </svg>
              EW OPEN
            </h1>
            <span className="hidden sm:block text-sm opacity-80 font-medium border-l border-white/40 pl-3">
              あなたの街の新規オープン情報
            </span>
          </div>

          {/* 検索バー ＋ クイックカテゴリ */}
          <HeroSearch />

          {/* 統計バー */}
          <div className="mt-6 flex justify-center gap-6 sm:gap-12 flex-wrap text-center">
            <div>
              <p className="text-xl font-extrabold">{allStores.length}+</p>
              <p className="text-[11px] opacity-75 mt-0.5">掲載店舗</p>
            </div>
            <div>
              <p className="text-xl font-extrabold">{comingSoon.length}+</p>
              <p className="text-[11px] opacity-75 mt-0.5">まもなくオープン</p>
            </div>
            <div>
              <p className="text-xl font-extrabold">{coupons.length}+</p>
              <p className="text-[11px] opacity-75 mt-0.5">クーポン</p>
            </div>
            <Link
              href="/for-owners"
              className="hidden sm:flex items-center gap-1 bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-white/30 transition-colors self-center"
            >
              掲載を検討する →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* ── あなたへのおすすめ ── */}
        <RecommendedStores
          stores={allStores}
          isLoggedIn={!!user}
          likedStoreIds={likedStoreIds}
          displayName={(user?.user_metadata?.display_name as string) ?? null}
        />

        {/* ── 本日オープン ── */}
        {todayStores.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdOutlineNewReleases className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">本日オープン</h2>
                  <p className="text-xs text-gray-500">今日オープンしたばかりのお店</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayStores.map((store) => (
                <StoreCard key={store.id} store={store} isLoggedIn={!!user} initialLiked={likedStoreIds.has(store.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── 今週オープン予定 / まもなくオープン / 最新オープン（件数順） ── */}
        {(() => {
          const thisWeekSection = thisWeekStores.length > 0 ? (
            <section key="thisWeek">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarCheck className="text-orange-500" size={22} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">今週オープン予定</h2>
                    <p className="text-xs text-gray-500">今週中にオープンするお店</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {thisWeekStores.map((store) => (
                  <StoreCard key={store.id} store={store} isLoggedIn={!!user} initialLiked={likedStoreIds.has(store.id)} />
                ))}
              </div>
            </section>
          ) : null;

          const geoSection = (
            <TopStoresSections
              key="geo"
              allStores={allStores}
              comingSoon={comingSoon}
              innerOrder={geoInnerOrder}
              isLoggedIn={!!user}
              likedStoreIds={likedStoreIds}
            />
          );

          return thisWeekFirst
            ? <>{thisWeekSection}{geoSection}</>
            : <>{geoSection}{thisWeekSection}</>;
        })()}

        {/* ── オープンカレンダー ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-orange-500" size={22} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">オープンカレンダー</h2>
              <p className="text-xs text-gray-500">日付をタップしてオープン店舗を確認</p>
            </div>
          </div>
          <StoreCalendar stores={allStores} comingSoon={comingSoon} />
        </section>

        {/* ── カテゴリショートカット ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FaTags className="text-orange-500" size={22} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">カテゴリから探す</h2>
              <p className="text-xs text-gray-500">気になるジャンルのお店をチェック</p>
            </div>
          </div>
          <CategoryShortcuts counts={categoryCounts} />
        </section>

        {/* ── エリア絞り込み ── */}
        {topAreas.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MdOutlineLocationOn className="text-orange-500" size={24} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">エリアから探す</h2>
                <p className="text-xs text-gray-500">都道府県別の新規オープン店舗</p>
              </div>
            </div>
            <AreaLinks areas={topAreas} />
          </section>
        )}

        {/* ── クーポン ── */}
        {latestCoupons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-orange-500" size={22} />
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
              <FaHeart className="text-orange-500" size={22} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">全国応援ランキング TOP3</h2>
                <p className="text-xs text-gray-500">いいねで開店を応援しよう！</p>
              </div>
            </div>
            <Link href="/ranking" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStores.map((store, i) => (
              <StoreCard key={store.id} store={store} rank={i + 1} isLoggedIn={!!user} initialLiked={likedStoreIds.has(store.id)} />
            ))}
          </div>
        </section>

        {/* ── エリア別ランキング ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-orange-500" size={22} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">エリア別ランキング</h2>
                <p className="text-xs text-gray-500">地域ごとの人気店をチェック</p>
              </div>
            </div>
          </div>
          <AreaRanking stores={allStores} />
        </section>

        {/* ── 最近見たお店 ── */}
        <RecentlyViewedSection />

        {/* ── オーナー向け誘導バナー（一般ユーザーには非表示） ── */}
        {!isGeneral && <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-3">
            <FaStore className="text-orange-400" size={28} />
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
        </section>}

      </div>
    </div>
  );
}
