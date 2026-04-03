-- ============================================================
-- NewOpen - RPC 関数
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- 閲覧数のアトミックインクリメント
CREATE OR REPLACE FUNCTION increment_views(store_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE stores SET views = views + 1 WHERE id = store_id;
$$;

-- いいね数のアトミック操作（increment=true で +1, false で -1）
CREATE OR REPLACE FUNCTION toggle_like(store_id UUID, increment BOOLEAN)
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE stores
  SET likes = CASE WHEN increment THEN likes + 1 ELSE GREATEST(likes - 1, 0) END
  WHERE id = store_id
  RETURNING likes;
$$;
