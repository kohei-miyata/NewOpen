-- ============================================================
-- NewOpen - サンプルデータ v2 (rating削除後)
-- migration3.sql 実行後にこのファイルを実行してください
-- ============================================================

-- 既存データをクリア
TRUNCATE TABLE store_likes RESTART IDENTITY CASCADE;
TRUNCATE TABLE coupons     RESTART IDENTITY CASCADE;
TRUNCATE TABLE stores      RESTART IDENTITY CASCADE;

-- ============================================================
-- stores (rating カラムなし)
-- ※ まもなくオープン用に open_date > 今日 のデータも含む
-- ============================================================
INSERT INTO stores (id, name, category, address, open_date, description, image_url, views, likes, tags, hours_text, photos, sns_links) VALUES

-- === オープン済み ===
(
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Bistro Nakamura',
  'レストラン',
  '東京都渋谷区神南1-2-3',
  '2026-03-15',
  '旬の食材を使ったフレンチビストロ。ランチ・ディナー共にリーズナブルに楽しめます。シェフのおまかせコースが人気。',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  1240, 312,
  ARRAY['フレンチ', 'ランチ', 'ディナー', 'コース'],
  '11:30〜14:00 / 18:00〜22:00（月曜定休）',
  ARRAY[
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80'
  ],
  '{"website": "https://example.com", "instagram": "https://instagram.com/bistronakamura"}'
),
(
  'aaaaaaaa-0002-0002-0002-000000000002',
  '猫カフェ Mew',
  'カフェ',
  '東京都新宿区歌舞伎町2-5-1',
  '2026-03-20',
  '20匹以上の看板猫と過ごせる癒しの空間。自家焙煎コーヒーとオリジナルスイーツが楽しめます。',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  2980, 891,
  ARRAY['猫カフェ', 'コーヒー', 'スイーツ', '癒し'],
  '10:00〜20:00（無休）',
  ARRAY[
    'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&q=80'
  ],
  '{"instagram": "https://instagram.com/cafemew"}'
),
(
  'aaaaaaaa-0003-0003-0003-000000000003',
  '麺屋 天空',
  'ラーメン',
  '東京都台東区浅草3-7-2',
  '2026-03-25',
  '北海道産昆布と鹿児島産かつおの黄金スープ。濃厚なのに後味スッキリの新感覚ラーメンを提供。',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  3500, 1023,
  ARRAY['醤油', '塩', '濃厚', '行列必至'],
  '11:00〜15:00 / 18:00〜22:00（火曜定休）',
  ARRAY[]::TEXT[],
  NULL
),
(
  'aaaaaaaa-0004-0004-0004-000000000004',
  'SAKURA Patisserie',
  'スイーツ',
  '東京都港区表参道4-1-8',
  '2026-03-30',
  'パリ帰りのパティシエが手がける本格フランス菓子。季節のフルーツを使ったタルトが看板商品。',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  4200, 1500,
  ARRAY['ケーキ', 'タルト', 'フランス菓子', 'テイクアウト'],
  '10:00〜19:00（水曜定休）',
  ARRAY[
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80',
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80'
  ],
  '{"instagram": "https://instagram.com/sakura_patisserie", "twitter": "https://twitter.com/sakura_cake"}'
),
(
  'aaaaaaaa-0005-0005-0005-000000000005',
  'IRON BODY GYM',
  'ジム',
  '東京都品川区大崎1-11-2',
  '2026-04-01',
  '最新設備を揃えた24時間営業のフィットネスジム。パーソナルトレーニング付きプランも充実。',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  980, 245,
  ARRAY['24時間', 'パーソナル', 'マシン', '初心者歓迎'],
  '24時間営業（年中無休）',
  ARRAY[]::TEXT[],
  '{"website": "https://ironbodygym.example.com"}'
),
(
  'aaaaaaaa-0006-0006-0006-000000000006',
  'Hair Salon BLOOM',
  '美容院',
  '東京都世田谷区三軒茶屋2-3-6',
  '2026-04-02',
  'オーガニックカラーにこだわったヘアサロン。頭皮に優しい施術と丁寧なカウンセリングが好評。',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  1560, 487,
  ARRAY['オーガニック', 'カラー', 'トリートメント', '女性専用'],
  '10:00〜20:00（月曜定休）',
  ARRAY[]::TEXT[],
  '{"instagram": "https://instagram.com/bloom_hair"}'
),
(
  'aaaaaaaa-0007-0007-0007-000000000007',
  '居酒屋 炭火 まさる',
  '居酒屋',
  '東京都中野区中野5-2-4',
  '2026-03-18',
  '九州直送の新鮮魚介を炭火で豪快に焼き上げる。日本各地の地酒50種類以上が揃う本格居酒屋。',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  2100, 634,
  ARRAY['炭火焼き', '地酒', '海鮮', '宴会'],
  '17:00〜24:00（日曜定休）',
  ARRAY[]::TEXT[],
  NULL
),
(
  'aaaaaaaa-0008-0008-0008-000000000008',
  'SELECT VINTAGE',
  'ショップ',
  '東京都渋谷区代官山町1-5',
  '2026-03-28',
  '世界中からセレクトしたヴィンテージ衣料と雑貨。オーナー自らが買い付けた一点物が中心。',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
  870, 198,
  ARRAY['ヴィンテージ', '古着', 'セレクト', '一点物'],
  '12:00〜20:00（火曜定休）',
  ARRAY[]::TEXT[],
  '{"instagram": "https://instagram.com/select_vintage"}'
),

