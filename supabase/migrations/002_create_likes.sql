-- ============================================
-- いいね機能
-- ============================================

-- likes テーブル
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, item_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_item_id ON public.likes(item_id);

-- RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 誰でも公開アイテムのいいね数を閲覧可能
CREATE POLICY "likes_select_public" ON public.likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.items i
      JOIN public.lists l ON l.id = i.list_id
      WHERE i.id = likes.item_id AND l.is_public = true
    )
  );

-- 認証済みユーザーのみいいね可能（自分のいいねのみ作成）
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);
