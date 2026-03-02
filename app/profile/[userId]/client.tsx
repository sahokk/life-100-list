"use client";

import Image from "next/image";
import Link from "next/link";
import type { Database } from "@/types/database";
import type { LikeData, TagData, ItemTagData, CommentData } from "@/app/my-list/queries";
import ItemList from "@/components/item-list";
import FollowButton from "@/components/follow-button";

type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

type Props = {
  profile: UserRow;
  list: ListRow | null;
  items: ItemRow[];
  likes: LikeData[];
  isOwner: boolean;
  isLoggedIn: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  availableTags: TagData[];
  itemTags: ItemTagData[];
  comments: CommentData[];
  currentUserId: string | null;
};

export default function ProfileClient({
  profile,
  list,
  items,
  likes,
  isOwner,
  isLoggedIn,
  isFollowing,
  followerCount,
  followingCount,
  availableTags,
  itemTags,
  comments,
  currentUserId,
}: Readonly<Props>) {
  const completedCount = items.filter((i) => i.is_completed).length;
  const canViewList = list && (list.is_public || isOwner);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* プロフィールヘッダー */}
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
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-2xl font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.username}
            </h1>
            {isOwner && (
              <Link
                href="/settings/profile"
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                編集
              </Link>
            )}
            {!isOwner && isLoggedIn && (
              <FollowButton
                targetUserId={profile.id}
                isFollowing={isFollowing}
              />
            )}
          </div>
          <div className="mt-2 flex gap-4 text-sm text-zinc-500">
            <span>
              <strong className="text-zinc-700 dark:text-zinc-300">
                {followingCount}
              </strong>{" "}
              フォロー中
            </span>
            <span>
              <strong className="text-zinc-700 dark:text-zinc-300">
                {followerCount}
              </strong>{" "}
              フォロワー
            </span>
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

      {/* リストセクション */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">やりたいことリスト</h2>
          {isOwner && (
            <Link
              href="/my-list"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              マイページでリストを編集 →
            </Link>
          )}
        </div>

        {/* アイテム一覧（閲覧専用） */}
        {canViewList ? (
          <ItemList
            items={items}
            listUserId={profile.id}
            likes={likes}
            isLoggedIn={isLoggedIn}
            availableTags={availableTags}
            itemTags={itemTags}
            comments={comments}
            currentUserId={currentUserId}
          />
        ) : list && !list.is_public ? (
          <p className="text-sm text-zinc-500">このリストは非公開です</p>
        ) : (
          <p className="text-sm text-zinc-500">まだリストがありません</p>
        )}
      </div>
    </div>
  );
}
