"use client";

import { useState, useRef } from "react";

interface Props {
  name: string;
  label?: string;
  defaultValue?: string;
  onUpload?: (url: string) => void;
  onClear?: () => void;
}

function isHeicFile(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

export default function ImageUpload({ name, label, defaultValue = "", onUpload, onClear }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_PX = 1920;

  // HEICをheic2anyでJPEG Blobに変換（PCブラウザ対応）
  async function heicToJpegFile(file: File): Promise<File> {
    const heic2any = (await import("heic2any")).default;
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.88 });
    const outBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([outBlob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  }

  // FileReader経由でcanvas変換・リサイズ
  // URL.createObjectURL は iOS Safari で HEIC に使うとエラーになるため FileReader を使用
  async function toResizedJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("読み込み失敗"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("画像変換失敗"));
        img.onload = () => {
          let { naturalWidth: w, naturalHeight: h } = img;
          if (!w || !h) { reject(new Error("サイズ取得失敗")); return; }
          if (w > MAX_PX || h > MAX_PX) {
            if (w > h) { h = Math.round((h / w) * MAX_PX); w = MAX_PX; }
            else       { w = Math.round((w / h) * MAX_PX); h = MAX_PX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size < 100) { reject(new Error("変換失敗")); return; }
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.88
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    setError("");
    setUploading(true);

    // HEICはPCブラウザがネイティブ復号できないため heic2any で先に変換
    if (isHeicFile(file)) {
      try {
        file = await heicToJpegFile(file);
      } catch {
        setError("HEIC画像の変換に失敗しました。JPEG形式に変換してから再度お試しください。");
        setUploading(false);
        return;
      }
    }

    // 全画像をリサイズ・JPEG変換してからアップロード（413エラー対策）
    try {
      file = await toResizedJpeg(file);
    } catch {
      // 変換失敗 → そのまま試みる
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
          onClick={() => { setUrl(""); if (inputRef.current) inputRef.current.value = ""; onClear?.(); }}
          className="text-xs text-red-500 hover:underline"
        >
          削除
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