-- === まもなくオープン（open_date > 2026-04-03） ===
(
  'aaaaaaaa-0009-0009-0009-000000000009',
  'SPICE GARDEN',
  'レストラン',
  '東京都渋谷区恵比寿1-8-5',
  '2026-04-10',
  '南インドのスパイスを駆使した本格カレーレストラン。ビリヤニやドーサも楽しめます。',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  0, 0,
  ARRAY['カレー', 'インド料理', 'ビリヤニ', 'ランチ'],
  '11:30〜15:00 / 18:00〜22:00（水曜定休）',
  ARRAY[]::TEXT[],
  '{"instagram": "https://instagram.com/spice_garden_tokyo"}'
),
(
  'aaaaaaaa-0010-0010-0010-000000000010',
  'TOKYO ROAST COFFEE',
  'カフェ',
  '東京都文京区本郷3-12-7',
  '2026-04-15',
  'スペシャルティコーヒーにこだわった自家焙煎カフェ。世界各地の豆を丁寧にハンドドリップで提供。',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  0, 0,
  ARRAY['スペシャルティ', '自家焙煎', 'ハンドドリップ', '豆販売'],
  '8:00〜19:00（無休）',
  ARRAY[]::TEXT[],
  '{"twitter": "https://twitter.com/tokyoroastcoffee"}'
),
(
  'aaaaaaaa-0011-0011-0011-000000000011',
  'OMAKASE SUSHI 匠',
  'レストラン',
  '東京都中央区銀座6-4-2',
  '2026-04-20',
  '築地市場から仕入れる旬の魚介を使った本格江戸前寿司。カウンター9席のみの完全おまかせコース。',
  'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
  0, 0,
  ARRAY['寿司', '江戸前', 'おまかせ', '高級'],
  '18:00〜22:00（日・月曜定休）',
  ARRAY[]::TEXT[],
  '{"website": "https://sushi-takumi.example.com"}'
),
(
  'aaaaaaaa-0012-0012-0012-000000000012',
  'Nail & Beauty LUMIERE',
  'その他',
  '東京都目黒区自由が丘2-9-3',
  '2026-04-25',
  'ネイル・まつ毛・フェイシャルが一箇所で楽しめる複合型ビューティーサロン。完全予約制。',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
  0, 0,
  ARRAY['ネイル', 'まつ毛', 'フェイシャル', '完全予約制'],
  '10:00〜20:00（火曜定休）',
  ARRAY[]::TEXT[],
  '{"instagram": "https://instagram.com/lumiere_beauty"}'
),
(
  'aaaaaaaa-0013-0013-0013-000000000013',
  'CRAFT BEER BAR HOPS',
  '居酒屋',
  '東京都台東区蔵前4-2-8',
  '2026-04-30',
  '国内外100種類以上のクラフトビールを取り揃えたビアバー。フードはビールに合う本格アメリカングリル。',
  'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',
  0, 0,
  ARRAY['クラフトビール', 'バー', 'グリル', '100種類'],
  '15:00〜24:00（月曜定休）',
  ARRAY[]::TEXT[],
  '{"instagram": "https://instagram.com/craftbeer_hops"}'
);

-- ============================================================
-- coupons
-- ============================================================
INSERT INTO coupons (store_id, store_name, store_category, title, description, discount, expiry_date, code, image_url) VALUES
(
  'aaaaaaaa-0001-0001-0001-000000000001',
  'Bistro Nakamura', 'レストラン',
  'オープン記念ランチ20%OFF',
  'ランチメニュー全品20%割引。ドリンク1杯サービス付き。',
  '20% OFF', '2026-06-30', 'NAKAMURA20',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'
),
(
  'aaaaaaaa-0002-0002-0002-000000000002',
  '猫カフェ Mew', 'カフェ',
  '入場料500円割引',
  '通常1,500円の入場料が1,000円に。ドリンク1杯付き。',
  '500円 OFF', '2026-07-15', 'MEW500',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80'
),
(
  'aaaaaaaa-0003-0003-0003-000000000003',
  '麺屋 天空', 'ラーメン',
  '替え玉1回無料',
  'らーめん注文で替え玉1回無料。オープン記念サービス。',
  '替え玉無料', '2026-06-25', 'TENKYU1',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80'
),
(
  'aaaaaaaa-0004-0004-0004-000000000004',
  'SAKURA Patisserie', 'スイーツ',
  'タルト1個プレゼント',
  '3,000円以上のお買い上げでシーズンタルト1個プレゼント。',
  '1個無料', '2026-06-20', 'SAKURA1',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
),
(
  'aaaaaaaa-0005-0005-0005-000000000005',
  'IRON BODY GYM', 'ジム',
  '入会金無料 + 初月半額',
  'オープン記念で入会金（10,000円）無料、初月会費50%OFF。',
  '入会金無料 + 初月50%', '2026-07-31', 'IRON0501',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'
),
(
  'aaaaaaaa-0006-0006-0006-000000000006',
  'Hair Salon BLOOM', '美容院',
  '初回カット + カラー30%OFF',
  '初回ご来店限定、カット＋カラーセットを30%割引。',
  '30% OFF', '2026-07-10', 'BLOOM30',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80'
),
(
  'aaaaaaaa-0009-0009-0009-000000000009',
  'SPICE GARDEN', 'レストラン',
  'グランドオープン記念 ランチ無料',
  'オープン当日（4/10）限定でランチ1名様無料。要事前予約。',
  'ランチ1名無料', '2026-04-10', 'SPICE410',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80'
),
(
  'aaaaaaaa-0013-0013-0013-000000000013',
  'CRAFT BEER BAR HOPS', '居酒屋',
  'オープン記念 乾杯ビール1杯無料',
  'オープン月（4月）中、来店でクラフトビール1杯サービス。',
  'ビール1杯無料', '2026-04-30', 'HOPS0430',
  'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80'
);
