"use client";

import { useState } from "react";

interface Props {
  name: string;
  onChange?: (value: string) => void;
  className?: string;
}

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i); // 13歳〜112歳

const SELECT = "border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white transition-colors";
const SELECT_ERROR = "border border-red-400 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-red-400 bg-red-50 transition-colors";

export default function BirthdatePicker({ name, onChange, className }: Props) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const hasError = className?.includes("ring-red") || className?.includes("error");

  const maxDay = year && month ? daysInMonth(Number(year), Number(month)) : 31;
  const DAYS = Array.from({ length: maxDay }, (_, i) => i + 1);

  // 月変更で日が範囲外になったらリセット
  function handleMonthChange(m: string) {
    setMonth(m);
    if (day && year && m) {
      const max = daysInMonth(Number(year), Number(m));
      if (Number(day) > max) setDay("");
    }
    emitChange(year, m, day);
  }

  function handleYearChange(y: string) {
    setYear(y);
    emitChange(y, month, day);
  }

  function handleDayChange(d: string) {
    setDay(d);
    emitChange(year, month, d);
  }

  function emitChange(y: string, m: string, d: string) {
    if (y && m && d) {
      const mm = m.padStart(2, "0");
      const dd = d.padStart(2, "0");
      onChange?.(`${y}-${mm}-${dd}`);
    } else {
      onChange?.("");
    }
  }

  const value = year && month && day
    ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    : "";

  const sel = hasError ? SELECT_ERROR : SELECT;

  return (
    <div className={`flex gap-2 ${className ?? ""}`}>
      <input type="hidden" name={name} value={value} />
      <select
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        className={`${sel} w-28`}
        aria-label="年"
      >
        <option value="">年</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}年</option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => handleMonthChange(e.target.value)}
        className={`${sel} w-20`}
        aria-label="月"
      >
        <option value="">月</option>
        {MONTHS.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>
      <select
        value={day}
        onChange={(e) => handleDayChange(e.target.value)}
        className={`${sel} w-16`}
        aria-label="日"
      >
        <option value="">日</option>
        {DAYS.map((d) => (
          <option key={d} value={d}>{d}日</option>
        ))}
      </select>
    </div>
  );
}
