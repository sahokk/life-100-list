import { createClient } from "@/lib/supabase/server";

export type FeedUser = {
  userId: string;
  username: string;
  iconUrl: string | null;
  itemCount: number;
  completedCount: number;
  updatedAt: string;
};

export async function getFollowingFeed(
  currentUserId: string
): Promise<FeedUser[]> {
  const supabase = await createClient();

  // フォロー中のユーザーを取得
  const { data: follows } = await supabase
    .from("follows")
    .select("followee_id")
    .eq("follower_id", currentUserId);

  if (!follows || follows.length === 0) return [];

  const followeeIds = follows.map(
    (f: { followee_id: string }) => f.followee_id
  );

  // ユーザー情報を取得
  const { data: users } = await supabase
    .from("users")
    .select("id, username, icon_url")
    .in("id", followeeIds);

  if (!users || users.length === 0) return [];

  // 公開リストを取得
  const { data: lists } = await supabase
    .from("lists")
    .select("id, user_id, is_public, updated_at")
    .in("user_id", followeeIds)
    .eq("is_public", true);

  if (!lists || lists.length === 0) return [];

  const listMap = new Map(
    lists.map((l: { id: string; user_id: string; updated_at: string }) => [
      l.user_id,
      { listId: l.id, updatedAt: l.updated_at },
    ])
  );

  // アイテム統計を取得
  const listIds = lists.map((l: { id: string }) => l.id);
  const { data: items } = await supabase
    .from("items")
    .select("list_id, is_completed")
    .in("list_id", listIds);

  const statsMap = new Map<string, { total: number; completed: number }>();
  (items ?? []).forEach(
    (item: { list_id: string; is_completed: boolean }) => {
      const stat = statsMap.get(item.list_id) ?? { total: 0, completed: 0 };
      stat.total++;
      if (item.is_completed) stat.completed++;
      statsMap.set(item.list_id, stat);
    }
  );

  const usersMap = new Map(
    users.map(
      (u: { id: string; username: string; icon_url: string | null }) => [
        u.id,
        u,
      ]
    )
  );

  return followeeIds
    .filter((id: string) => listMap.has(id) && usersMap.has(id))
    .map((id: string) => {
      const user = usersMap.get(id)!;
      const listInfo = listMap.get(id)!;
      const stat = statsMap.get(listInfo.listId) ?? {
        total: 0,
        completed: 0,
      };
      return {
        userId: user.id,
        username: user.username,
        iconUrl: user.icon_url,
        itemCount: stat.total,
        completedCount: stat.completed,
        updatedAt: listInfo.updatedAt,
      };
    })
    .sort(
      (a: FeedUser, b: FeedUser) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export type DiscoverUser = {
  userId: string;
  username: string;
  iconUrl: string | null;
  itemCount: number;
  completedCount: number;
};

export async function getDiscoverUsers(): Promise<DiscoverUser[]> {
  const supabase = await createClient();

  const { data: publicLists } = await supabase
    .from("lists")
    .select("id, user_id, updated_at")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!publicLists || publicLists.length === 0) return [];

  const userIds = [
    ...new Set(
      publicLists.map((l: { user_id: string }) => l.user_id)
    ),
  ];
  const { data: users } = await supabase
    .from("users")
    .select("id, username, icon_url")
    .in("id", userIds);

  const usersMap = new Map(
    (users ?? []).map(
      (u: { id: string; username: string; icon_url: string | null }) => [
        u.id,
        u,
      ]
    )
  );

  const listIds = publicLists.map((l: { id: string }) => l.id);
  const { data: items } = await supabase
    .from("items")
    .select("list_id, is_completed")
    .in("list_id", listIds);

  const statsMap = new Map<string, { total: number; completed: number }>();
  (items ?? []).forEach(
    (item: { list_id: string; is_completed: boolean }) => {
      const stat = statsMap.get(item.list_id) ?? { total: 0, completed: 0 };
      stat.total++;
      if (item.is_completed) stat.completed++;
      statsMap.set(item.list_id, stat);
    }
  );

  // user_id -> list_id のマップ
  const userListMap = new Map(
    publicLists.map((l: { id: string; user_id: string }) => [
      l.user_id,
      l.id,
    ])
  );

  return userIds
    .filter((id: string) => usersMap.has(id))
    .map((id: string) => {
      const user = usersMap.get(id)!;
      const listId = userListMap.get(id);
      const stat = listId
        ? statsMap.get(listId) ?? { total: 0, completed: 0 }
        : { total: 0, completed: 0 };
      return {
        userId: user.id,
        username: user.username,
        iconUrl: user.icon_url,
        itemCount: stat.total,
        completedCount: stat.completed,
      };
    });
}
