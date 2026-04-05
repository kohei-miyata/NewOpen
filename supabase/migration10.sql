-- Migration 10: アクセスログテーブル（IPジオロケーション）
CREATE TABLE IF NOT EXISTS access_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture TEXT,
  region     TEXT,
  country    TEXT        NOT NULL DEFAULT 'JP',
  path       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 古いログを自動削除するインデックス（集計用）
CREATE INDEX IF NOT EXISTS access_logs_created_at_idx ON access_logs (created_at);
CREATE INDEX IF NOT EXISTS access_logs_prefecture_idx ON access_logs (prefecture);

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- INSERT は誰でも可（匿名でもトラッキング）、SELECT は不可（adminはservice_role経由で取得）
CREATE POLICY "access_logs_insert" ON access_logs FOR INSERT WITH CHECK (true);
