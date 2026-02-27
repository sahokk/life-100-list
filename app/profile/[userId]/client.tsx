"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Database } from "@/types/database";
import type { LikeData, TagData, ItemTagData } from "@/app/my-list/queries";
import { addItem, toggleListVisibility } from "@/app/my-list/actions";
import ItemList from "@/components/item-list";
import ItemForm from "@/components/item-form";
import FollowButton from "@/components/follow-button";
import { useToast } from "@/components/toast";

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
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const completedCount = items.filter((i) => i.is_completed).length;
  const canViewList = list && (list.is_public || isOwner);

  async function handleToggleVisibility(checked: boolean) {
    if (!list) return;
    try {
      await toggleListVisibility(list.id, checked);
      showToast(checked ? "リストを公開しました" : "リストを非公開にしました");
    } catch {
      showToast("更新に失敗しました", "error");
    }
  }

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
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-2xl font-bold text-blue-600 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300">
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
          {isOwner && list && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={list.is_public}
                onChange={(e) => handleToggleVisibility(e.target.checked)}
                className="rounded"
              />
              公開
            </label>
          )}
        </div>

        {/* オーナー: アイテム追加 */}
        {isOwner && list && (
          <div className="mb-6">
            {showForm ? (
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <ItemForm
                  userId={profile.id}
                  availableTags={availableTags}
                  onSubmit={async (data) => {
                    try {
                      await addItem(list.id, data);
                      showToast("アイテムを追加しました");
                    } catch {
                      showToast("追加に失敗しました", "error");
                    }
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full rounded-xl border-2 border-dashed border-zinc-300 py-3 text-sm text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"
              >
                + やりたいことを追加
              </button>
            )}
          </div>
        )}

        {/* アイテム一覧 */}
        {canViewList ? (
          <ItemList
            items={items}
            editable={isOwner}
            userId={isOwner ? profile.id : undefined}
            likes={likes}
            isLoggedIn={isLoggedIn}
            availableTags={availableTags}
            itemTags={itemTags}
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
