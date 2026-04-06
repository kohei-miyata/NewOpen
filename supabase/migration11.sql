-- migration11: クーポン有効/無効 + いいねフォルダ

-- クーポンに is_active カラムを追加
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- いいねフォルダテーブル
CREATE TABLE IF NOT EXISTS like_folders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE like_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "like_folders_own" ON like_folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- store_likes にフォルダ外部キーを追加
ALTER TABLE store_likes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES like_folders(id) ON DELETE SET NULL;

-- contacts に管理者向け SELECT ポリシーを追加（admin client はサービスロールなので不要だが念のため）
-- admin client (service role) は RLS をスキップするため追加不要
