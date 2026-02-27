-- タグテーブル
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- プリセットタグを挿入
INSERT INTO tags (name, is_preset) VALUES
  ('旅行', true),
  ('グルメ', true),
  ('スキル', true),
  ('健康', true),
  ('趣味', true),
  ('キャリア', true),
  ('人間関係', true),
  ('お金', true),
  ('学び', true),
  ('冒険', true);

-- アイテム-タグ中間テーブル
CREATE TABLE item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- tags: プリセットは誰でも読める、カスタムは作成者のみ
CREATE POLICY "Preset tags are visible to all" ON tags
  FOR SELECT USING (is_preset = true);
CREATE POLICY "Users can see own custom tags" ON tags
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create custom tags" ON tags
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_preset = false);
CREATE POLICY "Users can delete own custom tags" ON tags
  FOR DELETE USING (user_id = auth.uid() AND is_preset = false);

-- item_tags: アイテムのオーナーのみ操作可能
CREATE POLICY "Users can manage tags on own items" ON item_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN lists ON items.list_id = lists.id
      WHERE items.id = item_tags.item_id
      AND lists.user_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view item tags" ON item_tags
  FOR SELECT USING (true);
