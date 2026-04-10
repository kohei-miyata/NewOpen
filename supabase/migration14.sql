-- 店舗の日別閲覧数履歴（アナリティクス用）
CREATE TABLE store_view_history (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id   UUID    NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date       DATE    NOT NULL DEFAULT CURRENT_DATE,
  count      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (store_id, date)
);

CREATE INDEX ON store_view_history (store_id, date);

ALTER TABLE store_view_history ENABLE ROW LEVEL SECURITY;

-- オーナーは自分の店舗の履歴を参照できる
CREATE POLICY "owners can read their store view history"
  ON store_view_history FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- サービスロール（API Route）は自由に insert/update できる
CREATE POLICY "service role full access"
  ON store_view_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 日別閲覧数をインクリメント（なければ挿入）
CREATE OR REPLACE FUNCTION upsert_view_history(p_store_id UUID, p_date DATE)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO store_view_history (store_id, date, count)
  VALUES (p_store_id, p_date, 1)
  ON CONFLICT (store_id, date)
  DO UPDATE SET count = store_view_history.count + 1;
$$;
