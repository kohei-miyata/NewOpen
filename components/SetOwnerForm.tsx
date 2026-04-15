"use client";

import { useActionState } from "react";
import { setStoreOwner } from "@/app/admin/actions";

export function SetOwnerForm({
  storeId,
  currentOwner,
}: {
  storeId: string;
  currentOwner: string;
}) {
  const [state, action, pending] = useActionState(setStoreOwner, null);

  return (
    <form action={action} className="flex items-center gap-1 mt-1">
      <input type="hidden" name="storeId" value={storeId} />
      <input
        name="email"
        type="email"
        defaultValue={currentOwner.includes("@") ? currentOwner : ""}
        placeholder="オーナーのメールアドレス"
        className="border border-gray-300 rounded px-2 py-1 text-xs w-48 focus:outline-none focus:border-orange-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {pending ? "..." : "設定"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </form>
  );
}
