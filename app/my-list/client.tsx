"use client";

import { useState } from "react";
import type { Database } from "@/types/database";
import type { LikeData } from "./queries";
import { addItem, toggleListVisibility } from "./actions";
import ItemList from "@/components/item-list";
import ItemForm from "@/components/item-form";
import { useToast } from "@/components/toast";

type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type ItemRow = Database["public"]["Tables"]["items"]["Row"];

type Props = {
  list: ListRow;
  items: ItemRow[];
  likes: LikeData[];
  userId: string;
};

export default function MyListClient({ list, items, likes, userId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  async function handleToggleVisibility(checked: boolean) {
    try {
      await toggleListVisibility(list.id, checked);
      showToast(checked ? "リストを公開しました" : "リストを非公開にしました");
    } catch {
      showToast("更新に失敗しました", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイリスト</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={list.is_public}
              onChange={(e) => handleToggleVisibility(e.target.checked)}
              className="rounded"
            />{" "}
            公開
          </label>
        </div>
      </div>

      {/* アイテム追加 */}
      <div className="mb-6">
        {showForm ? (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <ItemForm
              userId={userId}
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
            className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
          >
            + やりたいことを追加
          </button>
        )}
      </div>

      {/* アイテム一覧 */}
      <ItemList items={items} editable userId={userId} likes={likes} isLoggedIn />
    </div>
  );
}
