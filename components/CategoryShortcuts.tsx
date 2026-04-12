import Link from "next/link";
import type { Category } from "@/types";
import { FaUtensils, FaCoffee, FaBeer, FaCut, FaDumbbell, FaShoppingBag } from "react-icons/fa";
import { MdCake } from "react-icons/md";
import { GiNoodles } from "react-icons/gi";
import { BsThreeDots } from "react-icons/bs";
import type { IconType } from "react-icons";

const CATEGORY_CONFIG: { label: Category; icon: IconType }[] = [
  { label: "レストラン", icon: FaUtensils },
  { label: "カフェ",     icon: FaCoffee },
  { label: "スイーツ",   icon: MdCake },
  { label: "居酒屋",     icon: FaBeer },
  { label: "ラーメン",   icon: GiNoodles },
  { label: "美容院",     icon: FaCut },
  { label: "ジム",       icon: FaDumbbell },
  { label: "ショップ",   icon: FaShoppingBag },
  { label: "その他",     icon: BsThreeDots },
];

interface Props {
  counts?: Partial<Record<Category, number>>;
}

export default function CategoryShortcuts({ counts = {} }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
      {CATEGORY_CONFIG.map(({ label, icon: Icon }) => (
        <Link
          key={label}
          href={`/stores?category=${encodeURIComponent(label)}`}
          className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 shadow-sm py-3 px-2 hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <Icon size={22} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          <span className="text-xs font-medium text-gray-700 group-hover:text-orange-500 transition-colors text-center leading-tight">
            {label}
          </span>
          {counts[label] !== undefined && (
            <span className="text-[10px] text-gray-400">{counts[label]}件</span>
          )}
        </Link>
      ))}
    </div>
  );
}
