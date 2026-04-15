import type { Metadata } from "next";
import Link from "next/link";
import { getStores, getComingSoonStores, getRankedStores } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import StoresFilter from "@/components/StoresFilter";
import StoresWithLocation from "@/components/StoresWithLocation";
import StoresLoadMore from "@/components/StoresLoadMore";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import StoreCard from "@/components/StoreCard";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "新規オープン一覧",
  description: "全国の新規オープン店舗一覧。エリア・カテゴリ別に絞り込んで最新のお店情報を探せます。",
};



export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; category?: string; filter?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const areaQuery = sp.area?.trim() ?? "";
  const categoryFilter = sp.category ?? "";
  const filterParam = sp.filter ?? "";
  const tagFilter = sp.tag?.trim() ?? "";

  const [normalStores, comingSoonStores] = await Promise.all([
    getStores(),
    filterParam === "coming_soon" ? getComingSoonStores() : Promise.resolve([]),
  ]);

  const hasFilter = !!(areaQuery || categoryFilter || tagFilter || filterParam);

  let stores = filterParam === "coming_soon" ? comingSoonStores : normalStores;

  if (areaQuery) {
    const q = areaQuery.toLowerCase();
    stores = stores.filter((s) =>
      s.address.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (categoryFilter) {
    stores = stores.filter((s) => s.category === categoryFilter);
  }

  if (tagFilter) {
    stores = stores.filter((s) => s.tags.includes(tagFilter));
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
          categories={[...CATEGORIES]}
          currentArea={areaQuery}
          currentCategory={categoryFilter}
          currentFilter={filterParam}
          currentTag={tagFilter}
        />

        {stores.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
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

async function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  const ranked = await getRankedStores(4);

  return (
    <div className="py-12 space-y-10">
      <div className="text-center space-y-3">
        <p className="text-4xl">🔍</p>
        <p className="text-gray-700 font-medium">該当するお店が見つかりませんでした</p>
        {hasFilter && (
          <Link
            href="/stores"
            className="inline-block mt-2 text-sm text-orange-500 border border-orange-300 rounded-full px-4 py-1.5 hover:bg-orange-50 transition-colors"
          >
            絞り込みをリセット
          </Link>
        )}
      </div>

      {ranked.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">人気のお店</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ranked.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
