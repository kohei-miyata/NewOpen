-- ============================================================
-- NewOpen - テーブル定義
-- Supabase の SQL Editor で実行してください
-- ============================================================

CREATE TABLE IF NOT EXISTS stores (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  address     TEXT        NOT NULL,
  open_date   DATE        NOT NULL,
  description TEXT,
  image_url   TEXT,
  rating      NUMERIC(3,1) NOT NULL DEFAULT 0,
  views       INTEGER     NOT NULL DEFAULT 0,
  likes       INTEGER     NOT NULL DEFAULT 0,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       UUID        REFERENCES stores(id) ON DELETE CASCADE,
  store_name     TEXT        NOT NULL,
  store_category TEXT        NOT NULL,
  title          TEXT        NOT NULL,
  description    TEXT,
  discount       TEXT        NOT NULL,
  expiry_date    DATE        NOT NULL,
  code           TEXT        NOT NULL,
  image_url      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) - 読み取りは全員に許可
ALTER TABLE stores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_read"  ON stores  FOR SELECT USING (true);
CREATE POLICY "coupons_read" ON coupons FOR SELECT USING (true);
