import { createClient } from "@/lib/supabase/server";
import { getOrCreateList, getLikesForItems, getTagsForUser, getItemTags, getCommentsForItems } from "./queries";
import MyListClient from "./client";
import type { Database } from "@/types/database";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];

export default async function MyListPage() {
  const { list, userId } = await getOrCreateList();
  const supabase = await createClient();

  // アイテム一覧 (order順)
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", list.id)
    .order("order", { ascending: true })
    .order("created_at", { ascending: true });

  const typedItems = (items ?? []) as ItemRow[];

  const totalCount = typedItems.length;
  const completedCount = typedItems.filter((i) => i.is_completed).length;

  // 達成済みアイテム (全件、新しい順)
  const completedItems = typedItems
    .filter((i) => i.is_completed && i.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    );

  // 期限が近いアイテム (未達成 & 期限7日以内 or 期限切れ)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDeadlines = typedItems
    .filter((i) => !i.is_completed && i.deadline)
    .filter((i) => {
      const dl = new Date(i.deadline! + "T00:00:00");
      const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  // フォロワー数
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", userId);

  // いいね・タグ・コメント
  const itemIds = typedItems.map((i) => i.id);
  const [likes, availableTags, itemTags, comments] = await Promise.all([
    getLikesForItems(itemIds, userId),
    getTagsForUser(userId),
    getItemTags(itemIds),
    getCommentsForItems(itemIds),
  ]);

  // いいね総数
  let totalLikes = 0;
  likes.forEach((l) => { totalLikes += l.count; });

  // タグ別進捗
  const itemTagsMap = new Map(itemTags.map((t) => [t.itemId, t.tagIds]));
  const tagsMap = new Map(availableTags.map((t) => [t.id, t.name]));
  const tagStatsMap = new Map<string, { name: string; completed: number; total: number }>();
  for (const item of typedItems) {
    const tIds = itemTagsMap.get(item.id) ?? [];
    for (const tagId of tIds) {
      const existing = tagStatsMap.get(tagId) ?? { name: tagsMap.get(tagId) ?? "", completed: 0, total: 0 };
      existing.total++;
      if (item.is_completed) existing.completed++;
      tagStatsMap.set(tagId, existing);
    }
  }
  const tagStats = Array.from(tagStatsMap.values()).sort((a, b) => a.name.localeCompare(b.name, "ja"));

  return (
    <MyListClient
      userId={userId}
      list={list}
      items={typedItems}
      likes={likes}
      availableTags={availableTags}
      itemTags={itemTags}
      comments={comments}
      totalCount={totalCount}
      completedCount={completedCount}
      completedItems={completedItems}
      upcomingDeadlines={upcomingDeadlines}
      followerCount={followerCount ?? 0}
      totalLikes={totalLikes}
      tagStats={tagStats}
    />
  );
}
