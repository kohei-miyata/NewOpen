"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ja } from "react-day-picker/locale";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import "react-day-picker/style.css";

interface Props {
  name: string;
  defaultValue?: string; // "YYYY-MM-DD"
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function parseDate(str?: string): Date | undefined {
  if (!str) return undefined;
  const d = new Date(str);
  return isNaN(d.getTime()) ? undefined : d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatJP(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function DatePicker({ name, defaultValue, disabled, required, onChange, minDate, maxDate, className }: Props) {
  const [selected, setSelected] = useState<Date | undefined>(parseDate(defaultValue));
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(parseDate(defaultValue) ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // 外クリックで閉じる
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(day: Date | undefined) {
    setSelected(day);
    setOpen(false);
    if (day) onChange?.(formatDate(day));
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* hidden input でフォームに値を渡す */}
      <input type="hidden" name={name} value={selected ? formatDate(selected) : ""} />

      {/* トリガーボタン */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-left transition-colors
          ${disabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : open
              ? "border-orange-400 bg-white"
              : "border-gray-300 bg-white hover:border-orange-300"
          }`}
      >
        <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? formatJP(selected) : "日付を選択"}
        </span>
      </button>

      {/* カレンダーポップオーバー */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <DayPicker
            mode="single"
            locale={ja}
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            required={required}
            classNames={{
              root: "p-3",
              month_caption: "flex items-center justify-between px-2 mb-2",
              caption_label: "text-sm font-bold text-gray-900",
              nav: "flex items-center gap-1",
              button_previous: "p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors",
              button_next: "p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors",
              weekdays: "flex",
              weekday: "flex-1 text-center text-xs text-gray-400 font-medium py-1",
              weeks: "space-y-0.5",
              week: "flex",
              day: "flex-1 flex items-center justify-center",
              day_button: "w-8 h-8 rounded-full text-sm hover:bg-orange-100 transition-colors",
              selected: "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:hover:bg-orange-600",
              today: "[&>button]:font-bold [&>button]:text-orange-500",
              disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
              outside: "[&>button]:text-gray-300",
            }}
          />
        </div>
      )}
    </div>
  );
}
