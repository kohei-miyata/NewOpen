-- メルマガ送信履歴テーブル
CREATE TABLE newsletter_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject    TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  sent_count INT         NOT NULL DEFAULT 0,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_history ENABLE ROW LEVEL SECURITY;
-- Service Role のみ操作可（管理者 Server Action から admin client 経由でアクセス）
