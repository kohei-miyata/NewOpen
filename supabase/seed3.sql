-- ============================================================
-- NewOpen - テストデータ v3（30店舗追加）
-- seed2.sql 実行済みの状態で追加データとして投入
-- ============================================================

INSERT INTO stores (name, category, address, open_date, description, image_url, views, likes, tags, hours_text, photos, sns_links, status) VALUES

-- 東京・追加分
('TOKYO BAGEL STAND', 'カフェ', '東京都渋谷区恵比寿西1-5-8', '2026-03-10', 'NYスタイルのベーグル専門店。毎朝手作りの生地をじっくり焼き上げた本格ベーグルサンドが人気。', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', 320, 87, ARRAY['ベーグル', 'ランチ', 'テイクアウト'], '8:00〜18:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/tokyobagel"}', 'active'),

('YAKITORI BAR 炎', '居酒屋', '東京都新宿区西新宿7-3-2', '2026-03-12', '備長炭で丁寧に焼き上げる本格焼き鳥バー。全国各地の地鶏を取り揃え、自然派ワインとの相性も抜群。', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80', 540, 134, ARRAY['焼き鳥', '地鶏', 'ワイン', '炭火'], '17:30〜23:30（日曜定休）', ARRAY[]::TEXT[], NULL, 'active'),

('PILATES STUDIO CORE', 'ジム', '東京都港区南青山5-1-3', '2026-03-22', 'マシンピラティス専門スタジオ。少人数制で丁寧な指導を提供。産後ケアや体幹強化プログラムが充実。', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80', 210, 63, ARRAY['ピラティス', 'マシン', '少人数', '女性向け'], '9:00〜21:00（無休）', ARRAY[]::TEXT[], '{"website":"https://pilates-core.example.com","instagram":"https://instagram.com/pilatescore"}', 'active'),

('MOCHI SWEETS 丸', 'スイーツ', '東京都台東区浅草1-3-7', '2026-03-28', '和の素材にこだわったモダン和菓子店。季節の大福や求肥スイーツが観光客にも大人気。', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80', 890, 267, ARRAY['和菓子', '大福', 'テイクアウト', '手土産'], '10:00〜18:00（水曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/mochi_sweets_maru"}', 'active'),

('RAMEN LAB 実験室', 'ラーメン', '東京都豊島区池袋2-8-4', '2026-04-02', '科学的アプローチでスープを研究する実験的ラーメン店。月替わりの限定メニューがSNSで話題に。', 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&q=80', 1230, 389, ARRAY['創作', '限定', 'こだわり', 'インスタ映え'], '11:00〜21:00（火曜定休）', ARRAY[]::TEXT[], '{"twitter":"https://twitter.com/ramen_lab","instagram":"https://instagram.com/ramen_lab"}', 'active'),

('HAIR&MAKE PRISM', '美容院', '東京都渋谷区神宮前4-2-9', '2026-04-03', 'トレンドカラーと最新トリートメントを得意とするサロン。韓国風ヘアスタイルも対応可能。', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', 450, 112, ARRAY['カラー', '韓国風', 'トリートメント', '予約制'], '10:00〜20:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/hairprism"}', 'active'),

('VINTAGE MAP SHOP', 'ショップ', '東京都中央区日本橋2-7-1', '2026-03-15', '古地図・アンティーク地図の専門店。国内外の貴重な地図コレクションを展示・販売。額装サービスも提供。', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', 180, 45, ARRAY['アンティーク', '地図', 'インテリア', 'ギフト'], '11:00〜19:00（日・月曜定休）', ARRAY[]::TEXT[], NULL, 'active'),

('THAI BASIL KITCHEN', 'レストラン', '東京都文京区湯島3-4-6', '2026-03-20', 'バンコク出身のシェフが作る本格タイ料理。ガパオライスからマッサマンカレーまで幅広いメニュー。', 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80', 670, 198, ARRAY['タイ料理', 'ガパオ', 'カレー', 'スパイシー'], '11:30〜14:30 / 17:30〜22:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/thaibasilkitchen"}', 'active'),

-- 大阪
('大阪 串カツ 道頓堀本店', '居酒屋', '大阪府大阪市中央区道頓堀1-7-22', '2026-03-25', '二度漬け禁止のソースにこだわった正統派大阪串カツ。地元食材をふんだんに使った創作串も充実。', 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=600&q=80', 1890, 567, ARRAY['串カツ', '大阪名物', '揚げ物', '宴会'], '11:00〜22:00（無休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/kushikatsu_dotonbori"}', 'active'),

('OSAKA COFFEE ROASTERS', 'カフェ', '大阪府大阪市北区中崎西2-3-4', '2026-03-18', '中崎町の古民家を改装したスペシャルティコーヒー専門店。自社焙煎豆の販売も行っています。', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80', 780, 234, ARRAY['スペシャルティ', '古民家', '自家焙煎', '豆販売'], '9:00〜18:00（火曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/osaka_coffee_roasters"}', 'active'),

('たこ焼き TAKOYA', 'その他', '大阪府大阪市浪速区難波中2-1-8', '2026-04-01', '外はカリッと中はトロッとした本場大阪たこ焼き。特製ソースとマヨネーズの組み合わせが絶品。', 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&q=80', 2340, 712, ARRAY['たこ焼き', '大阪B級グルメ', 'テイクアウト', '行列'], '10:00〜21:00（無休）', ARRAY[]::TEXT[], NULL, 'active'),

('UMEDA FRENCH PATISSERIE', 'スイーツ', '大阪府大阪市北区梅田3-4-5', '2026-03-30', 'パリの名店で修行したパティシエによる本格フランス菓子。エクレアとミルフィーユが看板商品。', 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?w=600&q=80', 560, 167, ARRAY['フランス菓子', 'エクレア', 'パティスリー', '手土産'], '10:00〜19:00（水曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/umeda_patisserie"}', 'active'),

('なんば 二郎系ラーメン 轟', 'ラーメン', '大阪府大阪市中央区難波5-1-60', '2026-04-03', '大阪初上陸の本格二郎インスパイア系。背脂たっぷりの濃厚豚骨醤油スープに極太麺が絡む一杯。', 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&q=80', 1450, 423, ARRAY['二郎系', '濃厚', '大盛り', '行列必至'], '11:00〜15:00 / 18:00〜22:00（月曜定休）', ARRAY[]::TEXT[], '{"twitter":"https://twitter.com/ramen_todoroki"}', 'active'),

-- 京都
('KYOTO MATCHA CAFE 翠', 'カフェ', '京都府京都市東山区祇園町南側570-8', '2026-03-22', '宇治産最高品質の抹茶を使ったスイーツとドリンクの専門カフェ。祇園の風情ある町家で一服どうぞ。', 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=600&q=80', 3200, 987, ARRAY['抹茶', '宇治', '町家', '和スイーツ'], '10:00〜18:00（水曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/kyoto_matcha_sui"}', 'active'),

('京料理 はな膳', 'レストラン', '京都府京都市中京区麩屋町通四条上る', '2026-04-05', '旬の京野菜と地元食材を使った本格懐石料理。数寄屋造りの個室でゆったりと京の食文化を堪能。', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', 890, 312, ARRAY['懐石', '京料理', '個室', '接待'], '11:30〜14:00 / 17:30〜21:00（火曜定休）', ARRAY[]::TEXT[], '{"website":"https://hanaze n.example.com"}', 'active'),

-- 神奈川
('YOKOHAMA CRAFT GIN BAR', '居酒屋', '神奈川県横浜市中区山下町70-3', '2026-03-28', '国内外50種類以上のクラフトジンを揃えたジンバー。横浜港を眺めながら楽しむ本格カクテルが人気。', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80', 430, 128, ARRAY['クラフトジン', 'バー', 'カクテル', '港町'], '17:00〜24:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/yokohama_gin_bar"}', 'active'),

('KAMAKURA GELATO', 'スイーツ', '神奈川県鎌倉市小町2-8-5', '2026-03-20', '鎌倉の地元食材をふんだんに使ったジェラート専門店。ルバーブや鎌倉野菜など珍しいフレーバーが揃う。', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80', 1120, 345, ARRAY['ジェラート', '鎌倉', '地元食材', 'テイクアウト'], '10:00〜17:00（木曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/kamakura_gelato"}', 'active'),

-- 愛知
('NAGOYA MORNING SET 喫茶ナゴヤ', 'カフェ', '愛知県名古屋市中区栄3-15-33', '2026-03-15', '名古屋のモーニング文化を体現する老舗スタイルの新店舗。コーヒー1杯でボリューム満点のモーニングが付く。', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', 2100, 678, ARRAY['モーニング', '名古屋飯', 'トースト', 'お得'], '7:00〜14:00（水曜定休）', ARRAY[]::TEXT[], NULL, 'active'),

('味噌カツ専門店 勝利', 'レストラン', '愛知県名古屋市中村区名駅4-7-8', '2026-04-01', '名古屋名物味噌カツの専門店。八丁味噌を使ったこだわりのタレが秘伝のレシピで仕上げられる。', 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80', 1560, 489, ARRAY['味噌カツ', '名古屋めし', 'B級グルメ', '定食'], '11:00〜21:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/misokatsu_shori"}', 'active'),

-- 福岡
('博多 もつ鍋 炎上', '居酒屋', '福岡県福岡市博多区中洲2-4-20', '2026-03-25', '国産黒毛和牛のもつを使った本格博多もつ鍋専門店。みそ・醤油・塩の3種類のスープが楽しめる。', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80', 1780, 534, ARRAY['もつ鍋', '博多', '黒毛和牛', '鍋'], '17:00〜24:00（無休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/motsunabe_enjou"}', 'active'),

('HAKATA RAMEN 一番星', 'ラーメン', '福岡県福岡市中央区天神2-8-136', '2026-03-30', '豚骨の旨みを最大限に引き出した博多細麺ラーメン。替え玉無料サービスで地元民にも観光客にも人気。', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80', 2890, 867, ARRAY['博多ラーメン', '豚骨', '細麺', '替え玉'], '10:00〜翌3:00（無休）', ARRAY[]::TEXT[], NULL, 'active'),

('FUKUOKA YOGA STUDIO 凪', 'ジム', '福岡県福岡市中央区大名1-6-4', '2026-04-08', '少人数制のプレミアムヨガスタジオ。朝・昼・夜の多彩なクラスとオンラインレッスンも充実。', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80', 340, 98, ARRAY['ヨガ', '少人数', 'リラックス', '朝活'], '6:30〜22:00（無休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/fukuoka_yoga_nagi"}', 'active'),

-- 北海道
('SAPPORO SOUP CURRY 大地', 'レストラン', '北海道札幌市中央区南4条西5-1-8', '2026-03-20', '北海道産野菜をたっぷり使ったスープカレー専門店。スパイスの辛さは1〜20段階で選べる。', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', 1340, 412, ARRAY['スープカレー', '北海道野菜', '札幌', 'スパイス'], '11:00〜21:00（火曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/sapporo_curry_daichi"}', 'active'),

('北海道ソフトクリーム 牧場', 'スイーツ', '北海道札幌市中央区北4条西4-1', '2026-04-05', '道内牧場直送のフレッシュミルクを使ったソフトクリーム専門店。濃厚でなめらかな口溶けが自慢。', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80', 670, 198, ARRAY['ソフトクリーム', '北海道', '牧場', 'テイクアウト'], '10:00〜19:00（無休）', ARRAY[]::TEXT[], NULL, 'active'),

-- まもなくオープン追加分
('SHIBUYA VINYL RECORDS', 'ショップ', '東京都渋谷区宇田川町12-3', '2026-05-01', 'ジャズ・ソウル・ヒップホップを中心としたレコード専門店。試聴ブース完備でレアな一枚が見つかる。', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80', 0, 0, ARRAY['レコード', 'ジャズ', 'ヴィンテージ', '試聴'], '12:00〜20:00（火曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/shibuya_vinyl"}', 'active'),

('KOENJI ORGANIC DELI', 'カフェ', '東京都杉並区高円寺南3-44-7', '2026-05-05', 'オーガニック野菜たっぷりのデリプレートとナチュラルワインが楽しめるカフェ。ビーガン・グルテンフリー対応。', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', 0, 0, ARRAY['オーガニック', 'デリ', 'ビーガン', 'ナチュラルワイン'], '11:00〜20:00（月曜定休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/koenji_organic"}', 'active'),

('GINZA WHISKY BAR 琥珀', '居酒屋', '東京都中央区銀座8-9-13', '2026-05-10', '国産・海外ウイスキー200種類以上を取り揃えたハイエンドウイスキーバー。シガーラウンジも併設。', 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80', 0, 0, ARRAY['ウイスキー', 'バー', '銀座', 'シガー'], '17:00〜翌1:00（日曜定休）', ARRAY[]::TEXT[], NULL, 'active'),

('NAMBA BOXING GYM ファイト', 'ジム', '大阪府大阪市浪速区難波中1-4-6', '2026-05-15', 'プロボクサー監修のフィットネスボクシングジム。ダイエット目的から本格的なトレーニングまで対応。', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80', 0, 0, ARRAY['ボクシング', 'ダイエット', '格闘技', '初心者歓迎'], '7:00〜22:00（無休）', ARRAY[]::TEXT[], '{"instagram":"https://instagram.com/namba_boxing"}', 'active'),

('KYOTO WAGYU RESTAURANT 雅', 'レストラン', '京都府京都市下京区烏丸通四条下ル', '2026-05-20', '京都府産の京都肉（京都ビーフ）を使ったステーキとしゃぶしゃぶの専門店。完全個室でゆったりと。', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', 0, 0, ARRAY['和牛', 'ステーキ', 'しゃぶしゃぶ', '個室'], '11:30〜14:00 / 17:00〜22:00（月曜定休）', ARRAY[]::TEXT[], '{"website":"https://kyoto-wagyu-miyabi.example.com"}', 'active');
