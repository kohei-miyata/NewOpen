"use client";

import { useFormStatus } from "react-dom";

const Spinner = () => (
  <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
);

export function ApproveSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-green-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> 送信中...
        </span>
      ) : "✓ 承認する（自動でオーナーにメール送信）"}
    </button>
  );
}

export function RejectSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-red-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> 送信中...
        </span>
      ) : "否認してメールを送信"}
    </button>
  );
}

export function PendingSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-gray-400/40 border-t-gray-500 rounded-full animate-spin" />
          処理中...
        </span>
      ) : "審査待ちに戻す"}
    </button>
  );
}
