import Link from "next/link";
import type { Store } from "@/types";
import CardLikeButton from "@/components/CardLikeButton";
import StoreCardSlider from "@/components/StoreCardSlider";

interface Props {
  store: Store;
  rank?: number;
  isLoggedIn?: boolean;
  initialLiked?: boolean;
}

export default function StoreCard({ store, rank, isLoggedIn = false, initialLiked = false }: Props) {
  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(store.openDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isNew = daysAgo >= 0 && daysAgo <= 30;
  const isComingSoon = daysAgo < 0;

  const allPhotos = [
    ...(store.imageUrl ? [store.imageUrl] : []),
    ...store.photos,
  ].slice(0, 5);

  return (
    <Link href={`/stores/${store.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative">
          <StoreCardSlider photos={allPhotos} storeName={store.name} />
          <div className="absolute top-2 left-2 flex gap-1">
            {store.status === "closed" && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                閉店
              </span>
            )}
            {store.status === "temporarily_closed" && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                休業中
              </span>
            )}
            {store.status === "active" && isNew && (
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
            {store.status === "active" && isComingSoon && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                SOON
              </span>
            )}
            <span className="bg-white text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
              {store.category}
            </span>
          </div>
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
            {rank !== undefined && (
              <div className="bg-yellow-400 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow">
                {rank}
              </div>
            )}
            <CardLikeButton
              storeId={store.id}
              initialLikes={store.likes}
              initialLiked={initialLiked}
              isLoggedIn={isLoggedIn}
            />
          </div>
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
