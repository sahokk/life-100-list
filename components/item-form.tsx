"use client";

import { useState } from "react";

type ItemFormProps = {
  onSubmit: (data: { title: string; description?: string; priority?: number }) => Promise<void>;
  initialData?: {
    title: string;
    description?: string | null;
    priority?: number | null;
  };
  onCancel?: () => void;
  submitLabel?: string;
};

const PRIORITY_OPTIONS = [
  { value: 0, label: "なし" },
  { value: 1, label: "低" },
  { value: 2, label: "中" },
  { value: 3, label: "高" },
];

export default function ItemForm({
  onSubmit,
  initialData,
  onCancel,
  submitLabel = "追加",
}: ItemFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priority, setPriority] = useState(initialData?.priority ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority || undefined,
    });
    setLoading(false);

    if (!initialData) {
      setTitle("");
      setDescription("");
      setPriority(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="やりたいことを入力..."
        />
      </div>

      <div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="メモ（任意）"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">優先度:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "処理中..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
