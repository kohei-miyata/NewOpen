"use client";

import { useState } from "react";
import { submitContact } from "@/app/contact/actions";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR  = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm({ serverError }: { serverError?: string }) {
  const [errors, setErrors] = useState<Errors>({});

  function validate(fd: FormData): boolean {
    const e: Errors = {};
    const name    = (fd.get("name")    as string).trim();
    const email   = (fd.get("email")   as string).trim();
    const message = (fd.get("message") as string).trim();

    if (!name)    e.name    = "お名前を入力してください";
    if (!email)   e.email   = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                  e.email   = "正しいメールアドレスを入力してください";
    if (!message) e.message = "お問い合わせ内容を入力してください";
    else if (message.length < 10)
                  e.message = "10文字以上で入力してください";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const field = (k: keyof Errors) => errors[k] ? INPUT_ERROR : INPUT_NORMAL;

  return (
    <form
      action={submitContact}
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        if (!validate(fd)) e.preventDefault();
      }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5"
    >
      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {serverError === "missing" ? "すべての項目を入力してください" : serverError}
        </p>
      )}

      {/* 法人名・部署 (任意) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">法人名</label>
          <input name="company" className={INPUT_NORMAL} placeholder="株式会社〇〇" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">部署名</label>
          <input name="department" className={INPUT_NORMAL} placeholder="営業部" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          name="name" className={field("name")} placeholder="山田 太郎"
          onChange={() => setErrors((p) => ({ ...p, name: undefined }))}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          name="email" type="email" className={field("email")} placeholder="example@email.com"
          onChange={() => setErrors((p) => ({ ...p, email: undefined }))}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message" rows={5}
          className={`${field("message")} resize-none`}
          placeholder="ご質問・ご要望をご記入ください"
          onChange={() => setErrors((p) => ({ ...p, message: undefined }))}
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
      >
        送信する
      </button>
    </form>
  );
}
