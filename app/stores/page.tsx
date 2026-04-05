import type { Metadata } from "next";
import { getStores, getComingSoonStores } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import StoresFilter from "@/components/StoresFilter";
import StoresWithLocation from "@/components/StoresWithLocation";
import StoresLoadMore from "@/components/StoresLoadMore";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "新規オープン一覧",
  description: "全国の新規オープン店舗一覧。エリア・カテゴリ別に絞り込んで最新のお店情報を探せます。",
};

const CATEGORIES: Category[] = [
  "レストラン","カフェ","スイーツ","居酒屋","ラーメン","美容院","ジム","ショップ","その他",
];

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; category?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const areaQuery = sp.area?.trim() ?? "";
  const categoryFilter = sp.category ?? "";
  const filterParam = sp.filter ?? "";

  const [normalStores, comingSoonStores] = await Promise.all([
    filterParam === "coming_soon" ? Promise.resolve([]) : getStores(),
    filterParam === "coming_soon" ? getComingSoonStores() : Promise.resolve([]),
  ]);

  let stores = filterParam === "coming_soon" ? comingSoonStores : normalStores;

  if (areaQuery) {
    const q = areaQuery.toLowerCase();
    stores = stores.filter((s) =>
      s.address.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  if (categoryFilter) {
    stores = stores.filter((s) => s.category === categoryFilter);
  }

  const title = filterParam === "coming_soon" ? "まもなくオープン" : "新規オープン一覧";
  const useLocation = !areaQuery && !categoryFilter && filterParam !== "coming_soon";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader
          title={title}
          description={`${stores.length}件のお店`}
        />

        <StoresFilter
          categories={CATEGORIES}
          currentArea={areaQuery}
          currentCategory={categoryFilter}
          currentFilter={filterParam}
        />

        {stores.length === 0 ? (
          <p className="text-gray-500 text-sm py-12 text-center">該当するお店が見つかりませんでした</p>
        ) : useLocation ? (
          <StoresWithLocation stores={stores} />
        ) : (
          <StoresLoadMore stores={stores} />
        )}

        <div className="mt-14">
          <RecentlyViewedSection />
        </div>
      </div>
    </div>
  );
}
