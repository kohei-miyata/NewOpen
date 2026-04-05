import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "オーナーの方へ | 無料で店舗を掲載",
  description: "NewOpenへの無料掲載でオープン情報をエリアのユーザーに届けましょう。SNS埋め込み・クーポン発行・写真ギャラリーも完全無料。",
};

const MERITS = [
  { icon: "📣", title: "無料で掲載できる", desc: "基本掲載は完全無料。オープン前から「まもなくオープン」として告知できます。" },
  { icon: "📸", title: "SNS投稿を埋め込み", desc: "X・Instagram・TikTokの最新投稿を店舗ページに自動表示。フォロワー獲得にも。" },
  { icon: "🎟️", title: "クーポンで集客", desc: "オープン記念クーポンを発行して、初来店のハードルを下げましょう。" },
  { icon: "📆", title: "3年間継続掲載", desc: "オープンから3年間、情報が残り続けます。他サービスとの差別化ポイントです。" },
  { icon: "🗺️", title: "エリア検索で露出", desc: "ユーザーがエリア・カテゴリで検索した際に表示。地元のお客様に届きます。" },
  { icon: "✏️", title: "いつでも編集可能", desc: "営業時間・写真・SNSリンクなど、オーナーページからいつでも更新できます。" },
];

const STEPS = [
  { step: "1", label: "アカウント登録", sub: "オーナーとして無料登録" },
  { step: "2", label: "店舗情報を入力", sub: "写真・SNS・営業時間など" },
  { step: "3", label: "掲載スタート", sub: "すぐに公開されます" },
];

const FAQS = [
  { q: "本当に無料ですか？", a: "はい、完全無料です。掲載・編集・クーポン発行・SNS埋め込みもすべて0円です。" },
  { q: "オープン前から掲載できますか？", a: "はい、オープン30日前から「まもなくオープン」として掲載できます。事前に話題を作りましょう。" },
  { q: "掲載審査はありますか？", a: "登録後すぐに公開されます。ただし、規約に違反するコンテンツは削除する場合があります。" },
  { q: "複数店舗の登録は可能ですか？", a: "はい、1アカウントで複数店舗を登録・管理できます。" },
];

export default function ForOwnersPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide">
            店舗オーナー様へ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
            新規オープンを、<br className="sm:hidden" />もっと多くの人に届けよう
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            NewOpenに掲載することで、エリアのユーザーにオープン情報をダイレクトに届けられます。
            SNS投稿の埋め込みや写真ギャラリーで、お店の魅力を最大限アピール。
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup?role=owner"
              className="bg-orange-500 text-white font-bold px-10 py-3.5 rounded-full hover:bg-orange-600 transition-colors shadow-lg text-sm"
            >
              無料でオーナー登録する →
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              お問い合わせ
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">クレジットカード不要・無料で始められます</p>
        </div>
      </section>

      {/* メリット */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">掲載するメリット</h2>
          <p className="text-center text-sm text-gray-500 mb-10">集客をサポートする機能がすべて無料</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {MERITS.map((m) => (
              <div key={m.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-4xl mb-3">{m.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                <p className="text-sm text-gray-600">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 掲載の流れ */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">掲載までの流れ</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-md">
                    {s.step}
                  </div>
                  <p className="font-semibold mt-3 text-sm text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="text-gray-300 text-2xl hidden sm:block">→</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/auth/signup?role=owner"
              className="inline-block bg-orange-500 text-white font-bold px-10 py-3.5 rounded-full hover:bg-orange-600 transition-colors shadow-md text-sm"
            >
              無料でオーナー登録する →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">よくある質問</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
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
