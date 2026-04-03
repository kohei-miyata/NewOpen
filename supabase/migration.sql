-- ============================================================
-- NewOpen - カラム追加マイグレーション
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- 店舗テーブルに新カラムを追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS lat        FLOAT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS lng        FLOAT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS hours_text TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS photos     TEXT[] NOT NULL DEFAULT '{}';

-- 登録フォームからの INSERT を許可（MVP: 認証なし）
DROP POLICY IF EXISTS "stores_insert" ON stores;
CREATE POLICY "stores_insert" ON stores FOR INSERT WITH CHECK (true);

-- seed.sql で使ったテスト店舗の座標・営業時間・写真を更新
UPDATE stores SET
  lat = 35.6612, lng = 139.7010,
  hours_text = '11:30〜14:30 / 18:00〜22:00（月曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80']
WHERE id = 'aaaaaaaa-0001-0001-0001-000000000001';

UPDATE stores SET
  lat = 35.6938, lng = 139.7034,
  hours_text = '10:00〜20:00（無休）',
  photos = ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80']
WHERE id = 'aaaaaaaa-0002-0002-0002-000000000002';

UPDATE stores SET
  lat = 35.7148, lng = 139.7967,
  hours_text = '11:00〜15:00 / 18:00〜23:00（火曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&q=80']
WHERE id = 'aaaaaaaa-0003-0003-0003-000000000003';

UPDATE stores SET
  lat = 35.6650, lng = 139.7101,
  hours_text = '10:00〜19:00（水曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80']
WHERE id = 'aaaaaaaa-0004-0004-0004-000000000004';

UPDATE stores SET
  lat = 35.6197, lng = 139.7281,
  hours_text = '24時間営業（年中無休）',
  photos = ARRAY['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80']
WHERE id = 'aaaaaaaa-0005-0005-0005-000000000005';

UPDATE stores SET
  lat = 35.6432, lng = 139.6689,
  hours_text = '10:00〜20:00（月曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80']
WHERE id = 'aaaaaaaa-0006-0006-0006-000000000006';

UPDATE stores SET
  lat = 35.7081, lng = 139.6641,
  hours_text = '17:00〜24:00（日曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80']
WHERE id = 'aaaaaaaa-0007-0007-0007-000000000007';

UPDATE stores SET
  lat = 35.6481, lng = 139.7019,
  hours_text = '12:00〜20:00（火・水曜定休）',
  photos = ARRAY['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80']
WHERE id = 'aaaaaaaa-0008-0008-0008-000000000008';
