import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllCouponsByStoreId } from "@/lib/db";
import { editCoupon } from "../../actions";
import CouponFormClient from "@/components/CouponFormClient";

interface Props {
  params: Promise<{ id: string; couponId: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id: storeId, couponId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const coupons = await getAllCouponsByStoreId(storeId);
  const coupon = coupons.find((c) => c.id === couponId);
  if (!coupon) notFound();

  const action = async (formData: FormData) => {
    "use server";
    formData.set("storeId", storeId);
    await editCoupon(couponId, formData);
  };

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
        <CouponFormClient
          action={action}
          defaultValues={{
            title: coupon.title,
            description: coupon.description,
            discount: coupon.discount,
            code: coupon.code,
            expiryDate: coupon.expiryDate,
            combinable: coupon.combinable,
            imageUrl: coupon.imageUrl,
          }}
        />
      </div>
    </div>
  );
}
