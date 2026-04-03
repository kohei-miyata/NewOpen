import { getCoupons } from "@/lib/db";
import CouponCard from "@/components/CouponCard";
import PageHeader from "@/components/PageHeader";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader title="お得なクーポン" description="新規オープン店舗限定のオープン記念クーポン一覧。期限切れ前にお早めに！" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>
    </div>
  );
}
