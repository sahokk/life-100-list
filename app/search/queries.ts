import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  userId: string;
  username: string;
  iconUrl: string | null;
  bio: string | null;
  itemCount: number;
  completedCount: number;
};

export async function searchUsers(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const supabase = await createClient();
  const trimmed = query.trim();

  // ユーザー名で検索（部分一致）
  const { data: users } = await supabase
    .from("users")
    .select("id, username, icon_url, bio")
    .ilike("username", `%${trimmed}%`)
    .limit(20);

  if (!users || users.length === 0) return [];

  // 公開リストを持つユーザーのみ表示
  const userIds = users.map((u: { id: string }) => u.id);
  const { data: lists } = await supabase
    .from("lists")
    .select("id, user_id, is_public")
    .in("user_id", userIds)
    .eq("is_public", true);

  const publicListMap = new Map(
    (lists ?? []).map((l: { id: string; user_id: string }) => [l.user_id, l.id])
  );

  // 公開リストのアイテム統計を取得
  const listIds = (lists ?? []).map((l: { id: string }) => l.id);
  const { data: items } = listIds.length > 0
    ? await supabase.from("items").select("list_id, is_completed").in("list_id", listIds)
    : { data: [] };

  const statsMap = new Map<string, { total: number; completed: number }>();
  (items ?? []).forEach((item: { list_id: string; is_completed: boolean }) => {
    const stat = statsMap.get(item.list_id) ?? { total: 0, completed: 0 };
    stat.total++;
    if (item.is_completed) stat.completed++;
    statsMap.set(item.list_id, stat);
  });

  return users.map((u: { id: string; username: string; icon_url: string | null; bio: string | null }) => {
    const listId = publicListMap.get(u.id);
    const stat = listId ? statsMap.get(listId) ?? { total: 0, completed: 0 } : { total: 0, completed: 0 };
    return {
      userId: u.id,
      username: u.username,
      iconUrl: u.icon_url,
      bio: u.bio,
      itemCount: stat.total,
      completedCount: stat.completed,
    };
  });
}

export async function searchItems(query: string): Promise<{
  userId: string;
  username: string;
  iconUrl: string | null;
  itemTitle: string;
  itemDescription: string | null;
  isCompleted: boolean;
}[]> {
  if (!query || query.trim().length === 0) return [];

  const supabase = await createClient();
  const trimmed = query.trim();

  // 公開リストのアイテムのみ検索
  const { data: publicLists } = await supabase
    .from("lists")
    .select("id, user_id")
    .eq("is_public", true);

  if (!publicLists || publicLists.length === 0) return [];

  const listIds = publicLists.map((l: { id: string }) => l.id);
  const listUserMap = new Map(
    publicLists.map((l: { id: string; user_id: string }) => [l.id, l.user_id])
  );

  // アイテムをタイトルまたは説明で検索
  const { data: items } = await supabase
    .from("items")
    .select("list_id, title, description, is_completed")
    .in("list_id", listIds)
    .or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
    .limit(30);

  if (!items || items.length === 0) return [];

  // ユーザー情報を取得
  const userIds = [...new Set(items.map((i: { list_id: string }) => listUserMap.get(i.list_id)!))];
  const { data: users } = await supabase
    .from("users")
    .select("id, username, icon_url")
    .in("id", userIds);

  const usersMap = new Map(
    (users ?? []).map((u: { id: string; username: string; icon_url: string | null }) => [u.id, u])
  );

  return items.map((item: { list_id: string; title: string; description: string | null; is_completed: boolean }) => {
    const userId = listUserMap.get(item.list_id)!;
    const user = usersMap.get(userId);
    return {
      userId,
      username: user?.username ?? "ユーザー",
      iconUrl: user?.icon_url ?? null,
      itemTitle: item.title,
      itemDescription: item.description,
      isCompleted: item.is_completed,
    };
  });
}
