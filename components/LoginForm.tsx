"use client";

import { useState } from "react";
import { login } from "@/app/auth/actions";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function LoginForm({ serverError }: { serverError?: string }) {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate(fd: FormData): boolean {
    const e: typeof errors = {};
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;

    if (!email) {
      e.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "正しいメールアドレスの形式で入力してください";
    }
    if (!password) {
      e.password = "パスワードを入力してください";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <form
      action={login}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        if (!validate(fd)) { e.preventDefault(); return; }
        setSubmitting(true);
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
    >
      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          name="email" type="email" autoComplete="email"
          className={errors.email ? INPUT_ERROR : INPUT_NORMAL}
          onChange={() => setErrors((p) => ({ ...p, email: undefined }))}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
        <div className="relative">
          <input
            name="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
            className={`${errors.password ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
            onChange={() => setErrors((p) => ({ ...p, password: undefined }))}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ログイン中...
          </span>
        ) : "ログイン"}
      </button>
    </form>
  );
}
