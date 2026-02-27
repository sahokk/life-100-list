"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(itemId: string, body: string) {
  if (!body || body.trim().length === 0) {
    throw new Error("コメントを入力してください");
  }
  if (body.length > 500) {
    throw new Error("コメントは500文字以内にしてください");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  const { error } = await supabase.from("comments").insert({
    item_id: itemId,
    user_id: user.id,
    body: body.trim(),
  });

  if (error) throw new Error("コメントの投稿に失敗しました");

  // アイテムオーナーに通知（自分のアイテムには通知しない）
  const { data: item } = await supabase
    .from("items")
    .select("list_id")
    .eq("id", itemId)
    .single();

  if (item) {
    const { data: list } = await supabase
      .from("lists")
      .select("user_id")
      .eq("id", item.list_id)
      .single();

    if (list && list.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: list.user_id,
        type: "comment",
        related_user_id: user.id,
        related_item_id: itemId,
      });
    }
  }

  revalidatePath("/profile");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw new Error("コメントの削除に失敗しました");

  revalidatePath("/profile");
}
