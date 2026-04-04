"use client";

import { useFormStatus } from "react-dom";

interface Props {
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export default function SubmitButton({
  label = "保存する",
  loadingLabel = "保存中...",
  className = "w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
