export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ヘッダー skeleton */}
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>

        {/* サマリーカード skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center animate-pulse">
              <div className="w-5 h-5 rounded bg-gray-200 mx-auto mb-2" />
              <div className="h-7 bg-gray-200 rounded w-12 mx-auto mb-1" />
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* チャート skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex items-end gap-0.5 h-32">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
