import Link from "next/link";
import type { Store } from "@/types";
import { HeartIcon } from "@heroicons/react/24/solid";

function extractPrefecture(address: string): string {
  const match = address.match(/^(.+?[都道府県])/);
  return match ? match[1] : "";
}

interface Props {
  stores: Store[];
}

export default function AreaRanking({ stores }: Props) {
  // 都道府県ごとにグループ化し、いいね数トップの店舗を抽出
  const areaMap: Record<string, Store[]> = {};
  for (const store of stores) {
    const pref = extractPrefecture(store.address);
    if (!pref) continue;
    if (!areaMap[pref]) areaMap[pref] = [];
    areaMap[pref].push(store);
  }

  // 各エリアのいいね合計でソート、上位6エリアを表示
  const areas = Object.entries(areaMap)
    .map(([pref, list]) => ({
      pref,
      total: list.reduce((s, s2) => s + s2.likes, 0),
      top: [...list].sort((a, b) => b.likes - a.likes).slice(0, 3),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  if (areas.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {areas.map(({ pref, top }) => (
        <div key={pref} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="font-bold text-gray-900 text-sm">{pref}</p>
            <Link
              href={`/stores?area=${encodeURIComponent(pref)}`}
              className="text-xs text-orange-500 hover:underline"
            >
              すべて見る →
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {top.map((store, i) => (
              <li key={store.id}>
                <Link
                  href={`/stores/${store.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                >
                  <span className="text-sm font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                  {store.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={store.imageUrl} alt={store.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-orange-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-500 transition-colors">
                      {store.name}
                    </p>
                    <p className="text-xs text-gray-400">{store.category}</p>
                  </div>
                  <span className="flex items-center gap-0.5 text-xs text-orange-500 font-bold shrink-0">
                    <HeartIcon className="w-3 h-3" />{store.likes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
