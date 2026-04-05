import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
      <Link
        href={buildHref(page - 1)}
        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
          page <= 1
            ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
            : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
        }`}
        aria-disabled={page <= 1}
      >
        ← 前へ
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
            p === page
              ? "bg-orange-500 text-white border-orange-500"
              : "text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={buildHref(page + 1)}
        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
          page >= totalPages
            ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
            : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
        }`}
        aria-disabled={page >= totalPages}
      >
        次へ →
      </Link>
    </div>
  );
}
