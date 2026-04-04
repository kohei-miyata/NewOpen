"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900">エラーが発生しました</h1>
        <p className="mt-2 text-sm text-gray-500">
          申し訳ありません。予期しないエラーが発生しました。
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm"
          >
            もう一度試す
          </button>
          <a
            href="/"
            className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors text-sm"
          >
            トップページへ
          </a>
        </div>
      </div>
    </div>
  );
}
