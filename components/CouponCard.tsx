import type { Coupon } from "@/types";

interface Props {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: Props) {
  const daysLeft = Math.ceil(
    (new Date(coupon.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysLeft <= 7;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coupon.imageUrl}
        alt={coupon.storeName}
        className="w-28 h-28 object-cover flex-shrink-0"
      />
      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {coupon.storeCategory}
            </span>
            {isExpiringSoon && (
              <span className="text-xs text-red-500 font-semibold">
                残り{daysLeft}日
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{coupon.storeName}</p>
          <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-2">{coupon.title}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{coupon.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-500 font-bold text-sm">{coupon.discount}</span>
          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-300">
            {coupon.code}
          </span>
        </div>
      </div>
    </div>
  );
}
