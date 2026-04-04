import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCouponsByStoreId } from "@/lib/db";
import { editCoupon } from "../../actions";
import SubmitButton from "@/components/SubmitButton";

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors";

interface Props {
  params: Promise<{ id: string; couponId: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id: storeId, couponId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const coupons = await getCouponsByStoreId(storeId);
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon) notFound();

  const action = editCoupon.bind(null, couponId);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">クーポン編集</h1>
          <Link
            href={`/mypage/owner/stores/${storeId}/coupons`}
            className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            ← 戻る
          </Link>
        </div>
        <form action={action} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <input type="hidden" name="storeId" value={storeId} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
            <input name="title" required defaultValue={coupon.title} className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input name="description" defaultValue={coupon.description} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">割引内容 <span className="text-red-500">*</span></label>
              <input name="discount" required defaultValue={coupon.discount} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">クーポンコード <span className="text-red-500">*</span></label>
              <input name="code" required defaultValue={coupon.code} className={INPUT} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有効期限 <span className="text-red-500">*</span></label>
            <input name="expiryDate" type="date" required defaultValue={coupon.expiryDate} className={INPUT} />
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
