# NewOpen

新規オープン店舗情報プラットフォーム。オープン前から掲載・3年間継続掲載・完全無料。

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS |
| DB / Auth / Storage | Supabase (PostgreSQL + RLS + Storage) |
| デプロイ | Vercel |

---

## 機能一覧

### 店舗探し（一般ユーザー）

- **エリア・カテゴリ絞り込み** — 住所キーワードと9カテゴリで検索
- **まもなくオープン** — 今日から30日以内にオープン予定の店舗を表示
- **本日オープン** — 当日オープンの店舗を最優先で表示
- **最新オープン** — オープン日降順、最大3年以内の店舗
- **現在地に近い順** — ブラウザの Geolocation API で取得した座標をもとにハバサイン距離でソート（フィルターなし時のみ）
- **いいね！ランキング** — いいね数上位の店舗一覧（`/ranking`）
- **最近見たお店** — `localStorage` に保存した閲覧履歴（最大10件）
- **ステータス表示** — 「休業中」（黄）・「閉店」（グレー）のバナーをカードと詳細ページに表示

### 店舗詳細

- 写真ギャラリー（メイン1枚＋サブ最大4枚）
- SNSリンク（公式サイト / Instagram / X / TikTok / LINE）
- SNS最新投稿の埋め込み表示（X / Instagram / TikTok）
- マップ表示（Leaflet）
- いいねボタン（ログインユーザーのみ・RLS管理）
- 閲覧数カウント（同一ユーザー24時間以内の重複カウント除外）
- クーポン表示（ログインユーザーのみコード・使用ボタンを表示）

### クーポン

- クーポンカードをクリックするとモーダル表示
- 未ログインユーザーにはログイン/会員登録のCTAを表示
- 「使用する」ボタンで `coupon_uses` テーブルに記録（RLS管理）
- 使用済みのクーポンは「使用済み」表示（デバイス・ブラウザ跨ぎで反映）
- コードのコピーボタン付き
- 期限7日以内は「残りN日」警告表示

### 会員登録 / ログイン

- ロール選択：一般ユーザー / オーナー
- メール確認フロー（Supabase Auth）
- バリデーションエラーはすべて日本語
- Supabase認証エラーも日本語に変換
- 利用規約・プライバシーポリシーへの同意チェックボックス
- Bot対策：ハニーポットフィールド＋3秒タイミングチェック
- 店舗登録ページから未ログインで来た場合、サインアップページでオーナーがデフォルト選択
- BANされたユーザーは `/banned` ページにリダイレクト

### オーナー機能（`/mypage/owner`）

- **店舗登録** — 新規店舗の登録（アカウント登録必須）
  - 住所入力時に OpenStreetMap Nominatim で自動ジオコーディング（lat/lng取得）
  - 段階的フォールバック：番地 → 丁目 → 市区町村レベルで再試行
  - ジオコーディング失敗時はフォームにエラーメッセージ表示
  - **登録前プレビュー** — 保存前にモーダルで掲載イメージを確認可能
  - **審査ステータス表示** — 審査中 / 承認済み / 否認 をマイページに表示
- **店舗編集** — 店舗情報の更新（住所変更時は再ジオコーディング）
- **ステータス管理** — 営業中 / 休業中 / 閉店
- **クーポン管理** — クーポンの追加・編集・削除（`/mypage/owner/stores/[id]/coupons`）
- 保存ボタンはローディングスピナー付き（二重送信防止）

### 管理者機能（`/admin`）

- アクセス権：`user_metadata.role === "admin"` のユーザーのみ
- **ダッシュボード**
  - 総ユーザー数 / 一般ユーザー数 / オーナー数 / 掲載店舗数 / いいね総数 / 総閲覧数
  - ユーザー一覧（メール・ロール・ステータス・登録日・最終ログイン）
  - ユーザーのBAN / BAN解除（`user_metadata.status`）
  - **ログイン統計** — 1週間以内にログインしたユーザー数 / 1週間以上ログインなしのユーザー数
  - いいね上位10店舗 / 閲覧数上位10店舗
  - カテゴリ別店舗数
  - エリア別店舗数（都道府県＋市区町村レベルで集計）
  - 全店舗一覧テーブル
- **店舗審査管理**（`/admin/owners`）
  - 新規登録店舗を審査（3営業日以内）
  - 承認：ワンクリックでオーナーに承認メールを自動送信
  - 否認：テンプレート選択（風俗店舗 / 実店舗ではない / 情報不足 / カスタム）＋否認メール送信
  - メール送信履歴の件数表示
  - 審査済み一覧（審査待ちに戻す機能付き）
