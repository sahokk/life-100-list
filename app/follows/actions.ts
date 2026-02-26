"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");
  if (user.id === targetUserId) throw new Error("自分自身をフォローできません");

  // 既にフォロー済みか確認
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followee_id", targetUserId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error("フォロー解除に失敗しました");
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: targetUserId });
    if (error) throw new Error("フォローに失敗しました");

    // フォロー通知を送信（重複防止: 24時間以内の同一通知をスキップ）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingNotif } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", targetUserId)
      .eq("type", "follow")
      .eq("related_user_id", user.id)
      .gte("created_at", oneDayAgo)
      .maybeSingle();

    if (!existingNotif) {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "follow",
        related_user_id: user.id,
      });
    }
  }

  revalidatePath(`/profile/${targetUserId}`);
}
