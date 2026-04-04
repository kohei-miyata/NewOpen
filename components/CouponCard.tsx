"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markCouponUsed } from "@/app/coupons/actions";
import type { Coupon } from "@/types";

interface Props {
  coupon: Coupon;
  isUsed?: boolean;
  isLoggedIn?: boolean;
}

export default function CouponCard({ coupon, isUsed: initialUsed = false, isLoggedIn = false }: Props) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(initialUsed);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const daysLeft = Math.ceil(
    (new Date(coupon.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

  async function handleUse() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await markCouponUsed(coupon.id);
      if (result?.error) {
        setError("エラーが発生しました。もう一度お試しください。");
      } else {
        setUsed(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {/* カード */}
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-left bg-white rounded-xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md flex ${used ? "opacity-60" : "border-gray-100"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coupon.imageUrl || "/placeholder.png"}
          alt={coupon.storeName}
          className="w-28 h-28 object-cover flex-shrink-0"
        />
        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {coupon.storeCategory}
              </span>
              {used && <span className="text-xs text-gray-400 font-semibold">使用済み</span>}
              {!used && isExpiringSoon && <span className="text-xs text-red-500 font-semibold">残り{daysLeft}日</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{coupon.storeName}</p>
            <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-2">{coupon.title}</h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{coupon.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-orange-500 font-bold text-sm">{coupon.discount}</span>
            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-dashed border-gray-300">
              {isLoggedIn ? coupon.code : "ログインで表示"}
            </span>
          </div>
        </div>
      </button>

      {/* モーダル */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {coupon.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coupon.imageUrl} alt={coupon.storeName} className="w-full h-40 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{coupon.storeCategory}</span>
                {used && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">使用済み</span>}
                {!used && isExpiringSoon && <span className="text-xs text-red-500 font-semibold">残り{daysLeft}日</span>}
              </div>
              <div>
                <p className="text-xs text-gray-500">{coupon.storeName}</p>
                <h2 className="font-bold text-gray-900 text-base mt-0.5">{coupon.title}</h2>
                {coupon.description && <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>}
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">割引内容</p>
                <p className="text-2xl font-extrabold text-orange-500">{coupon.discount}</p>
              </div>

              {isLoggedIn ? (
                <>
                  {/* クーポンコード */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">クーポンコード</p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 font-mono text-lg font-bold text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg py-2 tracking-widest">
                        {coupon.code}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-xs text-orange-500 border border-orange-200 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors shrink-0"
                      >
                        {copied ? "コピー済み" : "コピー"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right">有効期限: {coupon.expiryDate}</p>
                  {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                  {!used ? (
                    <button
                      onClick={handleUse}
                      disabled={loading}
                      className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
                    >
                      {loading ? "処理中..." : "使用する"}
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl text-center">
                      使用済み
                    </div>
                  )}
                </>
              ) : (
                /* 未ログイン：コードを隠してログイン導線を前面に */
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center space-y-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">🔒 クーポンを使うにはログインが必要です</p>
                    <p className="text-xs text-gray-500 mt-1">無料会員登録でクーポンコードを確認・使用できます</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="/auth/signup"
                      className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-orange-600 transition-colors text-center"
                    >
                      無料会員登録
                    </a>
                    <a
                      href="/auth/login"
                      className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg text-sm hover:border-orange-400 hover:text-orange-500 transition-colors text-center"
                    >
                      ログイン
                    </a>
                  </div>
                  <p className="text-xs text-gray-400">有効期限: {coupon.expiryDate}</p>
                </div>
              )}
              <button onClick={() => setOpen(false)} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
