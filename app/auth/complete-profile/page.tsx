"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { completeProfile } from "./actions";
import BirthdatePicker from "@/components/BirthdatePicker";
import ScrollToTop from "@/components/ScrollToTop";

const SELECT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors";

const PROVIDER_MESSAGES: Record<string, string> = {
  line:   "LINEアカウントで登録ありがとうございます。",
  google: "Googleアカウントで登録ありがとうございます。",
};

export default function CompleteProfilePage() {
  const [state, action, isPending] = useActionState(completeProfile, undefined);
  const [genderTouched, setGenderTouched] = useState(false);
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? "google";
  const message = PROVIDER_MESSAGES[provider] ?? "アカウントの登録ありがとうございます。";

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <ScrollToTop />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-extrabold text-orange-500">NewOpen</p>
          <p className="text-sm text-gray-500 mt-1">プロフィールを完成させましょう</p>
        </div>

        <form
          action={action}
          noValidate
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5"
        >
          <p className="text-sm text-gray-600">
            {message}<br />
            あと少しで完了です。
          </p>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          {/* 性別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別 <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              className={genderTouched ? SELECT : SELECT}
              onChange={() => setGenderTouched(true)}
              defaultValue=""
            >
              <option value="" disabled>選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
              <option value="prefer_not_to_say">回答しない</option>
            </select>
          </div>

          {/* 生年月日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <BirthdatePicker name="birthdate" />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                保存中...
              </span>
            ) : "登録を完了する"}
          </button>

        </form>
      </div>
    </div>
  );
}
