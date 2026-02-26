"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { FeedUser, DiscoverUser } from "./page-queries";

type TabType = "following" | "discover";

type Props = {
  feedUsers: FeedUser[];
  discoverUsers: DiscoverUser[];
};

function UserCard({
  userId,
  username,
  iconUrl,
  itemCount,
  completedCount,
}: {
  userId: string;
  username: string;
  iconUrl: string | null;
  itemCount: number;
  completedCount: number;
}) {
  const percentage =
    itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;

  return (
    <Link
      href={`/profile/${userId}`}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-800"
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={username}
          width={48}
          height={48}
          className="rounded-full object-cover"
          style={{ width: 48, height: 48 }}
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-lg font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
          {username.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{username}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-zinc-500">
            {completedCount}/{itemCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeClient({ feedUsers, discoverUsers }: Props) {
  const [tab, setTab] = useState<TabType>("following");
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 検索バー */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ユーザーやキーワードで検索..."
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={!searchInput.trim()}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            検索
          </button>
        </div>
      </form>

      {/* タブ */}
      <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab("following")}
          className={`px-4 py-2.5 text-sm font-medium ${
            tab === "following"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          フォロー中
        </button>
        <button
          onClick={() => setTab("discover")}
          className={`px-4 py-2.5 text-sm font-medium ${
            tab === "discover"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          みつける
        </button>
      </div>

      {/* フォロー中タブ */}
      {tab === "following" && (
        <div>
          {feedUsers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-zinc-500">
                まだ誰もフォローしていません
              </p>
              <button
                onClick={() => setTab("discover")}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                ユーザーをみつける →
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {feedUsers.map((user) => (
                <UserCard key={user.userId} {...user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* みつけるタブ */}
      {tab === "discover" && (
        <div>
          {discoverUsers.length === 0 ? (
            <p className="py-12 text-center text-zinc-500">
              まだ公開リストがありません
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {discoverUsers.map((user) => (
                <UserCard key={user.userId} {...user} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
