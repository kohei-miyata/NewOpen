import { getCoupons, getUsedCouponIds } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CouponCard from "@/components/CouponCard";
import PageHeader from "@/components/PageHeader";

export default async function CouponsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [coupons, usedCouponIds] = await Promise.all([
    getCoupons(),
    user ? getUsedCouponIds(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader title="お得なクーポン" description="新規オープン店舗限定のオープン記念クーポン一覧。期限切れ前にお早めに！" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} isUsed={usedCouponIds.has(coupon.id)} isLoggedIn={!!user} />
          ))}
        </div>
      </div>
    </div>
  );
}
