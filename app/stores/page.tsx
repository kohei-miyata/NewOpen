import { headers } from "next/headers";
import { getStores, getComingSoonStores } from "@/lib/db";
import { getLatLngFromIp } from "@/lib/geolocation";
import StoreCard from "@/components/StoreCard";
import PageHeader from "@/components/PageHeader";
import StoresFilter from "@/components/StoresFilter";
import type { Category } from "@/types";

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

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    null;

  const userLatLng = filterParam === "coming_soon"
    ? undefined
    : await getLatLngFromIp(ip);

  const [normalStores, comingSoonStores] = await Promise.all([
    filterParam === "coming_soon" ? Promise.resolve([]) : getStores(userLatLng),
    filterParam === "coming_soon" ? getComingSoonStores() : Promise.resolve([]),
  ]);

  // coming_soon フィルターの場合はまもなくオープン、そうでなければ通常店舗
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
