"use client";

import { useState } from "react";
import { toggleFollow } from "@/app/follows/actions";
import { useToast } from "./toast";

type FollowButtonProps = {
  targetUserId: string;
  isFollowing: boolean;
};

export default function FollowButton({
  targetUserId,
  isFollowing,
}: FollowButtonProps) {
  const [optimisticFollowing, setOptimisticFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleToggle() {
    if (loading) return;

    setOptimisticFollowing(!optimisticFollowing);
    setLoading(true);

    try {
      await toggleFollow(targetUserId);
      showToast(optimisticFollowing ? "フォローしました" : "フォローを解除しました");
    } catch {
      setOptimisticFollowing(optimisticFollowing);
      showToast("操作に失敗しました", "error");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        optimisticFollowing
          ? "border border-zinc-300 hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:hover:border-red-700"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {optimisticFollowing ? "フォロー中" : "フォロー"}
    </button>
  );
}
