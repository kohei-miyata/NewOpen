-- Migration 8: Security hardening

-- 1. stores INSERT: 未ログインユーザーのINSERTを禁止
DROP POLICY IF EXISTS "stores_insert" ON stores;
CREATE POLICY "stores_insert" ON stores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2. coupons: オーナーが自分の店舗のクーポンのみ操作可
DROP POLICY IF EXISTS "owners_manage_own_store_coupons" ON coupons;
CREATE POLICY "owners_manage_own_store_coupons" ON coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = coupons.store_id
        AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = coupons.store_id
        AND stores.owner_id = auth.uid()
    )
  );
