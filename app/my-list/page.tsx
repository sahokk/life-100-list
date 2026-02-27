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

  // 最近達成したアイテム (直近5件)
  const recentlyCompleted = typedItems
    .filter((i) => i.is_completed && i.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    )
    .slice(0, 5);

  // 最近追加したアイテム (直近5件)
  const recentlyAdded = typedItems.slice(0, 5);

  // 達成カレンダーデータ (日ごとの達成数)
  const achievementData: Record<string, number> = {};
  typedItems
    .filter((i) => i.is_completed && i.completed_at)
    .forEach((i) => {
      const dateStr = new Date(i.completed_at!).toISOString().split("T")[0];
      achievementData[dateStr] = (achievementData[dateStr] ?? 0) + 1;
    });

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
      recentlyCompleted={recentlyCompleted}
      recentlyAdded={recentlyAdded}
      followerCount={followerCount ?? 0}
      totalLikes={totalLikes}
      isPublic={list.is_public}
      achievementData={achievementData}
    />
  );
}
