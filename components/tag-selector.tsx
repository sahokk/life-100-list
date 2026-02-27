"use client";

import { useState } from "react";
import { createCustomTag } from "@/app/my-list/actions";
import { useToast } from "./toast";

type Tag = {
  id: string;
  name: string;
  is_preset: boolean;
};

type TagSelectorProps = {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  availableTags: Tag[];
  userId?: string;
};

export default function TagSelector({
  selectedTagIds,
  onChange,
  availableTags,
  userId,
}: TagSelectorProps) {
  const [creating, setCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tags, setTags] = useState(availableTags);
  const { showToast } = useToast();

  function toggleTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  }

  async function handleCreateTag() {
    const name = newTagName.trim();
    if (!name) return;

    try {
      const newTag = await createCustomTag(name);
      setTags((prev) => [...prev, newTag]);
      onChange([...selectedTagIds, newTag.id]);
      setNewTagName("");
      setCreating(false);
      showToast("タグを作成しました");
    } catch {
      showToast("タグの作成に失敗しました", "error");
    }
  }

  const presetTags = tags.filter((t) => t.is_preset);
  const customTags = tags.filter((t) => !t.is_preset);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">タグ</label>
      <div className="flex flex-wrap gap-1.5">
        {presetTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedTagIds.includes(tag.id)
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {tag.name}
          </button>
        ))}
        {customTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedTagIds.includes(tag.id)
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30"
            }`}
          >
            {tag.name}
          </button>
        ))}

        {userId && !creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700"
          >
            + タグを作成
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="タグ名"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewTagName("");
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}
