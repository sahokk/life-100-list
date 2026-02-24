import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type PublicList = { id: string; user_id: string; is_public: boolean; updated_at: string };
type UserInfo = { id: string; username: string; icon_url: string | null };
type ItemStat = { list_id: string; is_completed: boolean };

export default async function Home() {
  const supabase = await createClient();

  // 公開リストを持つユーザーを最新順で取得
  const { data: publicLists } = await supabase
    .from("lists")
    .select("id, user_id, is_public, updated_at")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(20);

  // ユーザー情報を取得
  const userIds = [...new Set((publicLists ?? []).map((l: PublicList) => l.user_id))];
  const { data: users } = userIds.length > 0
    ? await supabase.from("users").select("id, username, icon_url").in("id", userIds)
    : { data: [] };

  const usersMap = new Map((users ?? []).map((u: UserInfo) => [u.id, u]));

  // 各リストのアイテム数と達成数を取得
  const listIds = (publicLists ?? []).map((l: PublicList) => l.id);
  const { data: items } = listIds.length > 0
    ? await supabase.from("items").select("list_id, is_completed").in("list_id", listIds)
    : { data: [] };

  const statsMap = new Map<string, { total: number; completed: number }>();
  (items ?? []).forEach((item: ItemStat) => {
    const stat = statsMap.get(item.list_id) ?? { total: 0, completed: 0 };
    stat.total++;
    if (item.is_completed) stat.completed++;
    statsMap.set(item.list_id, stat);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ヒーロー */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          人生でやりたいこと100
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          やりたいことリストを作成・管理・共有しよう
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-blue-600 px-6 py-2.5 text-white hover:bg-blue-700"
          >
            はじめる
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-6 py-2.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 公開リスト一覧 */}
      {publicLists && publicLists.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">みんなのリスト</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {publicLists.map((list: PublicList) => {
              const user = usersMap.get(list.user_id);
              const stat = statsMap.get(list.id) ?? { total: 0, completed: 0 };
              const percentage = stat.total > 0
                ? Math.round((stat.completed / stat.total) * 100)
                : 0;

              return (
                <Link
                  key={list.id}
                  href={`/profile/${list.user_id}`}
                  className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-lg dark:bg-zinc-700">
                      👤
                    </div>
                    <div>
                      <p className="font-medium">
                        {user?.username ?? "ユーザー"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {stat.total}個 / 達成率 {percentage}%
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
