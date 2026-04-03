-- ============================================================
-- NewOpen - migration2: SNSリンク + ユーザーいいね
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- SNSリンク列追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS sns_links JSONB;

-- ユーザーいいねテーブル
CREATE TABLE IF NOT EXISTS store_likes (
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id  UUID REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, store_id)
);

ALTER TABLE store_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_read"   ON store_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON store_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON store_likes FOR DELETE USING (auth.uid() = user_id);

-- テストデータに sns_links を追加
UPDATE stores SET sns_links = '{"instagram":"https://www.instagram.com/"}' WHERE id = 'aaaaaaaa-0001-0001-0001-000000000001';
UPDATE stores SET sns_links = '{"instagram":"https://www.instagram.com/","twitter":"https://twitter.com/"}' WHERE id = 'aaaaaaaa-0002-0002-0002-000000000002';
