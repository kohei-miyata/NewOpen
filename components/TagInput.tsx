"use client";

import { useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  name: string;
  defaultValue?: string[];
}

export default function TagInput({ name, defaultValue = [] }: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const trimmed = raw.trim().replace(/^[,、]+|[,、]+$/g, "");
    if (!trimmed) return;
    const newTags = trimmed.split(/[,、]/).map((t) => t.trim()).filter(Boolean);
    setTags((prev) => {
      const merged = [...prev];
      newTags.forEach((t) => { if (!merged.includes(t)) merged.push(t); });
      return merged;
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  // keyup はIME確定後に発火するので1回のEnterで処理できる
  function onKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addTag(inputRef.current?.value ?? "");
    }
    if (e.key === "Backspace" && !inputRef.current?.value && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.preventDefault(); // フォーム送信を防ぐ
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(",") || val.endsWith("、")) {
      addTag(val);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={tags.join(", ")} />
      <div
        className="min-h-[42px] w-full border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 items-center focus-within:border-orange-400 cursor-text transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="hover:text-orange-900 transition-colors"
              aria-label={`${tag}を削除`}
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onChange={onChange}
          onBlur={() => addTag(inputRef.current?.value ?? "")}
          placeholder={tags.length === 0 ? "例: テラス席あり, 個室あり, テイクアウト可（Enterで追加）" : ""}
          className="flex-1 min-w-[180px] text-sm outline-none bg-transparent placeholder:text-gray-400"
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Enter またはカンマで追加、×で削除</p>
    </div>
  );
}
