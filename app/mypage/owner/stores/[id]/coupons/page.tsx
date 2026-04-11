import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getStoreById, getAllCouponsByStoreId } from "@/lib/db";
import { addCoupon, removeCoupon, toggleCoupon } from "./actions";
import SubmitButton from "@/components/SubmitButton";
import CouponFormClient from "@/components/CouponFormClient";
import { TicketIcon } from "@heroicons/react/24/outline";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ welcome?: string }>;
}

export default async function OwnerCouponsPage({ params, searchParams }: Props) {
  const { id: storeId } = await params;
  const { welcome } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = user.user_metadata?.role as string;
  if (role !== "owner") redirect("/mypage");

  const [store, coupons] = await Promise.all([
    getStoreById(storeId),
    getAllCouponsByStoreId(storeId),
  ]);
  if (!store) redirect("/mypage/owner");

  // クーポン使用件数をadminクライアントで取得（RLS回避）
  const adminClient = createSupabaseAdminClient();
  const couponIds = coupons.map((c) => c.id);
  const usageMap: Record<string, number> = {};
  if (couponIds.length > 0) {
    const { data: usageRows } = await adminClient
      .from("coupon_uses")
      .select("coupon_id")
      .in("coupon_id", couponIds);
    (usageRows ?? []).forEach((row) => {
      usageMap[row.coupon_id] = (usageMap[row.coupon_id] ?? 0) + 1;
    });
  }
  const totalUses = Object.values(usageMap).reduce((s, n) => s + n, 0);

  function daysUntilExpiry(expiryDate: string): number {
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000);
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

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

        {/* 店舗登録完了後のウェルカムバナー */}
        {welcome && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 space-y-1">
            <p className="text-sm font-bold text-orange-800 flex items-center gap-1.5">
              <TicketIcon className="w-4 h-4 shrink-0" />
              店舗登録が完了しました！オープン記念クーポンを作成しましょう
            </p>
            <p className="text-xs text-orange-700">クーポンを登録すると店舗詳細ページに表示され、ユーザーが来店するきっかけになります。</p>
          </div>
        )}

        {/* 使用状況サマリー */}
        {coupons.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">クーポン総使用数</p>
              <p className="text-3xl font-extrabold text-orange-500">{totalUses}</p>
              <p className="text-xs text-gray-400 mt-0.5">件</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">登録クーポン数</p>
              <p className="text-3xl font-extrabold text-gray-800">{coupons.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">件</p>
            </div>
          </div>
        )}

        {/* 登録済みクーポン */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">登録済みクーポン（{coupons.length}件）</h2>
          {coupons.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">クーポンがまだありません</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`bg-white rounded-xl border shadow-sm p-4 ${!coupon.isActive ? "opacity-60 border-gray-100" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-900 text-sm">{coupon.title}</p>
                        {coupon.isActive
                          ? <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">有効</span>
                          : <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">無効</span>
                        }
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">{coupon.discount}</span>
                        <span>コード: <span className="font-mono">{coupon.code}</span></span>
                        <span className={daysUntilExpiry(coupon.expiryDate) <= 0 ? "text-red-500 font-bold" : daysUntilExpiry(coupon.expiryDate) <= 7 ? "text-orange-500 font-bold" : ""}>
                          期限: {coupon.expiryDate}
                          {daysUntilExpiry(coupon.expiryDate) <= 0
                            ? " （期限切れ）"
                            : daysUntilExpiry(coupon.expiryDate) <= 30
                            ? ` （残り${daysUntilExpiry(coupon.expiryDate)}日）`
                            : ""}
                        </span>
                        <span className="flex items-center gap-0.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          <TicketIcon className="w-3 h-3" />
                          使用: {usageMap[coupon.id] ?? 0}件
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${coupon.combinable ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                          {coupon.combinable ? "併用可" : "併用不可"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <form action={toggleCoupon.bind(null, coupon.id, storeId, !coupon.isActive)}>
                        <SubmitButton
                          label={coupon.isActive ? "無効にする" : "有効にする"}
                          loadingLabel="変更中..."
                          className={`text-xs border px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            coupon.isActive
                              ? "border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        />
                      </form>
                      <Link
                        href={`/mypage/owner/stores/${storeId}/coupons/${coupon.id}/edit`}
                        className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
                      >
                        編集
                      </Link>
                      <form action={removeCoupon.bind(null, coupon.id, storeId)}>
                        <SubmitButton
                          label="削除"
                          loadingLabel="削除中..."
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
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
          <CouponFormClient action={addCouponBound} />
        </section>
      </div>
    </div>
  );
}
