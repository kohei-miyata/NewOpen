"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  photos: string[];
  storeName: string;
  onClick?: () => void;
}

export default function StoreCardSlider({ photos, storeName, onClick }: Props) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((i) => (i - 1 + photos.length) % photos.length);
    },
    [photos.length]
  );

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrent((i) => (i + 1) % photos.length);
    },
    [photos.length]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 10) {
      isDragging.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0
        ? setCurrent((i) => (i + 1) % photos.length)
        : setCurrent((i) => (i - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  if (photos.length === 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
        alt={storeName}
        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  return (
    <div
      className="relative w-full h-44 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[current]}
        alt={`${storeName} ${current + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        draggable={false}
      />

      {/* 前へ / 次へ（複数枚のみ） */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            onClick={prev}
            aria-label="前の写真"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            onClick={next}
            aria-label="次の写真"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* ドットインジケーター */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
