-- ============================================
-- 1. テーブル作成
-- ============================================

-- users: プロフィール情報 (auth.users とは別)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  icon_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- lists: やりたいことリスト
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- items: リスト内のアイテム
create table public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  priority integer,
  image_url text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- インデックス
create index idx_lists_user_id on public.lists(user_id);
create index idx_items_list_id on public.items(list_id);

-- ============================================
-- 2. updated_at 自動更新トリガー
-- ============================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create trigger trg_lists_updated_at
  before update on public.lists
  for each row execute function public.update_updated_at();

create trigger trg_items_updated_at
  before update on public.items
  for each row execute function public.update_updated_at();

-- ============================================
-- 3. ユーザー登録時にプロフィール自動作成
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'ユーザー'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

-- users テーブル
alter table public.users enable row level security;

-- 誰でも閲覧可能
create policy "users_select_all"
  on public.users for select
  using (true);

-- 本人のみ更新可能
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- lists テーブル
alter table public.lists enable row level security;

-- 公開リストは誰でも閲覧可、非公開は本人のみ
create policy "lists_select"
  on public.lists for select
  using (is_public or auth.uid() = user_id);

-- 本人のみ作成可能
create policy "lists_insert_own"
  on public.lists for insert
  with check (auth.uid() = user_id);

-- 本人のみ更新可能
create policy "lists_update_own"
  on public.lists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 本人のみ削除可能
create policy "lists_delete_own"
  on public.lists for delete
  using (auth.uid() = user_id);

-- items テーブル
alter table public.items enable row level security;

-- 公開リストのアイテムは誰でも閲覧可、非公開は所有者のみ
create policy "items_select"
  on public.items for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
        and (lists.is_public or lists.user_id = auth.uid())
    )
  );

-- リスト所有者のみ作成可能
create policy "items_insert_own"
  on public.items for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  );

-- リスト所有者のみ更新可能
create policy "items_update_own"
  on public.items for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  );

-- リスト所有者のみ削除可能
create policy "items_delete_own"
  on public.items for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. Storage バケット (画像アップロード用)
-- ============================================

insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- 認証済みユーザーのみアップロード可能 (自分のフォルダのみ)
create policy "images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 認証済みユーザーは自分のファイルのみ更新可能
create policy "images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 認証済みユーザーは自分のファイルのみ削除可能
create policy "images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 公開バケットなので誰でも閲覧可能
create policy "images_select_all"
  on storage.objects for select
  using (bucket_id = 'images');
