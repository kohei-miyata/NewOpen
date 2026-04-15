"use client";

import { useState, useEffect, useRef } from "react";
import { signup } from "@/app/auth/actions";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import TermsContent from "@/components/TermsContent";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import LineAuthButton from "@/components/LineAuthButton";
import BirthdatePicker from "@/components/BirthdatePicker";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function TermsScrollBox({ onScrolled }: { onScrolled: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = boxRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      onScrolled();
    }
  }

  return (
    <div
      ref={boxRef}
      onScroll={handleScroll}
      className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 [&_h2]:text-xs [&_h2]:font-semibold [&_p]:text-xs [&_li]:text-xs [&_.space-y-6]:space-y-3"
    >
      <TermsContent />
    </div>
  );
}

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function SignupForm({ serverError, defaultRole = "user" }: { serverError?: string; defaultRole?: "user" | "owner" }) {
  const [role, setRole] = useState<"user" | "owner">(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    terms?: string;
    birthdate?: string;
    gender?: string;
  }>({});
  const loadedAt = useRef<number>(0);
  useEffect(() => { loadedAt.current = Date.now(); }, []);

  function validate(fd: FormData): boolean {
    const e: typeof errors = {};
    const name     = (fd.get("display_name") as string).trim();
    const email    = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm") as string;

    if (!name)  e.name  = "お名前を入力してください";
    if (name.length > 50) e.name = "お名前は50文字以内で入力してください";
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

    const gender = fd.get("gender") as string;
    if (!gender) e.gender = "性別を選択してください";

    const birthdate = fd.get("birthdate") as string;
    if (!birthdate) {
      e.birthdate = "生年月日を入力してください";
    } else {
      const d = new Date(birthdate);
      const now = new Date();
      const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
      if (age < 13) e.birthdate = "13歳未満の方はご登録いただけません";
      if (age > 120) e.birthdate = "正しい生年月日を入力してください";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      // 最初のエラーフィールドへスクロール
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>("[data-field-error='true']");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
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
        if (isSuspiciousBot(fd) || !validate(fd)) { e.preventDefault(); return; }
        setIsPending(true);
      }}
      noValidate
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

      {/* Google/LINE登録 */}
      <GoogleAuthButton label="Googleで登録" role={role} />
      <LineAuthButton label="LINEで登録" role={role} />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">またはメールアドレスで登録</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div data-field-error={!!errors.name || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          name="display_name" autoComplete="name"
          className={errors.name ? INPUT_ERROR : INPUT_NORMAL}
          placeholder="山田 太郎"
          onChange={() => setErrors((p) => ({ ...p, name: undefined }))}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div data-field-error={!!errors.email || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          name="email" type="email" autoComplete="email"
          className={errors.email ? INPUT_ERROR : INPUT_NORMAL}
          onChange={() => setErrors((p) => ({ ...p, email: undefined }))}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div data-field-error={!!errors.password || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード <span className="text-gray-400 font-normal">（英数字8文字以上）</span>
        </label>
        <div className="relative">
          <input
            name="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
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

      <div data-field-error={!!errors.confirm || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
        <div className="relative">
          <input
            name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
            className={`${errors.confirm ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
            onChange={() => setErrors((p) => ({ ...p, confirm: undefined }))}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
      </div>

      {/* 性別 */}
      <div data-field-error={!!errors.gender || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          性別 <span className="text-red-500">*</span>
        </label>
        <select
          name="gender"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${errors.gender ? "border-red-400 bg-red-50 focus:border-red-400" : "border-gray-300 focus:border-orange-400"}`}
          onChange={() => setErrors((p) => ({ ...p, gender: undefined }))}
        >
          <option value="">選択してください</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
          <option value="prefer_not_to_say">回答しない</option>
        </select>
        {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
      </div>

      {/* 生年月日 */}
      <div data-field-error={!!errors.birthdate || undefined}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          生年月日 <span className="text-red-500">*</span>
        </label>
        <BirthdatePicker
          name="birthdate"
          onChange={() => setErrors((p) => ({ ...p, birthdate: undefined }))}
          className={errors.birthdate ? "error" : ""}
        />
        {errors.birthdate && <p className="text-xs text-red-500 mt-1">{errors.birthdate}</p>}
      </div>

      {/* 利用規約同意 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">利用規約・プライバシーポリシー</p>
        <TermsScrollBox onScrolled={() => setTermsScrolled(true)} />
        {!termsScrolled && (
          <p className="text-xs text-gray-400 text-center">↓ 最後までスクロールすると同意できます</p>
        )}
        <label className={`flex items-start gap-2 ${termsScrolled ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}>
          <input
            type="checkbox"
            name="terms"
            value="1"
            disabled={!termsScrolled}
            className="mt-0.5 accent-orange-500"
            onChange={() => setErrors((p) => ({ ...p, terms: undefined }))}
          />
          <span className="text-sm text-gray-600">
            <a href={`${SITE_URL}/terms`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-medium">利用規約</a>
            {" "}および{" "}
            <a href={`${SITE_URL}/privacy`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-medium">プライバシーポリシー</a>
            に同意する
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            送信中...
          </span>
        ) : "登録する"}
      </button>

    </form>
  );
}
