import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import type { Store } from "@/types";
import { FaStore } from "react-icons/fa";

interface Props {
  stores: Store[];
  isLoggedIn: boolean;
  likedStoreIds: Set<string>;
}

export default function RelatedStores({ stores, isLoggedIn, likedStoreIds }: Props) {
  if (stores.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaStore className="text-orange-500" size={18} />
          <h2 className="text-base font-semibold text-gray-800">あわせてチェック</h2>
        </div>
        <Link href="/stores" className="text-xs text-orange-500 hover:underline">
          もっと見る →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isLoggedIn={isLoggedIn}
            initialLiked={likedStoreIds.has(store.id)}
          />
        ))}
      </div>
    </section>
  );
}
