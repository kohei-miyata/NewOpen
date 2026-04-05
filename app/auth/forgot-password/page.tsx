"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "@/app/auth/actions";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function ForgotPasswordPage() {
  const params = useSearchParams();
  const success = params.get("success") === "1";

  const [emailError, setEmailError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function validate(fd: FormData): boolean {
    const email = (fd.get("email") as string).trim();
    if (!email) { setEmailError("メールアドレスを入力してください"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("正しいメールアドレスの形式で入力してください"); return false; }
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!validate(fd)) return;
    setSubmitting(true);
    setServerError(undefined);
    const result = await forgotPassword(fd);
    if (result?.error) {
      setServerError(result.error);
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-4">
          <EnvelopeIcon className="w-12 h-12 text-orange-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">メールを送信しました</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            パスワード再設定用のリンクをメールに送信しました。<br />
            メールをご確認ください。
          </p>
          <p className="text-xs text-gray-400">メールが届かない場合は、迷惑メールフォルダをご確認ください。</p>
          <Link href="/auth/login" className="inline-block text-sm text-orange-500 hover:underline">
            ログインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">パスワードをお忘れの方</h1>
          <p className="text-sm text-gray-500 mt-2">登録済みのメールアドレスを入力してください。<br />パスワード再設定用のリンクをお送りします。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              name="email" type="email" autoComplete="email"
              className={emailError ? INPUT_ERROR : INPUT_NORMAL}
              onChange={() => setEmailError(undefined)}
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                送信中...
              </span>
            ) : "再設定メールを送信する"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/auth/login" className="text-orange-500 hover:underline">ログインページに戻る</Link>
        </p>
      </div>
    </div>
  );
}
