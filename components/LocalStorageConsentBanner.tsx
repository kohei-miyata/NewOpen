"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "newopen_ls_consent";
const CONSENT_DAYS = 365;

export default function LocalStorageConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem(CONSENT_KEY);
    if (!val) {
      setVisible(true);
      return;
    }
    // 期限切れチェック
    if (Date.now() > Number(val)) {
      localStorage.removeItem(CONSENT_KEY);
      setVisible(true);
    }
  }, []);

  function accept() {
    const expires = Date.now() + CONSENT_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(CONSENT_KEY, String(expires));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-xs text-gray-600 flex-1">
          当サービスは「最近見たお店」の表示のためにブラウザの
          <strong>ローカルストレージ</strong>
          を使用します。個人を特定する情報は保存されず、第三者への提供もありません。
          詳しくは
          <Link href="/privacy" className="text-orange-500 hover:underline mx-1">
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-orange-500 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-orange-600 transition-colors"
        >
          同意して閉じる
        </button>
      </div>
    </div>
  );
}
