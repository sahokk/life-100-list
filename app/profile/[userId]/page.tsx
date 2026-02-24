import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ItemList from "@/components/item-list";
import type { Database } from "@/types/database";

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

  // 公開リスト (本人の場合は非公開でも表示)
  const listQuery = supabase
    .from("lists")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: list } = await listQuery;

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

  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start gap-6">
        {profile.icon_url ? (
          <Image
            src={profile.icon_url}
            alt={profile.username}
            width={96}
            height={96}
            className="rounded-full object-cover"
            style={{ width: 96, height: 96 }}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 text-3xl text-zinc-500 dark:bg-zinc-700">
            👤
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {isOwner && (
              <Link
                href="/settings/profile"
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                編集
              </Link>
            )}
          </div>
          {profile.bio && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}
          {canViewList && (
            <p className="mt-2 text-sm text-zinc-500">
              {completedCount} / {items.length} 達成
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">やりたいことリスト</h2>
        {canViewList ? (
          <ItemList items={items} />
        ) : list && !list.is_public ? (
          <p className="text-sm text-zinc-500">このリストは非公開です</p>
        ) : (
          <p className="text-sm text-zinc-500">まだリストがありません</p>
        )}
      </div>
    </div>
  );
}
