"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import type { LikeData, TagData, ItemTagData, CommentData } from "./queries";
import { addItem, toggleListVisibility } from "./actions";
import ItemList from "@/components/item-list";
import ItemForm from "@/components/item-form";
import AchievementTimeline from "@/components/achievement-timeline";
import TagProgress from "@/components/tag-progress";
import { useToast } from "@/components/toast";

type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type ItemRow = Database["public"]["Tables"]["items"]["Row"];

type Props = {
  userId: string;
  list: ListRow;
  items: ItemRow[];
  likes: LikeData[];
  availableTags: TagData[];
  itemTags: ItemTagData[];
  comments: CommentData[];
  totalCount: number;
  completedCount: number;
  completedItems: ItemRow[];
  upcomingDeadlines: ItemRow[];
  followerCount: number;
  totalLikes: number;
  tagStats: { name: string; completed: number; total: number }[];
};

export default function MyListClient({
  userId,
  list,
  items,
  likes,
  availableTags,
  itemTags,
  comments,
  totalCount,
  completedCount,
  completedItems,
  upcomingDeadlines,
  followerCount,
  totalLikes,
  tagStats,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  async function handleToggleVisibility(checked: boolean) {
    try {
      await toggleListVisibility(list.id, checked);
      showToast(checked ? "リストを公開しました" : "リストを非公開にしました");
    } catch {
      showToast("更新に失敗しました", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">マイページ</h1>

      {/* 統計カード */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">達成率</p>
          <p className="mt-1 text-2xl font-bold">{percentage}%</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">アイテム</p>
          <p className="mt-1 text-2xl font-bold">
            {completedCount}
            <span className="text-base font-normal text-zinc-400">
              {" "}/ {totalCount}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">フォロワー</p>
          <p className="mt-1 text-2xl font-bold">{followerCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">いいね</p>
          <p className="mt-1 text-2xl font-bold">{totalLikes}</p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">全体の進捗</span>
          <span className="font-medium">
            {completedCount} / {totalCount} 達成
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* やりたいことリスト */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">やりたいことリスト</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={list.is_public}
              onChange={(e) => handleToggleVisibility(e.target.checked)}
              className="rounded"
            />
            公開
          </label>
        </div>

        {/* アイテム追加 */}
        <div className="mb-4">
          {showForm ? (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <ItemForm
                userId={userId}
                availableTags={availableTags}
                onSubmit={async (data) => {
                  try {
                    await addItem(list.id, data);
                    showToast("アイテムを追加しました");
                  } catch {
                    showToast("追加に失敗しました", "error");
                  }
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl border-2 border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
            >
              + やりたいことを追加
            </button>
          )}
        </div>

        {/* アイテム一覧 */}
        <ItemList
          items={items}
          editable
          userId={userId}
          listUserId={userId}
          likes={likes}
          isLoggedIn
          availableTags={availableTags}
          itemTags={itemTags}
          comments={comments}
          currentUserId={userId}
        />
      </section>

      {/* タグ別進捗 */}
      {tagStats.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">タグ別の進捗</h2>
          <TagProgress stats={tagStats} />
        </section>
      )}

      {/* 期限が近いアイテム */}
      {upcomingDeadlines.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">期限が近いアイテム</h2>
          <ul className="space-y-2">
            {upcomingDeadlines.map((item) => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const dl = new Date(item.deadline! + "T00:00:00");
              const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = diffDays < 0;
              return (
                <li
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    isOverdue
                      ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                      : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                  }`}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className={`text-xs font-medium ${
                    isOverdue ? "text-red-600" : "text-orange-600"
                  }`}>
                    {isOverdue
                      ? `${Math.abs(diffDays)}日超過`
                      : diffDays === 0
                        ? "今日"
                        : `あと${diffDays}日`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 達成タイムライン */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">達成タイムライン</h2>
        <AchievementTimeline
          items={completedItems
            .filter((i) => i.completed_at)
            .map((i) => ({
              id: i.id,
              title: i.title,
              completed_at: i.completed_at!,
            }))}
        />
      </section>

    </div>
  );
}
