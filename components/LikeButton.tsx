"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  storeId: string;
  initialLikes: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export default function LikeButton({ storeId, initialLikes, initialLiked, isLoggedIn }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if (loading) return;
    setLoading(true);
    const next = !liked;
    try {
      const res = await fetch(`/api/stores/${storeId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: next }),
      });
      const json = await res.json();
      if (res.ok) {
        setLikes(json.likes);
        setLiked(next);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={isLoggedIn ? undefined : "ログインしていいねできます"}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-colors border ${
        liked
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-500"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{likes.toLocaleString()} いいね</span>
      {!isLoggedIn && <span className="text-xs opacity-60">（要ログイン）</span>}
    </button>
  );
}
