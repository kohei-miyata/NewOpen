"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FolderIcon, FolderOpenIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createFolder, deleteFolder, moveLikeToFolder } from "@/app/mypage/likes/actions";
import type { LikeFolder, LikedStoreWithFolder } from "@/lib/db";

interface Props {
  folders: LikeFolder[];
  likes: LikedStoreWithFolder[];
  currentFolderId?: string;
}

export default function LikeFolderManager({ folders, likes, currentFolderId }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [movingStoreId, setMovingStoreId] = useState<string | null>(null);

  const noFolderCount = likes.filter((s) => !s.folderId).length;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const fd = new FormData();
    fd.set("name", newName.trim());
    startTransition(() => { createFolder(fd); });
    setNewName("");
    setShowNew(false);
  }

  function handleDelete(folderId: string) {
    if (!confirm("フォルダを削除しますか？（いいねは削除されません）")) return;
    startTransition(() => { deleteFolder(folderId); });
  }

  function handleMove(storeId: string, folderId: string | null) {
    setMovingStoreId(null);
    startTransition(() => { moveLikeToFolder(storeId, folderId); });
  }

  return (
    <div className="space-y-4">
      {/* フォルダタブ */}
      <div className="flex flex-wrap gap-2 items-center">
        <Link
          href="/mypage/likes"
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            !currentFolderId
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
          }`}
        >
          <FolderOpenIcon className="w-4 h-4" /> すべて ({likes.length})
        </Link>
        <Link
          href="/mypage/likes?folder=none"
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            currentFolderId === "none"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
          }`}
        >
          <FolderIcon className="w-4 h-4" /> 未分類 ({noFolderCount})
        </Link>
        {folders.map((f) => {
          const count = likes.filter((s) => s.folderId === f.id).length;
          return (
            <div key={f.id} className="flex items-center gap-0.5">
              <Link
                href={`/mypage/likes?folder=${f.id}`}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-l-full border-y border-l transition-colors ${
                  currentFolderId === f.id
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                }`}
              >
                <FolderIcon className="w-4 h-4" /> {f.name} ({count})
              </Link>
              <button
                onClick={() => handleDelete(f.id)}
                disabled={isPending}
                className={`px-2 py-1.5 rounded-r-full border-y border-r text-xs transition-colors ${
                  currentFolderId === f.id
                    ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                    : "bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200"
                }`}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* 新規フォルダ */}
        {showNew ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="フォルダ名"
              maxLength={20}
              className="border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:border-orange-400 w-32"
            />
            <button type="submit" className="text-sm text-orange-500 font-bold px-2">追加</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-sm text-gray-400 px-1">✕</button>
          </form>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 transition-colors px-2 py-1.5"
          >
            <PlusIcon className="w-4 h-4" /> フォルダを追加
          </button>
        )}
      </div>

      {/* フォルダへ移動（現在選択中のフォルダがある場合、各店舗に表示） */}
      {currentFolderId && likes.length > 0 && (
        <div className="text-xs text-gray-400 bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-2">
          <span>いいねしたお店を別フォルダへ移動するには、各カードのメニューから操作できます</span>
        </div>
      )}

      {/* 移動モーダル */}
      {movingStoreId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setMovingStoreId(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-gray-900">フォルダへ移動</p>
            <button onClick={() => handleMove(movingStoreId, null)} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700">
              未分類（フォルダなし）
            </button>
            {folders.map((f) => (
              <button key={f.id} onClick={() => handleMove(movingStoreId, f.id)} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-orange-400" /> {f.name}
              </button>
            ))}
            <button onClick={() => setMovingStoreId(null)} className="w-full text-sm text-gray-400 mt-2 hover:text-gray-600">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MoveToFolderButton({ storeId, folders, currentFolderId }: { storeId: string; folders: LikeFolder[]; currentFolderId: string | null }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleMove(folderId: string | null) {
    setOpen(false);
    startTransition(() => { moveLikeToFolder(storeId, folderId); });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="text-xs text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
      >
        <FolderIcon className="w-3.5 h-3.5" />
        {currentFolderId ? folders.find((f) => f.id === currentFolderId)?.name ?? "移動" : "フォルダへ"}
      </button>
      {open && (
        <div className="absolute top-6 left-0 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 w-40 space-y-0.5">
          <button onClick={() => handleMove(null)} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 text-gray-600">未分類</button>
          {folders.map((f) => (
            <button key={f.id} onClick={() => handleMove(f.id)} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-orange-50 text-gray-600">{f.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}
