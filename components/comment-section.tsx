"use client";

import { useState } from "react";
import { addComment, deleteComment } from "@/app/comments/actions";
import { useToast } from "./toast";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user: {
    id: string;
    username: string;
  };
};

type Props = {
  itemId: string;
  comments: Comment[];
  currentUserId: string | null;
  isLoggedIn: boolean;
};

export default function CommentSection({
  itemId,
  comments,
  currentUserId,
  isLoggedIn,
}: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      await addComment(itemId, body);
      setBody("");
      showToast("コメントを投稿しました");
    } catch {
      showToast("投稿に失敗しました", "error");
    }
    setLoading(false);
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment(commentId);
      showToast("コメントを削除しました");
    } catch {
      showToast("削除に失敗しました", "error");
    }
  }

  function formatRelative(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "たった今";
    if (diffMin < 60) return `${diffMin}分前`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}日前`;
    return date.toLocaleDateString("ja-JP");
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-zinc-400 hover:text-zinc-600"
      >
        {expanded
          ? "コメントを閉じる"
          : comments.length > 0
            ? `コメント (${comments.length})`
            : "コメントする"}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {comment.user.username}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {formatRelative(comment.created_at)}
                  </span>
                  {currentUserId === comment.user.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-zinc-400 hover:text-red-500"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {comment.body}
              </p>
            </div>
          ))}

          {isLoggedIn && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="コメントを入力..."
                maxLength={500}
                className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                送信
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
