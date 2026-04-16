"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Props {
  photos: string[];
  storeName: string;
  initialIndex?: number;
  onClose: () => void;
}

export function PhotoLightbox({ photos, storeName, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        onClick={onClose}
        aria-label="閉じる"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* カウンター */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
          {current + 1} / {photos.length}
        </div>
      )}

      {/* 画像 */}
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[current]}
          alt={`${storeName} ${current + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />
      </div>

      {/* 前へ / 次へ */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="前の写真"
          >
            <ChevronLeftIcon className="w-7 h-7" />
          </button>
          <button
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="次の写真"
          >
            <ChevronRightIcon className="w-7 h-7" />
          </button>
        </>
      )}

      {/* サムネイル */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ギャラリー本体（クリックでモーダルを開く）
export default function PhotoGallery({
  photos,
  storeName,
  likeButton,
}: {
  photos: string[];
  storeName: string;
  likeButton: React.ReactNode;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[0]}
          alt={storeName}
          className="w-full h-64 object-cover rounded-xl cursor-pointer"
          onClick={() => setLightboxIndex(0)}
        />
        <div className="absolute top-3 right-3">{likeButton}</div>
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {photos.slice(1).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`${storeName} ${i + 2}`}
              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setLightboxIndex(i + 1)}
            />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          storeName={storeName}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
