import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface AreaCount {
  prefecture: string;
  count: number;
}

interface Props {
  areas: AreaCount[];
}

export default function AreaLinks({ areas }: Props) {
  if (areas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {areas.map(({ prefecture, count }) => (
        <Link
          key={prefecture}
          href={`/stores?area=${encodeURIComponent(prefecture)}`}
          className="inline-flex items-center gap-1 bg-white border border-gray-200 text-sm text-gray-700 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors shadow-sm"
        >
          <MapPinIcon className="w-3.5 h-3.5" />
          {prefecture}
          <span className="text-xs text-gray-400 ml-0.5">{count}</span>
        </Link>
      ))}
    </div>
  );
}
