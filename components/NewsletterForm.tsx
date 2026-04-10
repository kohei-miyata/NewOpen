"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { sendNewsletter } from "@/app/admin/actions";

export default function NewsletterForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [result, setResult]   = useState<{ sent?: number; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("body", body);
    startTransition(async () => {
      const res = await sendNewsletter(fd);
      setResult(res);
      if (!res.error) { setSubject(""); setBody(""); }
    });
  }

  return (
    <div className="space-y-5">
      {result?.sent !== undefined && !result.error && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-800 font-medium">{result.sent} 件のメール送信が完了しました</p>
        </div>
      )}
      {result?.error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{result.error}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            件名 <span className="text-red-500">*</span>
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="例：【NEW OPEN】今月のおすすめ新規オープン店舗"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本文 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="メール本文を入力してください。改行はそのまま反映されます。"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">末尾に「通知停止はマイページ設定から」の文が自動付加されます</p>
        </div>

        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">送信前の確認</p>
          <p>・送信後の取り消しはできません</p>
          <p>・件名の先頭に「【NEW OPEN】」を含めることを推奨します</p>
        </div>

        <button
          type="submit"
          disabled={isPending || !subject.trim() || !body.trim()}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              送信中...
            </span>
          ) : "一斉送信する"}
        </button>
      </form>
    </div>
  );
}
