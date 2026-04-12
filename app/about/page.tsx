import type { Metadata } from "next";
import Link from "next/link";
import {
  MapIcon, TagIcon, TicketIcon, CalendarDaysIcon,
  ClockIcon, CurrencyYenIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "NewOpenについて",
  description: "NewOpenは新規オープン店舗の情報をいち早くお届けするプラットフォームです。使い方・特徴・よくある質問をご案内します。",
};

const FEATURES = [
  { Icon: MapIcon, title: "エリアから探す", desc: "渋谷・新宿・銀座など、街や駅名で新規オープン店舗を絞り込んで検索。" },
  { Icon: TagIcon, title: "カテゴリで絞り込む", desc: "レストラン・カフェ・スイーツ・美容院・ジムなど9カテゴリから探せる。" },
  { Icon: TicketIcon, title: "お得なクーポン", desc: "限定クーポンをGETして、お得に新しいお店を体験しよう。" },
  { Icon: CalendarDaysIcon, title: "オープン前から掲載", desc: "「まもなくオープン」として30日前から告知。話題を先取りしよう。" },
  { Icon: ClockIcon, title: "3年間継続掲載", desc: "オープンから3年間、一般公開されます。期間終了後もオーナーのマイページから確認・管理が可能です。" },
  { Icon: CurrencyYenIcon, title: "すべて完全無料", desc: "掲載・編集・クーポン発行・SNS埋め込みもすべて0円。" },
];

import { GENERAL_FAQS as FAQS } from "@/lib/faqs";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
            NewOpenとは
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            新規オープン情報を、<br className="sm:hidden" />もっと身近に
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            NewOpenは全国の新規オープン店舗情報をいち早くお届けするプラットフォームです。
            エリア・カテゴリで絞り込んで、あなたの街の気になるお店を見つけましょう。
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/stores"
              className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition-colors text-sm shadow-sm"
            >
              お店を探す →
            </Link>
            <Link
              href="/for-owners"
              className="border border-gray-300 text-gray-600 font-medium px-8 py-3 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors text-sm"
            >
              掲載を検討する
            </Link>
          </div>
        </div>
      </section>

      {/* できること */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">NewOpenでできること</h2>
          <p className="text-center text-sm text-gray-500 mb-10">お店探しをもっとかんたんに、もっとたのしく</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <f.Icon className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">よくある質問</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-medium text-gray-900 hover:bg-orange-50 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-orange-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-2">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            その他のご質問は
            <Link href="/contact" className="text-orange-500 hover:underline mx-1">お問い合わせ</Link>
            よりどうぞ
          </p>
        </div>
      </section>

    </div>
  );
}
