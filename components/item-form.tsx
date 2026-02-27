"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import TagSelector from "./tag-selector";

type TagOption = {
  id: string;
  name: string;
  is_preset: boolean;
};

type ItemFormProps = {
  onSubmit: (data: {
    title: string;
    description?: string;
    priority?: number;
    image_url?: string;
    tag_ids?: string[];
    deadline?: string;
  }) => Promise<void>;
  initialData?: {
    title: string;
    description?: string | null;
    priority?: number | null;
    image_url?: string | null;
    deadline?: string | null;
  };
  onCancel?: () => void;
  submitLabel?: string;
  userId?: string;
  availableTags?: TagOption[];
  initialTagIds?: string[];
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
  userId,
  availableTags = [],
  initialTagIds = [],
}: ItemFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priority, setPriority] = useState(initialData?.priority ?? 0);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url ?? null);
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/items/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    setImageUrl(publicUrl);
    setUploading(false);
  }

  function removeImage() {
    setImageUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority || undefined,
      image_url: imageUrl ?? undefined,
      tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      deadline: deadline || undefined,
    });
    setLoading(false);

    if (!initialData) {
      setTitle("");
      setDescription("");
      setPriority(0);
      setImageUrl(null);
      setDeadline("");
      setSelectedTagIds([]);
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

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">期限:</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {deadline && (
          <button
            type="button"
            onClick={() => setDeadline("")}
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            クリア
          </button>
        )}
      </div>

      {/* タグ選択 */}
      {availableTags.length > 0 && (
        <TagSelector
          selectedTagIds={selectedTagIds}
          onChange={setSelectedTagIds}
          availableTags={availableTags}
          userId={userId}
        />
      )}

      {/* 画像アップロード */}
      {userId && (
        <div>
          <label htmlFor="item-image-upload" className="mb-1 block text-sm font-medium">画像（任意）</label>
          {imageUrl ? (
            <div className="relative inline-block">
              <Image
                src={imageUrl}
                alt="アイテム画像"
                width={200}
                height={150}
                className="rounded-md object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-md border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-zinc-700"
            >
              {uploading ? (
                "アップロード中..."
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  画像を追加
                </>
              )}
            </button>
          )}
          <input
            id="item-image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || uploading || !title.trim()}
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
