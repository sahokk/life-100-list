-- コメントテーブル
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_item_id ON comments(item_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 公開リストのアイテムへのコメントは誰でも閲覧可能
CREATE POLICY "Comments on public items are visible" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN lists ON items.list_id = lists.id
      WHERE items.id = comments.item_id
      AND lists.is_public = true
    )
  );

-- ログインユーザーは公開アイテムにコメント可能
CREATE POLICY "Authenticated users can comment on public items" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM items
      JOIN lists ON items.list_id = lists.id
      WHERE items.id = comments.item_id
      AND lists.is_public = true
    )
  );

-- 自分のコメントのみ削除可能
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- notifications の type に comment を追加
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('follow', 'like', 'comment'));
