import Link from "next/link";
import type { Metadata } from "next";
import { getRankedStores } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import PageHeader from "@/components/PageHeader";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";

export const metadata: Metadata = {
  title: "人気ランキング",
  description: "NewOpenで最も注目を集めている新規オープン店舗のランキングです。いいね数・閲覧数をもとにした人気店をチェックしましょう。",
};

const MEDAL_COLORS = [
  "bg-yellow-400 text-white",
  "bg-gray-300 text-white",
  "bg-amber-600 text-white",
];

export default async function RankingPage() {
  const ranked = await getRankedStores(50);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader title="全国いいね！ランキング" description="新規オープン店舗の中で最も注目されているお店をランキング形式でご紹介" />

        {/* TOP3 ハイライト */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {ranked.slice(0, 3).map((store, i) => (
            <div key={store.id} className="relative">
              {/* <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold z-10 shadow ${MEDAL_COLORS[i]}`}>
                {i + 1}
              </div> */}
              <StoreCard store={store} rank={i + 1} />
            </div>
          ))}
        </div>

        {/* 4位以下 */}
        <h2 className="text-lg font-bold text-gray-700 mb-4">4位以降</h2>
        <div className="space-y-3">
          {ranked.slice(3).map((store, i) => (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl font-bold text-gray-300 w-8 text-center">{i + 4}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.imageUrl}
                alt={store.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {store.category}
                  </span>
                </div>
                <p className="font-bold text-gray-900 truncate mt-0.5">{store.name}</p>
                <p className="text-xs text-gray-500">{store.address}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-700">{store.likes.toLocaleString()}</div>
                <div className="text-xs text-gray-400">いいね</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14">
          <RecentlyViewedSection />
        </div>
      </div>
    </div>
  );
}
