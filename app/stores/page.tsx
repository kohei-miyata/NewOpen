import { headers } from "next/headers";
import { getStores } from "@/lib/db";
import { getLatLngFromIp } from "@/lib/geolocation";
import StoreCard from "@/components/StoreCard";
import PageHeader from "@/components/PageHeader";
import StoresFilter from "@/components/StoresFilter";
import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  "レストラン","カフェ","スイーツ","居酒屋","ラーメン","美容院","ジム","ショップ","その他",
];

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const areaQuery = sp.area?.trim() ?? "";
  const categoryFilter = sp.category ?? "";

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    null;
  const userLatLng = await getLatLngFromIp(ip);

  let stores = await getStores(userLatLng);

  if (areaQuery) {
    const q = areaQuery.toLowerCase();
    stores = stores.filter((s) =>
      s.address.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  if (categoryFilter) {
    stores = stores.filter((s) => s.category === categoryFilter);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader
          title="新規オープン一覧"
          description={`${stores.length}件のお店`}
        />

        <StoresFilter
          categories={CATEGORIES}
          currentArea={areaQuery}
          currentCategory={categoryFilter}
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
