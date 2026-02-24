import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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

  return {
    list,
    items: (items ?? []) as Database["public"]["Tables"]["items"]["Row"][],
    userId,
  };
}
