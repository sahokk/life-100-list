"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

async function sendLikeNotification(
  supabase: SupabaseClient,
  itemId: string,
  likerId: string
) {
  const { data: item } = await supabase
    .from("items")
    .select("list_id")
    .eq("id", itemId)
    .single();
  if (!item) return;

  const { data: list } = await supabase
    .from("lists")
    .select("user_id")
    .eq("id", item.list_id)
    .single();
  if (!list || list.user_id === likerId) return;

  // 重複防止: 24時間以内の同一通知をスキップ
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", list.user_id)
    .eq("type", "like")
    .eq("related_user_id", likerId)
    .eq("related_item_id", itemId)
    .gte("created_at", oneDayAgo)
    .maybeSingle();

  if (!existing) {
    await supabase.from("notifications").insert({
      user_id: list.user_id,
      type: "like",
      related_user_id: likerId,
      related_item_id: itemId,
    });
  }
}

export async function toggleLike(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  // 既にいいね済みか確認
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    // いいね解除
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error("いいねの解除に失敗しました");
  } else {
    // いいね追加
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: user.id, item_id: itemId });
    if (error) throw new Error("いいねに失敗しました");

    await sendLikeNotification(supabase, itemId, user.id);
  }

  revalidatePath("/my-list");
  revalidatePath("/profile");
}
