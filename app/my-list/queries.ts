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
