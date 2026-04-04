import Link from "next/link";
import type { Store } from "@/types";

interface Props {
  store: Store;
  rank?: number;
}

export default function StoreCard({ store, rank }: Props) {
  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(store.openDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNew = daysAgo >= 0 && daysAgo <= 30;
  const isComingSoon = daysAgo < 0;

  return (
    <Link href={`/stores/${store.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"}
            alt={store.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {isNew && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
            {isComingSoon && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                SOON
              </span>
            )}
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
              {store.category}
            </span>
          </div>
          {rank !== undefined && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow">
              {rank}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base truncate">{store.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{store.address}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{store.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{store.likes.toLocaleString()} いいね</span>
            <span>オープン {store.openDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
