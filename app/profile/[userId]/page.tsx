import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getLikesForItems, getTagsForUser, getItemTags, getCommentsForItems } from "@/app/my-list/queries";
import type { Database } from "@/types/database";
import ProfileClient from "./client";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isOwner = currentUser?.id === userId;

  // フォロー情報を取得
  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

  let isFollowing = false;
  if (currentUser && !isOwner) {
    const { data: followRow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("followee_id", userId)
      .maybeSingle();
    isFollowing = !!followRow;
  }

  // リストを取得 (本人の場合は非公開でも表示、未作成なら自動作成)
  let { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!list && isOwner) {
    const { data: newList } = await supabase
      .from("lists")
      .insert({ user_id: userId, is_public: false })
      .select()
      .single();
    list = newList;
  }

  const canViewList = list && (list.is_public || isOwner);

  let items: ItemRow[] = [];
  if (canViewList) {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", list.id)
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });
    items = (data ?? []) as ItemRow[];
  }

  const itemIds = items.map((i) => i.id);
  const [likes, availableTags, itemTags, comments] = await Promise.all([
    getLikesForItems(itemIds, currentUser?.id ?? null),
    getTagsForUser(userId),
    getItemTags(itemIds),
    getCommentsForItems(itemIds),
  ]);

  return (
    <ProfileClient
      profile={profile}
      list={list}
      items={items}
      likes={likes}
      isOwner={isOwner}
      isLoggedIn={!!currentUser}
      isFollowing={isFollowing}
      followerCount={followerCount ?? 0}
      followingCount={followingCount ?? 0}
      availableTags={availableTags}
      itemTags={itemTags}
      comments={comments}
      currentUserId={currentUser?.id ?? null}
    />
  );
}
