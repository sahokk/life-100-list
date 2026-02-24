"use client";

import { useState } from "react";
import { toggleLike } from "@/app/likes/actions";
import { useToast } from "./toast";

type LikeButtonProps = {
  itemId: string;
  likeCount: number;
  isLiked: boolean;
  disabled?: boolean;
};

export default function LikeButton({
  itemId,
  likeCount,
  isLiked,
  disabled = false,
}: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleToggle() {
    if (disabled || loading) return;

    // Optimistic update
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);
    setLoading(true);

    try {
      await toggleLike(itemId);
    } catch {
      // Revert on error
      setOptimisticLiked(optimisticLiked);
      setOptimisticCount(likeCount);
      showToast("操作に失敗しました", "error");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || loading}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
        optimisticLiked
          ? "text-pink-600"
          : "text-zinc-400 hover:text-pink-500"
      } disabled:cursor-not-allowed disabled:opacity-50`}
      title={disabled ? "ログインするといいねできます" : optimisticLiked ? "いいねを取り消す" : "いいね"}
    >
      <svg
        className="h-4 w-4"
        fill={optimisticLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {optimisticCount > 0 && <span>{optimisticCount}</span>}
    </button>
  );
}
