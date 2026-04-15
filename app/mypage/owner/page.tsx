import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getOwnerStores } from "@/lib/db";
import { TicketIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import DeleteStoreButton from "@/components/DeleteStoreButton";

const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;
function isOver3Years(openDate: string): boolean {
  return Date.now() - new Date(openDate).getTime() >= THREE_YEARS_MS;
}

export default async function OwnerMypagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = (user.user_metadata?.role as string) ?? "user";
  if (role !== "owner") redirect("/mypage");

  const rawStores = await getOwnerStores(user.id);
  const stores = [
    ...rawStores.filter((s) => !isOver3Years(s.openDate)),
    ...rawStores.filter((s) => isOver3Years(s.openDate)),
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">オーナー管理</h1>
            {!user.user_metadata?.line_user_id && (
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/mypage"
              className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              ← マイページ
            </Link>
            <Link
              href="/mypage/owner/stores/new"
              className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              + 新規登録
            </Link>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">登録した店舗</h2>
          {stores.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              まだ店舗を登録していません。
              <Link href="/mypage/owner/stores/new" className="text-orange-500 hover:underline ml-1">
                最初の店舗を登録する →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => {
                const expired = isOver3Years(store.openDate);
                return (
                <div
                  key={store.id}
                  className={`rounded-xl border shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${expired ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-gray-100"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {store.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={store.imageUrl}
                        alt={store.name}
                        className="w-14 h-14 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{store.name}</p>
                        {expired && (
                          <span className="text-xs bg-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full shrink-0">
                            掲載期間終了
                          </span>
                        )}
                        {!expired && store.approvalStatus === "pending" && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                            審査中
                          </span>
                        )}
                        {!expired && store.approvalStatus === "rejected" && (
                          <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full shrink-0">
                            否認
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{store.address}</p>
                      <p className="text-xs text-orange-500 mt-0.5">{store.category} · オープン {store.openDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/stores/${store.id}`}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                      表示
                    </Link>
                    {!expired && (
                      <>
                        <Link
                          href={`/mypage/owner/stores/${store.id}/analytics`}
                          className="text-xs border border-blue-200 text-blue-500 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          <ChartBarIcon className="w-3.5 h-3.5 inline-block mr-1" />分析
                        </Link>
                        <Link
                          href={`/mypage/owner/stores/${store.id}/coupons`}
                          className="text-xs border border-orange-200 text-orange-500 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors"
                        >
                          <TicketIcon className="w-3.5 h-3.5 inline-block mr-1" />クーポン
                        </Link>
                        <Link
                          href={`/mypage/owner/stores/${store.id}/edit`}
                          className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors"
                        >
                          編集
                        </Link>
                        <DeleteStoreButton storeId={store.id} storeName={store.name} />
                      </>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
