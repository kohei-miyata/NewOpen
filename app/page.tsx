import Link from "next/link";
import type { Metadata } from "next";
import { getStores, getRankedStores, getCoupons, getComingSoonStores } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import CouponCard from "@/components/CouponCard";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import TopStoresSections from "@/components/TopStoresSections";

export const metadata: Metadata = {
  title: "NewOpen | あなたの街の新規オープン情報",
  description: "新規オープン店舗をいち早くチェック。レストラン・カフェ・スイーツ・美容院など、あなたの街の最新オープン情報をお届けします。",
  openGraph: {
    title: "NewOpen | あなたの街の新規オープン情報",
    description: "新規オープン店舗をいち早くチェック。あなたの街の最新オープン情報をお届けします。",
    type: "website",
  },
};

export default async function Home() {
  const [allStores, ranked, coupons, comingSoon] = await Promise.all([
    getStores(),
    getRankedStores(),
    getCoupons(),
    getComingSoonStores(),
  ]);

  const topStores = ranked.slice(0, 3);
  const latestCoupons = coupons.slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
            🎉 新規オープン情報プラットフォーム
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center gap-3">
            <svg width="72" height="72" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.25"/>
              <circle cx="20" cy="20" r="17" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
              <text x="20" y="27" textAnchor="middle" dominantBaseline="auto" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="24" fill="white">N</text>
            </svg>
            EW OPEN
          </h1>
          <p className="mt-4 text-xl sm:text-2xl opacity-90 font-medium">
            あなたの街の<span className="font-extrabold underline decoration-white/60 decoration-2">新規オープン</span>情報をいち早くお届け
          </p>
          <p className="mt-2 text-sm opacity-75">レストラン・カフェ・美容院・ジムなど、気になるお店が見つかる</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/stores"
              className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg text-sm"
            >
              お店を探す →
            </Link>
            <Link
              href="#for-owners"
              className="bg-white/20 backdrop-blur border border-white/40 text-white font-bold px-8 py-3 rounded-full hover:bg-white/30 transition-colors text-sm"
            >
              掲載を検討する
            </Link>
          </div>

          {/* 統計バー */}
          <div className="mt-12 flex justify-center gap-8 sm:gap-16 flex-wrap text-center">
            <div>
              <p className="text-3xl font-extrabold">{allStores.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">掲載店舗数</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{comingSoon.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">まもなくオープン</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">{coupons.length}+</p>
              <p className="text-xs opacity-75 mt-0.5">お得なクーポン</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 特徴（ユーザー向け） ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">NewOpenでできること</h2>
          <p className="text-center text-sm text-gray-500 mb-10">お店探しをもっとかんたんに、もっとたのしく</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🗺️", title: "エリアから探す", desc: "渋谷・新宿・銀座など、街や駅名で新規オープン店舗を絞り込んで検索。" },
              { icon: "🏷️", title: "カテゴリで絞り込む", desc: "レストラン・カフェ・スイーツ・美容院・ジムなど9カテゴリから探せる。" },
              { icon: "🎟️", title: "お得なクーポン", desc: "オープン記念クーポンをGETして、お得に新しいお店を体験しよう。" },
              { icon: "📅", title: "オープン前から掲載", desc: "「まもなくオープン」として30日前から告知。話題を先取りしよう。" },
              { icon: "📆", title: "3年間継続掲載", desc: "他サービスと違い、オープンから3年間ずっと情報が残り続ける。" },
              { icon: "🆓", title: "すべて完全無料", desc: "掲載・編集・クーポン発行・SNS埋め込みもすべて0円。" },
            ].map((f) => (
              <div key={f.title} className="bg-orange-50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* ── 最近見たお店 ── */}
        <RecentlyViewedSection />

        {/* ── まもなくオープン・最新オープン（現在地ソート） ── */}
        <TopStoresSections allStores={allStores} comingSoon={comingSoon} />

        {/* ── ランキング ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">❤️ いいね！ランキング TOP3</h2>
              <p className="text-xs text-gray-500 mt-0.5">みんなが気になっているお店</p>
            </div>
            <Link href="/ranking" className="text-sm text-orange-500 hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStores.map((store, i) => (
              <StoreCard key={store.id} store={store} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* ── クーポン ── */}
        {latestCoupons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">🎟️ お得なクーポン</h2>
                <p className="text-xs text-gray-500 mt-0.5">新規オープン記念の特別クーポン</p>
              </div>
              <Link href="/coupons" className="text-sm text-orange-500 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── オーナー向けLP ── */}
      <section id="for-owners" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 mt-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide">
            店舗オーナー様へ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            新規オープンを、<br className="sm:hidden" />もっと多くの人に届けよう
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            NewOpenに掲載することで、エリアのユーザーにオープン情報をダイレクトに届けられます。
            SNS投稿の埋め込みや写真ギャラリーで、お店の魅力を最大限アピール。
          </p>

          {/* メリット一覧 */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "📣", title: "無料で掲載できる", desc: "基本掲載は完全無料。オープン前から「まもなくオープン」として告知できます。" },
              { icon: "📸", title: "SNS投稿を埋め込み", desc: "X・Instagram・TikTokの最新投稿を店舗ページに自動表示。フォロワー獲得にも。" },
              { icon: "🎟️", title: "クーポンで集客", desc: "オープン記念クーポンを発行して、初来店のハードルを下げましょう。" },
            ].map((m) => (
              <div key={m.title} className="bg-white/10 rounded-2xl p-5">
                <div className="text-3xl mb-2">{m.icon}</div>
                <h3 className="font-bold mb-1">{m.title}</h3>
                <p className="text-sm text-gray-300">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* ステップ */}
          <div className="mt-14">
            <h3 className="text-lg font-bold mb-6 text-gray-100">掲載までの流れ</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {[
                { step: "1", label: "アカウント登録", sub: "オーナーとして無料登録" },
                { step: "2", label: "店舗情報を入力", sub: "写真・SNS・営業時間など" },
                { step: "3", label: "掲載スタート", sub: "すぐに公開されます" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-lg mx-auto">
                      {s.step}
                    </div>
                    <p className="font-semibold mt-2 text-sm">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                  {i < 2 && <span className="text-gray-500 text-xl hidden sm:block">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/signup"
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

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: "掲載は本当に無料ですか？", a: "はい、基本掲載は完全無料です。店舗名・住所・写真・SNS情報などを無料で掲載できます。" },
              { q: "オープン前から掲載できますか？", a: "はい、「まもなくオープン」として30日前から告知掲載が可能です。" },
              { q: "掲載内容はいつでも変更できますか？", a: "オーナーアカウントのマイページからいつでも編集・更新できます。" },
              { q: "どのSNSに対応していますか？", a: "X（Twitter）・Instagram・TikTok・LINE公式アカウント・公式サイトのリンクと、X/Instagram/TikTokの投稿埋め込みに対応しています。" },
            ].map((faq) => (
              <details key={faq.q} className="border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center px-5 py-4 cursor-pointer font-medium text-gray-900 hover:bg-orange-50 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-orange-500 text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
