import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-orange-500">NewOpen</p>
            <p className="text-xs text-gray-400 mt-1">あなたの街の新規オープン情報をいち早くお届け</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:max-w-xs">
            <p className="text-sm font-semibold text-gray-800">お店のオーナー様へ</p>
            <p className="text-xs text-gray-500 mt-1">新規オープンの情報を無料で掲載できます。ぜひご登録ください。</p>
            <Link
              href="/stores/new"
              className="inline-block mt-3 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              お店を登録する →
            </Link>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-8 text-center">© 2026 NewOpen</p>
      </div>
    </footer>
  );
}
