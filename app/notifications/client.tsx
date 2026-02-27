"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { NotificationWithUser } from "./queries";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./actions";
import { useToast } from "@/components/toast";

type Props = {
  notifications: NotificationWithUser[];
  userId: string;
};

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;

  return new Date(dateString).toLocaleDateString("ja-JP");
}

function getNotificationMessage(notification: NotificationWithUser): string {
  switch (notification.type) {
    case "follow":
      return `${notification.relatedUsername} さんがあなたをフォローしました`;
    case "like":
      return notification.relatedItemTitle
        ? `${notification.relatedUsername} さんが「${notification.relatedItemTitle}」にいいねしました`
        : `${notification.relatedUsername} さんがあなたのアイテムにいいねしました`;
    case "comment":
      return notification.relatedItemTitle
        ? `${notification.relatedUsername} さんが「${notification.relatedItemTitle}」にコメントしました`
        : `${notification.relatedUsername} さんがあなたのアイテムにコメントしました`;
    default:
      return "新しい通知があります";
  }
}

function getNotificationLink(notification: NotificationWithUser, userId: string): string {
  switch (notification.type) {
    case "follow":
      return `/profile/${notification.relatedUserId}`;
    case "like":
    case "comment":
      return `/profile/${userId}`;
    default:
      return "/notifications";
  }
}

export default function NotificationsClient({
  notifications,
  userId,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const hasUnread = notifications.some((n) => !n.isRead);

  async function handleClick(notification: NotificationWithUser) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
      } catch {
        // 既読マーク失敗しても遷移は許可
      }
    }
    router.push(getNotificationLink(notification, userId));
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      showToast("すべて既読にしました");
    } catch {
      showToast("更新に失敗しました", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">通知</h1>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">通知はありません</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                notification.isRead
                  ? "border-zinc-200 dark:border-zinc-800"
                  : "border-l-4 border-l-blue-500 border-zinc-200 bg-blue-50/50 dark:border-zinc-800 dark:bg-blue-950/20"
              }`}
            >
              {notification.relatedUserIconUrl ? (
                <Image
                  src={notification.relatedUserIconUrl}
                  alt={notification.relatedUsername}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ width: 40, height: 40 }}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
                  {notification.relatedUsername.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {getNotificationMessage(notification)}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {getRelativeTime(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
