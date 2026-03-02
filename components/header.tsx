"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserProfile = { username: string; icon_url: string | null };

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const fetchUnreadCount = useCallback(
    async (userId: string) => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      setUnreadCount(count ?? 0);
    },
    [supabase]
  );

  useEffect(() => {
    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("users")
        .select("username, icon_url")
        .eq("id", userId)
        .single();
      if (data) setProfile(data);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchUnreadCount(user.id);
        fetchProfile(user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        fetchUnreadCount(newUser.id);
        fetchProfile(newUser.id);
      } else {
        setUnreadCount(0);
        setProfile(null);
      }
    });

    // 30秒ごとにポーリング
    const interval = setInterval(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) fetchUnreadCount(user.id);
      });
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [supabase, supabase.auth, fetchUnreadCount]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          人生100リスト
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : user ? (
            <>
              <Link
                href="/my-list"
                className="text-sm hover:text-blue-600"
              >
                マイページ
              </Link>
              <Link
                href="/notifications"
                className="relative hover:text-blue-600"
                title="通知"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href={`/profile/${user.id}`}
                title="プロフィール"
              >
                {profile?.icon_url ? (
                  <Image
                    src={profile.icon_url}
                    alt={profile.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
                    {profile?.username?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm hover:text-blue-600"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-blue-700"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
