import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coming Soon | NewOpen" };

export default function ComingSoonPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-white"
      style={{
        background: "linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #fde68a 100%)",
      }}
    >
      {/* ドットパターン */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative text-center space-y-8 max-w-lg">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center text-3xl font-black" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
            N
          </div>
          <span className="text-5xl font-black tracking-widest drop-shadow-sm" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
            EW OPEN
          </span>
        </div>

        {/* メッセージ */}
        <div className="space-y-3">
          <p className="text-2xl font-bold drop-shadow-sm">まもなくリリース</p>
          <p className="text-base opacity-85 leading-relaxed">
            あなたの街の新規オープン情報をいち早くお届けする<br />
            新しいサービスを準備中です。
          </p>
        </div>

        {/* オーナー向け導線 */}
        <div className="bg-white/20 border border-white/40 rounded-2xl p-6 space-y-3 backdrop-blur-sm">
          <p className="text-sm font-bold opacity-90">お店のオーナー様へ</p>
          <p className="text-xs opacity-80 leading-relaxed">
            リリース前でも店舗の登録が可能です。<br />
            オープン情報をいち早く掲載しませんか？
          </p>
          <Link
            href="/for-owners"
            className="inline-block bg-white text-orange-500 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-orange-50 transition-colors shadow"
          >
            無料で掲載を検討する →
          </Link>
        </div>
      </div>
    </div>
  );
}
