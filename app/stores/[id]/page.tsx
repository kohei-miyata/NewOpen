import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getStoreById, getUserLikedStoreIds, getCouponsByStoreId, getUsedCouponIds } from "@/lib/db";
import CouponCard from "@/components/CouponCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LikeButton from "@/components/LikeButton";
import ViewTracker from "@/components/ViewTracker";
import MapWrapper from "@/components/MapWrapper";
import RecentlyViewedSaver from "@/components/RecentlyViewedSaver";
import SnsPostEmbed from "@/components/SnsPostEmbed";
import ShareButtons from "@/components/ShareButtons";
import type { SnsLinks } from "@/types";
import {
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TicketIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) return { title: "店舗が見つかりません | NewOpen" };
  return {
    title: `${store.name} | NewOpen`,
    description: store.description,
    alternates: {
      canonical: `/stores/${id}`,
    },
    openGraph: {
      title: store.name,
      description: store.description,
      images: store.imageUrl ? [{ url: store.imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description: store.description,
      images: store.imageUrl ? [store.imageUrl] : [],
    },
  };
}

const SNS_META: { key: keyof SnsLinks; label: string; color: string }[] = [
  { key: "website",     label: "公式サイト",    color: "text-gray-700" },
  { key: "instagram",   label: "Instagram",    color: "text-pink-500" },
  { key: "twitter",     label: "X (Twitter)",  color: "text-sky-500" },
  { key: "tiktok",      label: "TikTok",       color: "text-gray-900" },
  { key: "line",        label: "LINE",         color: "text-green-500" },
  { key: "google_maps", label: "Google マップ", color: "text-red-500" },
];

export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params;
  const [store, supabase] = await Promise.all([
    getStoreById(id),
    createSupabaseServerClient(),
  ]);
  if (!store) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const [likedIds, coupons, usedCouponIds] = await Promise.all([
    user ? getUserLikedStoreIds(user.id) : Promise.resolve(new Set<string>()),
    getCouponsByStoreId(id),
    user ? getUsedCouponIds(user.id) : Promise.resolve(new Set<string>()),
  ]);
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

        {store.status === "closed" && (
          <div className="mb-4 bg-gray-800 text-white text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <NoSymbolIcon className="w-4 h-4 shrink-0" /> この店舗は閉店しています
          </div>
        )}
        {store.status === "temporarily_closed" && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" /> 現在休業中です
          </div>
        )}

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
            <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
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
              {snsEntries.map(({ key, label, color }) => (
                <a
                  key={key}
                  href={store.snsLinks![key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-sm font-medium ${color} bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow`}
                >
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* シェアボタン */}
        <div className="mt-6">
          <ShareButtons
            title={store.name}
            url={`${process.env.NEXT_PUBLIC_SITE_URL}/stores/${store.id}`}
          />
        </div>

        {/* いいねボタン */}
        <div className="mt-4">
          <LikeButton
            storeId={store.id}
            initialLikes={store.likes}
            initialLiked={initialLiked}
            isLoggedIn={!!user}
          />
        </div>

        {/* クーポン */}
        {coupons.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              <TicketIcon className="w-4 h-4 text-orange-500" /> クーポン
            </h2>
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  isUsed={usedCouponIds.has(coupon.id)}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </div>
        )}

        {/* SNS 埋め込み */}
        <SnsPostEmbed
          twitterPostUrl={store.twitterPostUrl}
          instagramPostUrl={store.instagramPostUrl}
          tiktokPostUrl={store.tiktokPostUrl}
        />

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
