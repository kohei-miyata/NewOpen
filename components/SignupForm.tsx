"use client";

import { useState } from "react";
import { signup } from "@/app/auth/actions";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function SignupForm({ serverError }: { serverError?: string }) {
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  function validate(fd: FormData): boolean {
    const e: typeof errors = {};
    const email    = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm") as string;

    if (!email) {
      e.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "正しいメールアドレスの形式で入力してください";
    }
    if (!password) {
      e.password = "パスワードを入力してください";
    } else if (password.length < 8) {
      e.password = "パスワードは8文字以上で入力してください";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = "パスワードは英字と数字を含めてください";
    }
    if (!confirm) {
      e.confirm = "確認用パスワードを入力してください";
    } else if (confirm !== password) {
      e.confirm = "パスワードが一致しません";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <form
      action={signup}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        if (!validate(fd)) e.preventDefault();
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード <span className="text-gray-400 font-normal">（英数字8文字以上）</span>
        </label>
        <input
          name="password" type="password" autoComplete="new-password"
          className={errors.password ? INPUT_ERROR : INPUT_NORMAL}
          onChange={() => setErrors((p) => ({ ...p, password: undefined }))}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
        <input
          name="confirm" type="password" autoComplete="new-password"
          className={errors.confirm ? INPUT_ERROR : INPUT_NORMAL}
          onChange={() => setErrors((p) => ({ ...p, confirm: undefined }))}
        />
        {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
      >
        登録する
      </button>
    </form>
  );
}
