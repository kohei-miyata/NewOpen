"use client";

import { useFormStatus } from "react-dom";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { replyToContact } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          送信中...
        </span>
      ) : (
        "メールで返信を送信"
      )}
    </button>
  );
}

interface Props {
  contactId: string;
  contactName: string;
}

export default function ContactReplyForm({ contactId, contactName }: Props) {
  return (
    <details className="border-t border-gray-100 group">
      <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors select-none list-none flex items-center gap-1.5">
        <EnvelopeIcon className="w-4 h-4" />
        返信する
      </summary>
      <form action={replyToContact} className="px-5 pb-4 pt-3 space-y-3 border-t border-orange-100 bg-orange-50">
        <input type="hidden" name="contactId" value={contactId} />

        <div className="bg-white border border-orange-200 rounded-lg px-4 py-3 text-sm text-gray-500 space-y-1">
          <p>{contactName} 様</p>
          <p>いつもNEW OPENをご利用いただきありがとうございます。</p>
        </div>

        <textarea
          name="replyBody"
          rows={5}
          required
          placeholder="返信内容を入力..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
        />

        <div className="text-xs text-gray-400">
          送信時に「{contactName} 様、いつもNEW OPENをご利用いただきありがとうございます。」が自動で付加されます。
        </div>

        <SubmitButton />
      </form>
    </details>
  );
}
