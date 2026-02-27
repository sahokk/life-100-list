import { createClient } from "@/lib/supabase/server";

export type NotificationWithUser = {
  id: string;
  type: "follow" | "like" | "comment";
  relatedUserId: string;
  relatedUsername: string;
  relatedUserIconUrl: string | null;
  relatedItemId: string | null;
  relatedItemTitle: string | null;
  isRead: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<{
  notifications: NotificationWithUser[];
  userId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  const { data: rawNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifs = rawNotifications ?? [];
  if (notifs.length === 0) return { notifications: [], userId: user.id };

  // related_user の情報を取得
  const relatedUserIds = [...new Set(notifs.map((n) => n.related_user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, username, icon_url")
    .in("id", relatedUserIds);

  const usersMap = new Map(
    (users ?? []).map((u: { id: string; username: string; icon_url: string | null }) => [u.id, u])
  );

  // related_item の情報を取得（like 通知用）
  const relatedItemIds = notifs
    .map((n) => n.related_item_id)
    .filter((id): id is string => id !== null);

  let itemsMap = new Map<string, string>();
  if (relatedItemIds.length > 0) {
    const { data: items } = await supabase
      .from("items")
      .select("id, title")
      .in("id", relatedItemIds);
    itemsMap = new Map(
      (items ?? []).map((i: { id: string; title: string }) => [i.id, i.title])
    );
  }

  const notifications: NotificationWithUser[] = notifs.map((n) => {
    const relatedUser = usersMap.get(n.related_user_id);
    return {
      id: n.id,
      type: n.type as "follow" | "like" | "comment",
      relatedUserId: n.related_user_id,
      relatedUsername: relatedUser?.username ?? "ユーザー",
      relatedUserIconUrl: relatedUser?.icon_url ?? null,
      relatedItemId: n.related_item_id,
      relatedItemTitle: n.related_item_id
        ? (itemsMap.get(n.related_item_id) ?? null)
        : null,
      isRead: n.is_read,
      createdAt: n.created_at,
    };
  });

  return { notifications, userId: user.id };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}
