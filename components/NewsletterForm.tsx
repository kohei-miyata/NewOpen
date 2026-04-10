"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { sendNewsletter, sendNewsletterTest } from "@/app/admin/actions";
import RichTextEditor from "@/components/RichTextEditor";

const TEST_EMAIL = "kohei.miyata.km@gmail.com";

export default function NewsletterForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [testTo, setTestTo]   = useState(TEST_EMAIL);
  const [result, setResult]   = useState<{ type: "send" | "test"; sent?: number; error?: string } | null>(null);
  const [isSending, startSend]     = useTransition();
  const [isTesting, startTest]     = useTransition();

  const fd = () => {
    const f = new FormData();
    f.set("subject", subject);
    f.set("body", body);
    return f;
  };

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startSend(async () => {
      const res = await sendNewsletter(fd());
      setResult({ type: "send", ...res });
      if (!res.error) { setSubject(""); setBody(""); }
    });
  }

  function handleTest() {
    setResult(null);
    const f = fd();
    f.set("testTo", testTo);
    startTest(async () => {
      const res = await sendNewsletterTest(f);
      setResult({ type: "test", ...res });
    });
  }

  const isPending = isSending || isTesting;

  return (
    <div className="space-y-5">
      {result && !result.error && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            {result.type === "test"
              ? `テストメールを ${testTo} に送信しました`
              : `${result.sent} 件のメール送信が完了しました`}
          </p>
        </div>
      )}
      {result?.error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{result.error}</p>
      )}

      <form onSubmit={handleSend} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* 件名 */}
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

        {/* 本文（リッチテキスト） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本文 <span className="text-red-500">*</span>
          </label>
          <RichTextEditor value={body} onChange={setBody} />
          <p className="text-xs text-gray-400 mt-1">末尾に「通知停止はマイページ設定から」の文が自動付加されます</p>
        </div>

        {/* テスト送信 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-blue-800">テスト送信</p>
          <div className="flex gap-2">
            <input
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="送信先メールアドレス"
              className="flex-1 border border-blue-200 bg-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
            <button
              type="button"
              onClick={handleTest}
              disabled={isPending || !subject.trim() || !body.trim() || !testTo.trim()}
              className="bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isTesting ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  送信中...
                </span>
              ) : "テスト送信"}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">本番送信前の確認</p>
          <p>・送信後の取り消しはできません</p>
          <p>・件名の先頭に「【NEW OPEN】」を含めることを推奨します</p>
        </div>

        <button
          type="submit"
          disabled={isPending || !subject.trim() || !body.trim()}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSending ? (
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
