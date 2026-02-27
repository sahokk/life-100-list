import { createClient } from "@/lib/supabase/server";
import { getOrCreateList } from "./queries";
import DashboardClient from "./client";
import type { Database } from "@/types/database";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];

export default async function MyListPage() {
  const { list, userId } = await getOrCreateList();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("list_id", list.id)
    .order("created_at", { ascending: false });

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

  // 最近追加したアイテム (直近5件)
  const recentlyAdded = typedItems.slice(0, 5);

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

  // いいね総数
  const itemIds = typedItems.map((i) => i.id);
  let totalLikes = 0;
  if (itemIds.length > 0) {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("item_id", itemIds);
    totalLikes = count ?? 0;
  }

  return (
    <DashboardClient
      userId={userId}
      totalCount={totalCount}
      completedCount={completedCount}
      completedItems={completedItems}
      recentlyAdded={recentlyAdded}
      upcomingDeadlines={upcomingDeadlines}
      followerCount={followerCount ?? 0}
      totalLikes={totalLikes}
      isPublic={list.is_public}
    />
  );
}
