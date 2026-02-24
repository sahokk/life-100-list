"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

async function getOrCreateList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("認証が必要です");

  // 既存のリストを取得
  const { data: existingList } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existingList) return { list: existingList, userId: user.id };

  // なければ作成
  const { data: newList, error } = await supabase
    .from("lists")
    .insert({ user_id: user.id, is_public: false })
    .select()
    .single();

  if (error || !newList) throw new Error("リストの作成に失敗しました");

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

  return {
    list,
    items: (items ?? []) as Database["public"]["Tables"]["items"]["Row"][],
    userId,
  };
}

export async function toggleListVisibility(listId: string, isPublic: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lists")
    .update({ is_public: isPublic })
    .eq("id", listId);

  if (error) throw new Error("更新に失敗しました");

  revalidatePath("/my-list");
}

export async function addItem(listId: string, data: { title: string; description?: string; priority?: number }) {
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
    order: (count ?? 0) + 1,
  };

  const { error } = await supabase.from("items").insert(item);

  if (error) throw new Error("アイテムの追加に失敗しました");

  revalidatePath("/my-list");
}

export async function updateItem(itemId: string, data: ItemUpdate) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update(data)
    .eq("id", itemId);

  if (error) throw new Error("アイテムの更新に失敗しました");

  revalidatePath("/my-list");
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
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error("削除に失敗しました");

  revalidatePath("/my-list");
}

export async function updateItemImage(itemId: string, imageUrl: string | null) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ image_url: imageUrl })
    .eq("id", itemId);

  if (error) throw new Error("画像の更新に失敗しました");

  revalidatePath("/my-list");
}
