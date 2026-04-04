import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStoreById, getCouponsByStoreId } from "@/lib/db";
import { addCoupon, removeCoupon } from "./actions";

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OwnerCouponsPage({ params }: Props) {
  const { id: storeId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = user.user_metadata?.role as string;
  if (role !== "owner") redirect("/mypage");

  const [store, coupons] = await Promise.all([
    getStoreById(storeId),
    getCouponsByStoreId(storeId),
  ]);
  if (!store) redirect("/mypage/owner");

  const addCouponBound = addCoupon.bind(null, storeId);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">クーポン管理</h1>
            <p className="text-sm text-gray-500 mt-0.5">{store.name}</p>
          </div>
          <Link
            href="/mypage/owner"
            className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            ← 戻る
          </Link>
        </div>

        {/* 登録済みクーポン */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">登録済みクーポン（{coupons.length}件）</h2>
          {coupons.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">クーポンがまだありません</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{coupon.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">{coupon.discount}</span>
                        <span>コード: <span className="font-mono">{coupon.code}</span></span>
                        <span>期限: {coupon.expiryDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/mypage/owner/stores/${storeId}/coupons/${coupon.id}/edit`}
                        className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
                      >
                        編集
                      </Link>
                      <form action={removeCoupon.bind(null, coupon.id, storeId)}>
                        <button
                          type="submit"
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 新規クーポン追加フォーム */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">新しいクーポンを追加</h2>
          <form action={addCouponBound} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
              <input name="title" required className={INPUT} placeholder="例: オープン記念 10%OFF" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <input name="description" className={INPUT} placeholder="例: ご来店のお客様全員に適用" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">割引内容 <span className="text-red-500">*</span></label>
                <input name="discount" required className={INPUT} placeholder="例: 10%OFF" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">クーポンコード <span className="text-red-500">*</span></label>
                <input name="code" required className={INPUT} placeholder="例: OPEN2026" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">有効期限 <span className="text-red-500">*</span></label>
              <input name="expiryDate" type="date" required className={INPUT} />
            </div>
            <input type="hidden" name="imageUrl" value="" />
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              追加する
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
