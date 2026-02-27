"use client";

import Link from "next/link";
import type { Database } from "@/types/database";
import AchievementTimeline from "@/components/achievement-timeline";
import TagProgress from "@/components/tag-progress";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];

type Props = {
  userId: string;
  totalCount: number;
  completedCount: number;
  completedItems: ItemRow[];
  recentlyAdded: ItemRow[];
  upcomingDeadlines: ItemRow[];
  followerCount: number;
  totalLikes: number;
  isPublic: boolean;
  tagStats: { name: string; completed: number; total: number }[];
};

export default function DashboardClient({
  userId,
  totalCount,
  completedCount,
  completedItems,
  recentlyAdded,
  upcomingDeadlines,
  followerCount,
  totalLikes,
  isPublic,
  tagStats,
}: Props) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        マイダッシュボード
      </h1>

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
              {" "}
              / {totalCount}
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
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dl = new Date(item.deadline! + "T00:00:00");
              const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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

      {/* 最近追加したこと */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">最近追加したこと</h2>
        {recentlyAdded.length === 0 ? (
          <p className="text-sm text-zinc-500">まだアイテムがありません</p>
        ) : (
          <ul className="space-y-2">
            {recentlyAdded.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-zinc-400">
                  {new Date(item.created_at).toLocaleDateString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* プロフィールへのリンク */}
      <div className="rounded-xl border border-zinc-200 p-5 text-center dark:border-zinc-800">
        <p className="mb-3 text-sm text-zinc-500">
          リストの管理はプロフィールページから行えます
        </p>
        <Link
          href={`/profile/${userId}`}
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm text-white shadow-sm hover:bg-blue-700"
        >
          プロフィールでリストを管理する →
        </Link>
        {!isPublic && (
          <p className="mt-2 text-xs text-zinc-400">
            リストは現在非公開です。プロフィールから公開設定を変更できます。
          </p>
        )}
      </div>
    </div>
  );
}
