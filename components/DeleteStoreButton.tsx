"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { removeStore } from "@/app/mypage/owner/stores/actions";

export default function DeleteStoreButton({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await removeStore(storeId);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs border border-red-200 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <TrashIcon className="w-3.5 h-3.5 inline-block mr-1" />削除
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="text-center space-y-2">
              <TrashIcon className="w-10 h-10 text-red-400 mx-auto" />
              <h2 className="text-base font-bold text-gray-900">店舗を削除しますか？</h2>
              <p className="text-sm text-gray-500">
                「{storeName}」を削除します。クーポン・いいね情報も含めてすべて削除され、元に戻せません。
              </p>
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setOpen(false); setError(null); }}
                disabled={isPending}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-2 rounded-lg hover:border-gray-400 transition-colors text-sm disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    削除中...
                  </span>
                ) : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
