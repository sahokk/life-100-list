"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import {
  toggleItemCompleted,
  deleteItem,
  updateItem,
} from "@/app/my-list/actions";
import ItemForm from "./item-form";
import ConfirmDialog from "./confirm-dialog";
import LikeButton from "./like-button";
import { useToast } from "./toast";
import Image from "next/image";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];

type LikeData = {
  itemId: string;
  count: number;
  isLiked: boolean;
};

type ItemListProps = {
  items: ItemRow[];
  editable?: boolean;
  userId?: string;
  likes?: LikeData[];
  isLoggedIn?: boolean;
};

type FilterType = "all" | "incomplete" | "completed";

const PRIORITY_LABELS: Record<number, string> = {
  1: "低",
  2: "中",
  3: "高",
};

export default function ItemList({
  items,
  editable = false,
  userId,
  likes = [],
  isLoggedIn = false,
}: ItemListProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const likesMap = new Map(likes.map((l) => [l.itemId, l]));

  const filteredItems = items.filter((item) => {
    if (filter === "completed") return item.is_completed;
    if (filter === "incomplete") return !item.is_completed;
    return true;
  });

  const completedCount = items.filter((i) => i.is_completed).length;

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteItem(deletingId);
      showToast("アイテムを削除しました");
    } catch {
      showToast("削除に失敗しました", "error");
    }
    setDeletingId(null);
  }

  async function handleToggle(itemId: string, completed: boolean) {
    try {
      await toggleItemCompleted(itemId, completed);
      showToast(completed ? "達成おめでとう！" : "未達成に戻しました");
    } catch {
      showToast("更新に失敗しました", "error");
    }
  }

  return (
    <div>
      {/* フィルタ & 統計 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {completedCount} / {items.length} 達成
        </p>
        <div className="flex gap-1">
          {(["all", "incomplete", "completed"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-sm ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}
            >
              {f === "all" ? "すべて" : f === "incomplete" ? "未達成" : "達成済み"}
            </button>
          ))}
        </div>
      </div>

      {/* アイテム一覧 */}
      {filteredItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          {filter === "all"
            ? "まだアイテムがありません"
            : "該当するアイテムがありません"}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              {editingId === item.id ? (
                <ItemForm
                  initialData={{
                    title: item.title,
                    description: item.description,
                    priority: item.priority,
                    image_url: item.image_url,
                  }}
                  userId={userId}
                  submitLabel="更新"
                  onSubmit={async (data) => {
                    try {
                      await updateItem(item.id, {
                        title: data.title,
                        description: data.description ?? null,
                        priority: data.priority ?? null,
                        image_url: data.image_url ?? null,
                      });
                      showToast("アイテムを更新しました");
                    } catch {
                      showToast("更新に失敗しました", "error");
                    }
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start gap-3">
                  {/* チェックボックス */}
                  {editable && (
                    <button
                      onClick={() =>
                        handleToggle(item.id, !item.is_completed)
                      }
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                        item.is_completed
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {item.is_completed && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          item.is_completed
                            ? "text-zinc-400 line-through"
                            : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.priority && item.priority > 0 && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            item.priority === 3
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : item.priority === 2
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.description}
                      </p>
                    )}

                    {item.image_url && (
                      <div className="mt-2">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          width={200}
                          height={150}
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}

                    {item.completed_at && (
                      <p className="mt-1 text-xs text-zinc-400">
                        達成日: {new Date(item.completed_at).toLocaleDateString("ja-JP")}
                      </p>
                    )}

                    {/* いいねボタン */}
                    {(() => {
                      const like = likesMap.get(item.id);
                      return (
                        <div className="mt-2">
                          <LikeButton
                            itemId={item.id}
                            likeCount={like?.count ?? 0}
                            isLiked={like?.isLiked ?? false}
                            disabled={!isLoggedIn}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  {/* アクション */}
                  {editable && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                        title="編集"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        title="削除"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={!!deletingId}
        title="アイテムの削除"
        message="このアイテムを削除しますか？この操作は取り消せません。"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
