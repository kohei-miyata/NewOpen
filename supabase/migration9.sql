-- Migration 9: RLS security hardening

-- 1. stores UPDATE: WITH CHECK 追加（owner_id の書き換えを防ぐ）
DROP POLICY IF EXISTS "owners_update_own_stores" ON stores;
CREATE POLICY "owners_update_own_stores"
  ON stores FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 2. stores INSERT: owner_id が自分自身であることを強制
DROP POLICY IF EXISTS "stores_insert" ON stores;
CREATE POLICY "stores_insert" ON stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
