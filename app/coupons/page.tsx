import { getCouponsWithLocation, getUsedCouponIds } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CouponsWithLocation from "@/components/CouponsWithLocation";
import PageHeader from "@/components/PageHeader";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import { CATEGORIES } from "@/lib/categories";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "クーポン一覧 | NEW OPEN" };

interface Props {
  searchParams: Promise<{ q?: string; category?: string; showUsed?: string }>;
}

export default async function CouponsPage({ searchParams }: Props) {
  const { q, category, showUsed } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [allCoupons, usedCouponIds] = await Promise.all([
    getCouponsWithLocation(),
    user ? getUsedCouponIds(user.id, supabase) : Promise.resolve(new Set<string>()),
  ]);

  // フィルタリング（サーバー側）
  const keyword = q?.trim().toLowerCase() ?? "";
  const coupons = allCoupons.filter((c) => {
    if (category && c.storeCategory !== category) return false;
    if (keyword) {
      const haystack = `${c.title} ${c.storeName} ${c.description} ${c.discount}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader title="お得なクーポン" description="新規オープン店舗限定のオープン記念クーポン一覧。期限切れ前にお早めに！" />

        {/* 検索・フィルター */}
        <form method="GET" className="mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="店舗名・クーポン名で検索"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              className="bg-orange-500 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              検索
            </button>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`/coupons?${new URLSearchParams({ ...(q ? { q } : {}), ...(showUsed ? { showUsed } : {}) }).toString()}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !category
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              すべて
            </a>
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`/coupons?${new URLSearchParams({ ...(q ? { q } : {}), category: cat, ...(showUsed ? { showUsed } : {}) }).toString()}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </form>

        {/* 件数・使用済みトグル */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {keyword || category ? (
              <>
                <span className="font-bold text-gray-800">{coupons.length}</span> 件のクーポンが見つかりました
                <a href="/coupons" className="ml-3 text-orange-500 hover:underline text-xs">フィルターをクリア</a>
              </>
            ) : (
              <><span className="font-bold text-gray-800">{coupons.length}</span> 件のクーポン</>
            )}
          </p>
          {user && (
            <a
              href={`/coupons?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(category ? { category } : {}),
                ...(showUsed !== "1" ? { showUsed: "1" } : {}),
              }).toString()}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                showUsed === "1"
                  ? "bg-gray-200 text-gray-700 border-gray-300"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              {showUsed === "1" ? "使用済みを非表示" : "使用済みを表示"}
            </a>
          )}
        </div>

        {/* 位置情報ソート付きグリッド */}
        <CouponsWithLocation
          coupons={coupons}
          usedIds={usedCouponIds}
          isLoggedIn={!!user}
          showUsed={showUsed === "1"}
        />

        <div className="mt-14">
          <RecentlyViewedSection />
        </div>
      </div>
    </div>
  );
}