- **お問い合わせ対応**（`/admin/contacts`）
  - 問い合わせ一覧（各問い合わせにインラインで返信フォームを表示）
  - 返信時に「〇〇様、いつもNEW OPENをご利用いただきありがとうございます。」を自動付加してメール送信
  - 返信履歴を問い合わせごとに表示

#### 管理者ロールの付与

Supabase SQL Editor で実行：
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = '<user_uuid>';
```

### SEO / メタ情報

- ページごとの `<title>` / `<description>`
- OG タグ / Twitter Card
- `canonical` タグ
- `robots.txt`（`/api`, `/mypage`, `/admin` は noindex）
- `sitemap.xml`（店舗ページを動的生成）

---

## データベース構造

### マイグレーション一覧

| ファイル | 内容 |
|----------|------|
| `migration.sql` | stores, store_likes, contacts テーブル |
| `migration2.sql` | coupons テーブル |
| `migration3.sql` | stores に lat/lng/hours_text/photos/sns_links カラム追加 |
| `migration4.sql` | stores に tags カラム追加 |
| `migration5.sql` | stores に twitter/instagram/tiktok_post_url カラム追加 |
| `migration6.sql` | stores に status カラム追加 |
| `migration7.sql` | coupon_uses テーブル（クーポン使用履歴） |
| `migration8.sql` | RLS セキュリティ強化 |
| `migration10.sql` | terms_agreements テーブル（利用規約同意記録） |
| `migration11.sql` | like_folders テーブル / coupons.is_active カラム追加 |
| `migration12.sql` | stores に approval_status 追加 / store_email_history / contact_replies テーブル |

### RLS ポリシー

- `stores` — `approval_status = 'approved'` の店舗のみ一般公開、オーナーは自分の全店舗を参照・編集可
- `store_likes` — ログインユーザーのみ操作可
- `coupons` — 誰でも読み取り可、オーナーのみ自分の店舗のクーポンを操作可
- `coupon_uses` — ログインユーザーが自分の使用履歴を参照・登録可
- `contacts` — INSERT のみ許可
- `store_email_history` — Service Role のみ操作可（管理者からオーナーへのメール履歴）
- `contact_replies` — Service Role のみ操作可（問い合わせ返信履歴）

---

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 管理者ダッシュボード用
NEXT_PUBLIC_SITE_URL=             # メール確認のリダイレクト先
BASIC_AUTH_USER=                  # Basic認証（本番公開前の制限用）
BASIC_AUTH_PASS=
GMAIL_USER=                       # メール送信用 Gmail アドレス
GMAIL_APP_PASSWORD=               # Gmail アプリパスワード（2段階認証必須）
ADMIN_EMAIL=                      # 管理者通知メール（未設定時は GMAIL_USER）
NEXT_PUBLIC_SNS_INSTAGRAM=        # NEW OPEN 公式 Instagram URL（フッターに常時表示）
NEXT_PUBLIC_SNS_X=                # 公式 X (Twitter) URL
NEXT_PUBLIC_SNS_TIKTOK=           # 公式 TikTok URL
NEXT_PUBLIC_SNS_LINE=             # 公式 LINE URL
```

---

## 認証・セキュリティ

- **Basic認証** — `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` 環境変数で制御（未設定時はスキップ）。Edge Runtime 対応（`atob()` 使用）
- **ユーザーBAN** — 管理者が `user_metadata.status = "banned"` を設定 → middleware でリダイレクト
- **Bot対策** — 会員登録フォームにハニーポット＋送信速度チェック
- **Service Role Key** — サーバーサイド専用（`NEXT_PUBLIC_` プレフィックスなし）

---

## ストレージ

- バケット名：`NewOpen`
- アップロード先：`{user_id}/{timestamp}.{ext}`
- 公開URL で配信

---

## LP 構成（`/`）

1. Hero（統計バー付き）
2. NewOpenでできること（6枚カード：ユーザー向け3枚＋特徴3枚）
3. 本日オープン（当日のみ表示）
4. まもなくオープン・最新オープン（現在地ソート）
5. クーポン
6. ランキング
7. 最近見たお店
8. オーナー向けLP（メリット・掲載ステップ）
9. FAQ（アコーディオン）
