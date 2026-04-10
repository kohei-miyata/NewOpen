"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markCouponUsed } from "@/app/coupons/actions";
import type { Coupon } from "@/types";
import { LockClosedIcon, CheckIcon } from "@heroicons/react/24/outline";

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
  const [confirming, setConfirming] = useState(false);
  const [justUsed, setJustUsed] = useState(false);
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
    setConfirming(true);
  }

  async function handleConfirm() {
    setConfirming(false);
    setLoading(true);
    setError(null);
    try {
      const result = await markCouponUsed(coupon.id);
      if (result?.error) {
        setError("エラーが発生しました。もう一度お試しください。");
      } else {
        setUsed(true);
        setJustUsed(true);
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
          <p className={`text-xs mt-1.5 ${daysLeft <= 0 ? "text-red-500 font-semibold" : daysLeft <= 7 ? "text-orange-500" : "text-gray-400"}`}>
            期限: {coupon.expiryDate}{daysLeft <= 0 ? "（期限切れ）" : ""}
          </p>
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
                <a
                  href={`/stores/${coupon.storeId}`}
                  className="text-xs text-orange-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {coupon.storeName} →
                </a>
                <h2 className="font-bold text-gray-900 text-base mt-0.5">{coupon.title}</h2>
                {coupon.description && <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>}
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">割引内容</p>
                <p className="text-2xl font-extrabold text-orange-500">{coupon.discount}</p>
              </div>
              <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-center ${coupon.combinable ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                {coupon.combinable ? "他のクーポンと併用可" : "他のクーポンとの併用不可"}
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
                  {confirming ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-gray-900 text-center">本当に使用しますか？</p>
                      <p className="text-xs text-gray-500 text-center">一度使用すると、このクーポンは再利用できません。</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirming(false)}
                          className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                        >
                          使用する
                        </button>
                      </div>
                    </div>
                  ) : !used ? (
                    <button
                      onClick={handleUse}
                      disabled={loading}
                      className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
                    >
                      {loading ? "処理中..." : "使用する"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {justUsed && (
                        <p className="text-xs text-center text-green-600 font-medium flex items-center justify-center gap-1"><CheckIcon className="w-3.5 h-3.5" />クーポンを使用しました</p>
                      )}
                      <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl text-center text-sm">
                        使用済み（再利用不可）
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* 未ログイン：コードを隠してログイン導線を前面に */
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center space-y-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1.5"><LockClosedIcon className="w-4 h-4" />クーポンを使うにはログインが必要です</p>
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
