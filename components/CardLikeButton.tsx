"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface Props {
  storeId: string;
  initialLikes: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export default function CardLikeButton({ storeId, initialLikes, initialLiked, isLoggedIn }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold shadow transition-colors ${
        liked
          ? "bg-orange-500 text-white"
          : "bg-white/90 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      }`}
    >
      {liked
        ? <HeartSolid className="w-3.5 h-3.5" />
        : <HeartIcon className="w-3.5 h-3.5" />
      }
    </button>
  );
}
