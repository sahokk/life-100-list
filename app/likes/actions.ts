"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  }

  revalidatePath("/my-list");
  revalidatePath("/profile");
}
