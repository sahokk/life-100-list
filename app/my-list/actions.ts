"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

export async function toggleListVisibility(listId: string, isPublic: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lists")
    .update({ is_public: isPublic })
    .eq("id", listId);

  if (error) throw new Error("更新に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function addItem(listId: string, data: { title: string; description?: string; priority?: number; image_url?: string; tag_ids?: string[] }) {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("タイトルは必須です");
  }
  if (data.title.length > 200) {
    throw new Error("タイトルは200文字以内にしてください");
  }
  if (data.description && data.description.length > 2000) {
    throw new Error("メモは2000文字以内にしてください");
  }

  const supabase = await createClient();

  // 現在のアイテム数を取得して order を設定
  const { count } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("list_id", listId);

  const item: ItemInsert = {
    list_id: listId,
    title: data.title,
    description: data.description || null,
    priority: data.priority || null,
    image_url: data.image_url || null,
    order: (count ?? 0) + 1,
  };

  const { data: newItem, error } = await supabase.from("items").insert(item).select("id").single();

  if (error || !newItem) throw new Error("アイテムの追加に失敗しました");

  // タグを紐付け
  if (data.tag_ids && data.tag_ids.length > 0) {
    await supabase.from("item_tags").insert(
      data.tag_ids.map((tag_id) => ({ item_id: newItem.id, tag_id }))
    );
  }

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function updateItem(itemId: string, data: ItemUpdate) {
  if (data.title !== undefined && data.title?.trim().length === 0) {
    throw new Error("タイトルは必須です");
  }
  if (data.title && data.title.length > 200) {
    throw new Error("タイトルは200文字以内にしてください");
  }
  if (data.description && data.description.length > 2000) {
    throw new Error("メモは2000文字以内にしてください");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update(data)
    .eq("id", itemId);

  if (error) throw new Error("アイテムの更新に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function toggleItemCompleted(itemId: string, isCompleted: boolean) {
  const supabase = await createClient();

  const update: ItemUpdate = {
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("items")
    .update(update)
    .eq("id", itemId);

  if (error) throw new Error("更新に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error("削除に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function updateCompletedAt(itemId: string, date: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ completed_at: new Date(date).toISOString() })
    .eq("id", itemId);

  if (error) throw new Error("達成日の更新に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function updateItemTags(itemId: string, tagIds: string[]) {
  const supabase = await createClient();

  // 既存のタグを削除
  await supabase.from("item_tags").delete().eq("item_id", itemId);

  // 新しいタグを挿入
  if (tagIds.length > 0) {
    const { error } = await supabase.from("item_tags").insert(
      tagIds.map((tag_id) => ({ item_id: itemId, tag_id }))
    );
    if (error) throw new Error("タグの更新に失敗しました");
  }

  revalidatePath("/my-list");
  revalidatePath("/profile");
}

export async function createCustomTag(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, is_preset: false, user_id: user.id })
    .select("id, name, is_preset")
    .single();

  if (error || !data) throw new Error("タグの作成に失敗しました");

  return data;
}

export async function updateItemImage(itemId: string, imageUrl: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ image_url: imageUrl })
    .eq("id", itemId);

  if (error) throw new Error("画像の更新に失敗しました");

  revalidatePath("/my-list");
  revalidatePath("/profile");
}
