"use client";

import { useState, useEffect, useRef } from "react";
import { signup } from "@/app/auth/actions";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function SignupForm({ serverError, defaultRole = "user" }: { serverError?: string; defaultRole?: "user" | "owner" }) {
  const [role, setRole] = useState<"user" | "owner">(defaultRole);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
    terms?: string;
    birthdate?: string;
  }>({});
  const loadedAt = useRef<number>(0);
  useEffect(() => { loadedAt.current = Date.now(); }, []);

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

    if (!(fd.get("terms") as string)) e.terms = "利用規約への同意が必要です";

    const birthdate = fd.get("birthdate") as string;
    if (birthdate) {
      const d = new Date(birthdate);
      const now = new Date();
      const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
      if (age < 13) e.birthdate = "13歳未満の方はご登録いただけません";
      if (age > 120) e.birthdate = "正しい生年月日を入力してください";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function isSuspiciousBot(fd: FormData): boolean {
    // ハニーポット: 人間は入力しない隠しフィールド
    if ((fd.get("website_url") as string)?.trim()) return true;
    // 速度チェック: 3秒未満は bot の疑い
    if (Date.now() - loadedAt.current < 3000) return true;
    return false;
  }

  return (
    <form
      action={signup}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        if (isSuspiciousBot(fd) || !validate(fd)) e.preventDefault();
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4"
    >
      {/* ハニーポット: botが入力するが人間には見えない */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true" tabIndex={-1}>
        <input name="website_url" type="text" autoComplete="off" tabIndex={-1} />
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      {/* ロール選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">登録区分</label>
        <div className="flex gap-2">
          {(["user", "owner"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                role === r
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
              }`}
            >
              {r === "user" ? "一般ユーザー" : "オーナー"}
            </button>
          ))}
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

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

      {/* 性別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          性別 <span className="text-gray-400 font-normal">（任意）</span>
        </label>
        <select name="gender" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors">
          <option value="">選択しない</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
          <option value="prefer_not_to_say">回答しない</option>
        </select>
      </div>

      {/* 生年月日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          生年月日 <span className="text-gray-400 font-normal">（任意）</span>
        </label>
        <input
          name="birthdate"
          type="date"
          className={errors.birthdate
            ? "w-full border border-red-400 bg-red-50 rounded-lg px-3 py-2 text-sm focus:outline-none"
            : "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
          }
          max={new Date().toISOString().split("T")[0]}
          onChange={() => setErrors((p) => ({ ...p, birthdate: undefined }))}
        />
        {errors.birthdate && <p className="text-xs text-red-500 mt-1">{errors.birthdate}</p>}
      </div>

      {/* 利用規約同意 */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="terms"
            value="1"
            className="mt-0.5 accent-orange-500"
            onChange={() => setErrors((p) => ({ ...p, terms: undefined }))}
          />
          <span className="text-sm text-gray-600">
            <a href="/terms" target="_blank" className="text-orange-500 hover:underline font-medium">利用規約</a>
            {" "}および{" "}
            <a href="/privacy" target="_blank" className="text-orange-500 hover:underline font-medium">プライバシーポリシー</a>
            に同意する
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
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
