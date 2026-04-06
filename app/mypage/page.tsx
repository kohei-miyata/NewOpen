import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLikedStores } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import {
  HeartIcon,
  Cog6ToothIcon,
  KeyIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default async function MypagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = (user.user_metadata?.role as string) ?? "user";
  const likedStores = await getLikedStores(user.id);

  const roleLabel = role === "owner" ? "オーナー" : role === "admin" ? "管理者" : "一般ユーザー";
  const roleBadgeClass = role === "owner"
    ? "bg-orange-100 text-orange-600"
    : role === "admin"
    ? "bg-gray-900 text-white"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <UserCircleIcon className="w-8 h-8 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{user.email}</p>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
          {role === "owner" && (
            <Link
              href="/mypage/owner"
              className="flex-shrink-0 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              オーナー管理 →
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/admin"
              className="flex-shrink-0 bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              管理画面 →
            </Link>
          )}
        </div>

        {/* オーナー向けリンク（一般ユーザーには非表示） */}
        {role === "owner" && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                <BuildingStorefrontIcon className="w-4 h-4" /> 店舗管理
              </h2>
            </div>
            <Link href="/mypage/owner" className="flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0">
              <span className="flex-1 text-sm font-medium text-gray-800">店舗一覧・編集</span>
              <ChevronRightIcon className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/mypage/owner/stores/new" className="flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors">
              <span className="flex-1 text-sm font-medium text-gray-800">新しい店舗を登録する</span>
              <ChevronRightIcon className="w-4 h-4 text-gray-300" />
            </Link>
          </section>
        )}

        {/* いいねしたお店 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <HeartIcon className="w-4 h-4 text-orange-400" /> いいねしたお店
          </h2>
          {likedStores.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">まだいいねしたお店はありません</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {likedStores.map((store) => store && (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </section>

        {/* 最近見たお店 */}
        <RecentlyViewedSection />

        {/* 設定 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
              <Cog6ToothIcon className="w-4 h-4" /> 設定
            </h2>
          </div>
          <Link
            href="/mypage/change-password"
            className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <KeyIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-gray-800">パスワードを変更する</span>
            <ChevronRightIcon className="w-4 h-4 text-gray-300" />
          </Link>
          <div className="px-5 py-4">
            <Link
              href="/mypage/withdraw"
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              退会する
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
