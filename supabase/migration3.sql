-- migration3.sql

-- 1. rating カラム削除
ALTER TABLE stores DROP COLUMN IF EXISTS rating;

-- 2. owner_id カラム追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- オーナーが自分の店舗を更新できるポリシー
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'owners_update_own_stores' AND tablename = 'stores'
  ) THEN
    CREATE POLICY "owners_update_own_stores"
      ON stores FOR UPDATE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'owners_delete_own_stores' AND tablename = 'stores'
  ) THEN
    CREATE POLICY "owners_delete_own_stores"
      ON stores FOR DELETE
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 3. contacts テーブル
CREATE TABLE IF NOT EXISTS contacts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'contacts_insert' AND tablename = 'contacts'
  ) THEN
    CREATE POLICY "contacts_insert"
      ON contacts FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
