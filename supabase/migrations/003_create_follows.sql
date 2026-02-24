-- ============================================
-- フォロー機能
-- ============================================

-- follows テーブル
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(follower_id, followee_id),
  CHECK (follower_id != followee_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON public.follows(followee_id);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 誰でもフォロー関係を閲覧可能
CREATE POLICY "follows_select_all" ON public.follows
  FOR SELECT USING (true);

-- 認証済みユーザーのみフォロー可能（自分がフォローする側のみ）
CREATE POLICY "follows_insert_own" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 自分のフォローのみ解除可能
CREATE POLICY "follows_delete_own" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);
