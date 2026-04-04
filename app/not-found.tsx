import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-orange-400">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">ページが見つかりません</h1>
        <p className="mt-2 text-sm text-gray-500">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm"
          >
            トップページへ
          </Link>
          <Link
            href="/stores"
            className="border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors text-sm"
          >
            お店を探す
          </Link>
        </div>
      </div>
    </div>
  );
}
