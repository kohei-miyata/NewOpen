"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import confetti from "canvas-confetti";

const STORAGE_KEY = "newopen_announcement_seen_v1";

function fireConfetti() {
  // 左右からクラッカー
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors: ["#f97316", "#fbbf24", "#fb923c", "#fff", "#fdba74"],
  });
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors: ["#f97316", "#fbbf24", "#fb923c", "#fff", "#fdba74"],
  });
  // 少し遅れて中央から追加
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 80,
      origin: { x: 0.5, y: 0.4 },
      colors: ["#f97316", "#fbbf24", "#fdba74"],
    });
  }, 300);
}

export default function AnnouncementModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SHOW_ANNOUNCEMENT_MODAL !== "true") return;
    if (pathname !== "/") return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
        // モーダル表示と同時にクラッカー
        setTimeout(fireConfetti, 200);
      }
    } catch {
      // localStorage が使えない環境はスキップ
    }
  }, [pathname]);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">

        {/* ヘッダー帯 */}
        <div className="relative bg-gradient-to-r from-orange-500 to-amber-400 px-6 pt-8 pb-6 text-white text-center overflow-hidden">
          {/* 装飾ドット */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

          <button
            onClick={close}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="閉じる"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>

          <p className="text-3xl mb-2">🎉</p>
          <p className="text-xs font-semibold opacity-80 tracking-widest uppercase mb-1">Grand Open</p>
          <h2 className="text-2xl font-extrabold leading-snug">
            NewOpen オープン！
          </h2>
          <p className="text-sm opacity-85 mt-1 font-medium">
            あなたの街の新規オープン情報をお届けします
          </p>
        </div>

        {/* 本文 */}
        <div className="px-6 py-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            レストラン・カフェ・美容院・ジムなど、気になる新しいお店を<span className="font-bold text-orange-500">エリア・カテゴリ</span>から簡単に探せます。
          </p>
          <ul className="space-y-1.5 text-gray-600">
            {[
              "お気に入り登録で気になるお店をチェック",
              "オープン記念クーポンをお得にゲット",
              "カレンダーでオープン予定日を把握",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2">
                <span className="text-orange-400 font-bold mt-0.5">✓</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-xs text-orange-800 leading-relaxed">
            本サービスは<span className="font-bold">3年間限定</span>。オープンしたてのお店をいち早く知ることで、話題になる前に<span className="font-bold">流行を先取り</span>できます。
          </div>
        </div>

        {/* フッターボタン */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <Link
            href="/stores"
            onClick={close}
            className="block w-full text-center bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition-colors text-sm shadow-md"
          >
            さっそくお店を探す →
          </Link>
          <button
            onClick={close}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            後で見る
          </button>
        </div>
      </div>
    </div>
  );
}
