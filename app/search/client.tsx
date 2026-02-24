"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { SearchResult } from "./queries";

type TabType = "users" | "items";

type ItemResult = {
  userId: string;
  username: string;
  iconUrl: string | null;
  itemTitle: string;
  itemDescription: string | null;
  isCompleted: boolean;
};

type Props = {
  query: string;
  activeTab: TabType;
  users: SearchResult[];
  items: ItemResult[];
};

export default function SearchClient({ query, activeTab, users, items }: Props) {
  const [input, setInput] = useState(query);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search?q=${encodeURIComponent(input.trim())}&tab=${activeTab}`);
  }

  function switchTab(tab: TabType) {
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${tab}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">検索</h1>

      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ユーザー名やキーワードで検索..."
            className="flex-1 rounded-md border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            検索
          </button>
        </div>
      </form>

      {/* タブ */}
      {query && (
        <div className="mb-6 flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => switchTab("users")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "users"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            ユーザー ({users.length})
          </button>
          <button
            onClick={() => switchTab("items")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "items"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            やりたいこと ({items.length})
          </button>
        </div>
      )}

      {/* 検索結果 */}
      {query && activeTab === "users" && (
        <div>
          {users.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              該当するユーザーが見つかりませんでした
            </p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li key={user.userId}>
                  <Link
                    href={`/profile/${user.userId}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    {user.iconUrl ? (
                      <Image
                        src={user.iconUrl}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                        style={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-xl dark:bg-zinc-700">
                        👤
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{user.username}</p>
                      {user.bio && (
                        <p className="mt-0.5 truncate text-sm text-zinc-500">
                          {user.bio}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {user.itemCount > 0
                          ? `${user.itemCount}個 / ${user.completedCount}個達成`
                          : "リスト未公開"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {query && activeTab === "items" && (
        <div>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              該当するアイテムが見つかりませんでした
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={`${item.userId}-${i}`}>
                  <Link
                    href={`/profile/${item.userId}`}
                    className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-xs ${
                          item.isCompleted
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {item.isCompleted && "✓"}
                      </span>
                      <span className={`font-medium ${item.isCompleted ? "text-zinc-400 line-through" : ""}`}>
                        {item.itemTitle}
                      </span>
                    </div>
                    {item.itemDescription && (
                      <p className="mt-1 truncate pl-7 text-sm text-zinc-500">
                        {item.itemDescription}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 pl-7">
                      {item.iconUrl ? (
                        <Image
                          src={item.iconUrl}
                          alt={item.username}
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                          style={{ width: 20, height: 20 }}
                        />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs dark:bg-zinc-700">
                          👤
                        </div>
                      )}
                      <span className="text-xs text-zinc-400">{item.username}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 検索前の状態 */}
      {!query && (
        <p className="py-8 text-center text-sm text-zinc-500">
          キーワードを入力して検索してください
        </p>
      )}
    </div>
  );
}
