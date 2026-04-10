export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ヘッダー skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded-full w-28" />
            <div className="h-9 bg-gray-200 rounded-full w-24" />
          </div>
        </div>

        {/* 店舗カード skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-200 rounded w-40" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-7 bg-gray-200 rounded-full w-12" />
                <div className="h-7 bg-gray-200 rounded-full w-20" />
                <div className="h-7 bg-gray-200 rounded-full w-12" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
