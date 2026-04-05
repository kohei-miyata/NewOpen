"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteAccount } from "@/app/auth/actions";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function WithdrawPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    setLoading(true);
    setError(null);
    const result = await deleteAccount();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
            <h1 className="text-xl font-bold text-gray-900">退会する</h1>
            <p className="text-sm text-gray-500">
              退会すると、アカウント情報・いいね履歴・クーポン使用履歴がすべて削除されます。この操作は取り消せません。
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-red-500"
            />
            <span className="text-sm text-gray-600">上記の内容を理解し、退会することに同意します</span>
          </label>

          <div className="space-y-2">
            <button
              onClick={handleWithdraw}
              disabled={!confirmed || loading}
              className="w-full bg-red-500 text-white font-bold py-2.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  処理中...
                </span>
              ) : "退会する"}
            </button>
            <Link
              href="/mypage"
              className="block w-full text-center border border-gray-300 text-gray-600 font-medium py-2.5 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              キャンセル
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
