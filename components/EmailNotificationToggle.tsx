"use client";

import { useTransition, useState } from "react";
import { updateEmailNotifications } from "@/app/auth/actions";
import { BellIcon } from "@heroicons/react/24/outline";

export default function EmailNotificationToggle({ defaultEnabled }: { defaultEnabled: boolean }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await updateEmailNotifications(next);
      if (result?.error) setEnabled(!next); // rollback
    });
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b">
      <BellIcon className="w-5 h-5 text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium">新規オープン通知メール</span>
        <span className="block text-xs text-gray-400">
          {enabled ? "新規店舗承認時にメールでお知らせします" : "メール通知はオフです"}
        </span>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-checked={enabled}
        role="switch"
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          enabled ? "bg-orange-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
