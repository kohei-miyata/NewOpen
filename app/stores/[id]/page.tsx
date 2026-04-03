import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreById, getUserLikedStoreIds } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LikeButton from "@/components/LikeButton";
import ViewTracker from "@/components/ViewTracker";
import MapWrapper from "@/components/MapWrapper";
import RecentlyViewedSaver from "@/components/RecentlyViewedSaver";
import type { SnsLinks } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

const SNS_META: { key: keyof SnsLinks; label: string; icon: string; color: string }[] = [
  { key: "website",   label: "公式サイト", icon: "🌐", color: "text-gray-700" },
  { key: "instagram", label: "Instagram",  icon: "📸", color: "text-pink-500" },
  { key: "twitter",   label: "X (Twitter)", icon: "🐦", color: "text-sky-500" },
  { key: "tiktok",    label: "TikTok",     icon: "🎵", color: "text-gray-900" },
  { key: "line",      label: "LINE",       icon: "💬", color: "text-green-500" },
];

export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params;
  const [store, supabase] = await Promise.all([
    getStoreById(id),
    createSupabaseServerClient(),
  ]);
  if (!store) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const likedIds = user ? await getUserLikedStoreIds(user.id) : new Set<string>();
  const initialLiked = likedIds.has(store.id);

  const allPhotos = [
    ...(store.imageUrl ? [store.imageUrl] : []),
    ...store.photos,
  ].slice(0, 5);

  const snsEntries = store.snsLinks
    ? SNS_META.filter(({ key }) => store.snsLinks![key])
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <RecentlyViewedSaver storeId={store.id} />
        <Link href="/stores" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← 一覧に戻る
        </Link>

        {/* 写真ギャラリー */}
        {allPhotos.length > 0 && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={allPhotos[0]} alt={store.name} className="w-full h-64 object-cover rounded-xl" />
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {allPhotos.slice(1).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt={`${store.name} ${i + 2}`} className="w-full h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {store.category}
              </span>
              <span className="text-xs text-gray-400">オープン {store.openDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{store.address}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm text-gray-500">
              <ViewTracker storeId={store.id} initialViews={store.views} />
            </div>
          </div>
        </div>

        {/* 営業時間 */}
        {store.hoursText && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <span>🕐</span>
            <span>{store.hoursText}</span>
          </div>
        )}

        <p className="mt-5 text-gray-700 leading-relaxed">{store.description}</p>

        {/* タグ */}
        {store.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {store.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* SNS リンク */}
        {snsEntries.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">SNS・公式サイト</h2>
            <div className="flex flex-wrap gap-3">
              {snsEntries.map(({ key, label, icon, color }) => (
                <a
                  key={key}
                  href={store.snsLinks![key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-sm font-medium ${color} bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* いいねボタン */}
        <div className="mt-6">
          <LikeButton
            storeId={store.id}
            initialLikes={store.likes}
            initialLiked={initialLiked}
            isLoggedIn={!!user}
          />
        </div>

        {/* 地図 */}
        {store.lat != null && store.lng != null && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-gray-800 mb-2">アクセス</h2>
            <MapWrapper lat={store.lat} lng={store.lng} name={store.name} />
          </div>
        )}
      </div>
    </div>
  );
}
