"use client";

import { useState, useRef } from "react";

interface Props {
  name: string;
  label?: string;
  defaultValue?: string;
  onUpload?: (url: string) => void;
}

export default function ImageUpload({ name, label, defaultValue = "", onUpload }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function toJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("変換に失敗しました")); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.92
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("画像を読み込めませんでした")); };
      img.src = url;
    });
  }

  async function handleFile(file: File) {
    setError("");
    setUploading(true);

    // HEIC/HEIFはJPEGに変換（iPhone対応）
    const needsConvert = file.type === "image/heic" || file.type === "image/heif"
      || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
    if (needsConvert) {
      try { file = await toJpeg(file); } catch { /* 変換失敗時はそのまま試みる */ }
    }

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url);
      onUpload?.(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* hidden field that holds the uploaded URL for form submission */}
      <input type="hidden" name={name} value={url} />

      <label
        htmlFor={`img-upload-${name}`}
        className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="preview" className="mx-auto max-h-40 rounded-lg object-cover" />
        ) : (
          <div className="text-sm text-gray-400 py-4">
            {uploading ? "アップロード中..." : "タップまたはドラッグ＆ドロップで画像を追加"}
          </div>
        )}
      </label>

      <input
        ref={inputRef}
        id={`img-upload-${name}`}
        type="file"
        accept="image/*,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // 同じファイルを再選択できるようリセット
          e.target.value = "";
        }}
      />

      {url && (
        <button
          type="button"
          onClick={() => { setUrl(""); if (inputRef.current) inputRef.current.value = ""; }}
          className="text-xs text-red-500 hover:underline"
        >
          削除
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
