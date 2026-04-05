"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/auth/actions";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors pr-10";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const success = params.get("success") === "1";

  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(fd: FormData): boolean {
    const e: typeof errors = {};
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    if (!password || password.length < 6) e.password = "パスワードは6文字以上で入力してください";
    if (!confirm) e.confirm = "確認用パスワードを入力してください";
    else if (password !== confirm) e.confirm = "パスワードが一致しません";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!validate(fd)) return;
    setSubmitting(true);
    setServerError(undefined);
    const result = await resetPassword(fd);
    if (result?.error) {
      setServerError(result.error);
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-4">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">パスワードを再設定しました</h1>
          <p className="text-sm text-gray-500">新しいパスワードでログインできます。</p>
          <Link href="/auth/login" className="inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm">
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">パスワードの再設定</h1>
          <p className="text-sm text-gray-500 mt-2">新しいパスワードを入力してください。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード</label>
            <div className="relative">
              <input
                name="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                className={errors.password ? INPUT_ERROR : INPUT_NORMAL}
                onChange={() => setErrors((p) => ({ ...p, password: undefined }))}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新しいパスワード（確認）</label>
            <div className="relative">
              <input
                name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                className={errors.confirm ? INPUT_ERROR : INPUT_NORMAL}
                onChange={() => setErrors((p) => ({ ...p, confirm: undefined }))}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                再設定中...
              </span>
            ) : "パスワードを再設定する"}
          </button>
        </form>
      </div>
    </div>
  );
}
