import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type LikeData = {
  itemId: string;
  count: number;
  isLiked: boolean;
};

export async function getLikesForItems(
  itemIds: string[],
  currentUserId: string | null
): Promise<LikeData[]> {
  if (itemIds.length === 0) return [];

  const supabase = await createClient();
  const { data: likes } = await supabase
    .from("likes")
    .select("item_id, user_id")
    .in("item_id", itemIds);

  // アイテムごとのいいね数と自分がいいね済みかを計算
  const countMap = new Map<string, { count: number; isLiked: boolean }>();
  (likes ?? []).forEach((like: { item_id: string; user_id: string }) => {
    const entry = countMap.get(like.item_id) ?? { count: 0, isLiked: false };
    entry.count++;
    if (like.user_id === currentUserId) entry.isLiked = true;
    countMap.set(like.item_id, entry);
  });

  return itemIds.map((id) => ({
    itemId: id,
    count: countMap.get(id)?.count ?? 0,
    isLiked: countMap.get(id)?.isLiked ?? false,
  }));
}

export async function getOrCreateList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  // 既存のリストを取得 (maybeSingle: 0行でもエラーにしない)
  const { data: existingList } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingList) return { list: existingList, userId: user.id };

  // なければ作成
  const { data: newList, error } = await supabase
    .from("lists")
    .insert({ user_id: user.id, is_public: false })
    .select()
    .single();

  if (error || !newList) {
    console.error("リスト作成エラー:", error);
    throw new Error("リストの作成に失敗しました");
  }

  return { list: newList, userId: user.id };
}

export type TagData = {
  id: string;
  name: string;
  is_preset: boolean;
};

export type ItemTagData = {
  itemId: string;
  tagIds: string[];
};

export async function getTagsForUser(userId: string): Promise<TagData[]> {
  const supabase = await createClient();

  // プリセットタグ
  const { data: presetTags } = await supabase
    .from("tags")
    .select("id, name, is_preset")
    .eq("is_preset", true)
    .order("name");

  // ユーザーのカスタムタグ
  const { data: customTags } = await supabase
    .from("tags")
    .select("id, name, is_preset")
    .eq("user_id", userId)
    .eq("is_preset", false)
    .order("created_at");

  return [
    ...((presetTags ?? []) as TagData[]),
    ...((customTags ?? []) as TagData[]),
  ];
}

export async function getItemTags(itemIds: string[]): Promise<ItemTagData[]> {
  if (itemIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("item_tags")
    .select("item_id, tag_id")
    .in("item_id", itemIds);

  const tagMap = new Map<string, string[]>();
  (data ?? []).forEach((row: { item_id: string; tag_id: string }) => {
    const existing = tagMap.get(row.item_id) ?? [];
    existing.push(row.tag_id);
    tagMap.set(row.item_id, existing);
  });

  return itemIds.map((id) => ({
    itemId: id,
    tagIds: tagMap.get(id) ?? [],
  }));
}

export type CommentData = {
  id: string;
  itemId: string;
  body: string;
  created_at: string;
  user: {
    id: string;
    username: string;
  };
};

export async function getCommentsForItems(itemIds: string[]): Promise<CommentData[]> {
  if (itemIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, item_id, body, created_at, user_id")
    .in("item_id", itemIds)
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) return [];

  // ユーザー情報を取得
  const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, username")
    .in("id", userIds);

  const usersMap = new Map((users ?? []).map((u: { id: string; username: string }) => [u.id, u]));

  return data.map((c: { id: string; item_id: string; body: string; created_at: string; user_id: string }) => ({
    id: c.id,
    itemId: c.item_id,
    body: c.body,
    created_at: c.created_at,
    user: usersMap.get(c.user_id) ?? { id: c.user_id, username: "不明" },
  }));
}

export async function getMyList() {
  const { list, userId } = await getOrCreateList();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", list.id)
    .order("order", { ascending: true })
    .order("created_at", { ascending: true });

  const typedItems = (items ?? []) as Database["public"]["Tables"]["items"]["Row"][];
  const likes = await getLikesForItems(
    typedItems.map((i) => i.id),
    userId
  );

  return {
    list,
    items: typedItems,
    likes,
    userId,
  };
}
