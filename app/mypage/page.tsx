import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLikedStores } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";

export default async function MypagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = (user.user_metadata?.role as string) ?? "user";
  const likedStores = await getLikedStores(user.id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          {role === "owner" && (
            <Link
              href="/mypage/owner"
              className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              オーナー管理 →
            </Link>
          )}
        </div>

        {/* いいねしたお店 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">いいねしたお店</h2>
          {likedStores.length === 0 ? (
            <p className="text-sm text-gray-400">まだいいねしたお店はありません</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {likedStores.map((store) => store && (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </section>

        {/* 最近見たお店はクライアント側で localStorage から表示 */}
        <RecentlyViewedSection />

        {/* アカウント設定 */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <Link
            href="/mypage/change-password"
            className="block text-sm text-gray-600 hover:text-orange-500 transition-colors"
          >
            パスワードを変更する →
          </Link>
          <div>
            <Link
              href="/mypage/withdraw"
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              退会する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
