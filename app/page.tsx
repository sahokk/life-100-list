import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getFollowingFeed, getDiscoverUsers } from "./page-queries";
import HomeClient from "./page-client";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログイン済み: フィード表示
  if (user) {
    const [feedUsers, discoverUsers] = await Promise.all([
      getFollowingFeed(user.id),
      getDiscoverUsers(),
    ]);

    return <HomeClient feedUsers={feedUsers} discoverUsers={discoverUsers} />;
  }

  // 未ログイン: ランディングページ
  const discoverUsers = await getDiscoverUsers();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
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
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-white shadow-sm hover:bg-blue-700"
          >
            はじめる
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-6 py-2.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ログイン
          </Link>
        </div>
      </section>

      {/* 公開リスト一覧 */}
      {discoverUsers.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">みんなのリスト</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {discoverUsers.map((u) => {
              const percentage =
                u.itemCount > 0
                  ? Math.round((u.completedCount / u.itemCount) * 100)
                  : 0;

              return (
                <Link
                  key={u.userId}
                  href={`/profile/${u.userId}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-800"
                >
                  {u.iconUrl ? (
                    <Image
                      src={u.iconUrl}
                      alt={u.username}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      style={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-lg font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{u.username}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {u.completedCount}/{u.itemCount}
                      </span>
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
