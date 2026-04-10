"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateDisplayName } from "@/app/auth/actions";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const INPUT = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors";
const INPUT_NORMAL = `${INPUT} border-gray-300 focus:border-orange-400`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 bg-red-50`;

export default function ChangeNamePage() {
  const params = useSearchParams();
  const success = params.get("success") === "1";

  const [error, setError] = useState<string | undefined>();
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("display_name") as string).trim();
    if (!name) { setFieldError("お名前を入力してください"); return; }
    if (name.length > 50) { setFieldError("お名前は50文字以内で入力してください"); return; }

    setSubmitting(true);
    setError(undefined);
    const result = await updateDisplayName(fd);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-4">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900">お名前を変更しました</h1>
          <Link href="/mypage" className="inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm">
            マイページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/mypage/settings" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← 設定に戻る</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">お名前を変更する</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              name="display_name"
              autoComplete="name"
              placeholder="山田 太郎"
              className={fieldError ? INPUT_ERROR : INPUT_NORMAL}
              onChange={() => setFieldError(undefined)}
            />
            {fieldError && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                変更中...
              </span>
            ) : "お名前を変更する"}
          </button>
        </form>
      </div>
    </div>
  );
}
