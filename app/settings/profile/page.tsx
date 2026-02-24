"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/image-upload";

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("users")
        .select("username, bio, icon_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setBio(data.bio ?? "");
        setIconUrl(data.icon_url);
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("users")
      .update({ username, bio, icon_url: iconUrl })
      .eq("id", userId);

    if (error) {
      setMessage("保存に失敗しました");
    } else {
      setMessage("プロフィールを更新しました");
      router.refresh();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">プロフィール編集</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`rounded-md p-4 text-sm ${
              message.includes("失敗")
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            {message}
          </div>
        )}

        {userId && (
          <ImageUpload
            uid={userId}
            currentUrl={iconUrl}
            onUpload={setIconUrl}
            folder="avatars"
            size={96}
          />
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            自己紹介
          </label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="自己紹介を入力..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </form>
    </div>
  );
}
