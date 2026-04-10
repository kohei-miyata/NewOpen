export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* プロフィールヘッダー skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-48" />
            <div className="h-5 bg-gray-200 rounded-full w-16 mt-1" />
          </div>
        </div>

        {/* いいねしたお店 skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-4 h-4 rounded bg-gray-200 shrink-0" />
            <div className="flex-1 h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-8" />
          </div>
        </div>

        {/* 設定 skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-4 h-4 rounded bg-gray-200 shrink-0" />
            <div className="flex-1 h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>

      </div>
    </div>
  );
}
