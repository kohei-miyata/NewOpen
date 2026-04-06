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
- 利用規約全文スクロール同意 — 最下部まで読むまでチェックボックス無効
- 利用規約同意エビデンスをDBに保存（`terms_agreements` テーブル：IP・UA・日時）
- Bot対策：ハニーポットフィールド＋3秒タイミングチェック
- 店舗登録ページから未ログインで来た場合、サインアップページでオーナーがデフォルト選択
- BANされたユーザーは `/banned` ページにリダイレクト
- パスワード表示/非表示トグル（目のアイコン）

### パスワード管理

- **パスワード変更** — `/mypage/change-password`（ログイン中の全ロールが利用可）
- **パスワード忘れ** — `/auth/forgot-password` → メールでリセットリンク送信
- **パスワード再設定** — `/auth/reset-password`（メールリンクから遷移）

### 退会

- `/mypage/withdraw` — チェックボックス確認後に退会実行（Supabase Admin API でアカウント削除）
- 退会完了ページ `/withdraw/complete`

### オーナー機能（`/mypage/owner`）

- **店舗登録** — 新規店舗の登録（アカウント登録必須）
  - 住所入力時に OpenStreetMap Nominatim で自動ジオコーディング（lat/lng取得）
  - 段階的フォールバック：番地 → 丁目 → 市区町村レベルで再試行
  - ジオコーディング失敗時はフォームにエラーメッセージ表示
  - 登録時に掲載期間（オープン日から3年間）の説明を表示
- **店舗編集** — 店舗情報の更新（住所変更時は再ジオコーディング）
  - オープン日は一度登録すると変更不可（UIでロック + サーバーアクションでも上書き防止）
  - オープン日から3年経過した店舗は編集不可（サーバーでチェックしリダイレクト）
- **ステータス管理** — 営業中 / 休業中 / 閉店
- **クーポン管理** — クーポンの追加・編集・削除（`/mypage/owner/stores/[id]/coupons`）
- 保存ボタンはローディングスピナー付き（二重送信防止）
- 掲載期間終了（3年超）の店舗はグレー表示・編集不可、一覧の最下部に配置

### 掲載期間ルール

- オープン日から **3年間** 一般公開
- 3年経過後は自動的に一般公開終了（ただしオーナーのマイページでは引き続き閲覧可能）
- 管理者ダッシュボードでも「掲載終了」バッジを表示

### 管理者機能（`/admin`）

- アクセス権：`user_metadata.role === "admin"` のユーザーのみ
- **ダッシュボード**
  - 総ユーザー数 / 一般ユーザー数 / オーナー数 / 掲載店舗数 / いいね総数 / 総閲覧数
  - ユーザー一覧（メール・ロール・ステータス・登録日・最終ログイン）
  - ユーザーのBAN / BAN解除（`user_metadata.status`）
  - いいね上位10店舗 / 閲覧数上位10店舗
  - カテゴリ別店舗数
  - エリア別店舗数（都道府県＋市区町村レベルで集計）
  - 全店舗一覧テーブル

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
| `migration8.sql` | 管理者ロール |
| `migration9.sql` | ランキング・クーポン改修 |
| `migration10.sql` | terms_agreements テーブル（利用規約同意エビデンス） |

### RLS ポリシー

- `stores` — 誰でも読み取り可、オーナーのみ自分の店舗を編集可
- `store_likes` — ログインユーザーのみ操作可
- `coupons` — 誰でも読み取り可、オーナーのみ自分の店舗のクーポンを操作可
- `coupon_uses` — ログインユーザーが自分の使用履歴を参照・登録可
- `contacts` — INSERT のみ許可

---

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # 管理者・退会処理用

# サイトURL（メール確認・パスワードリセットのリダイレクト先）
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Google Maps（現在地検索）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# お問い合わせメール（Gmail SMTP）
GMAIL_USER=your-address@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Googleアカウントのアプリパスワード
ADMIN_EMAIL=admin@your-domain.com        # 省略時は GMAIL_USER と同じ

# SNSアカウント（フッターに表示。未設定のアイコンは非表示）
NEXT_PUBLIC_SNS_X=https://x.com/yourhandle
NEXT_PUBLIC_SNS_INSTAGRAM=https://www.instagram.com/yourhandle
NEXT_PUBLIC_SNS_TIKTOK=https://www.tiktok.com/@yourhandle
NEXT_PUBLIC_SNS_LINE=https://lin.ee/xxxxxxx

# コミングスーンモード（リリース前に使用）
COMING_SOON=true
ALLOWED_IPS=126.227.39.229              # カンマ区切りで複数指定可
```

---

## 認証・セキュリティ

- **セッションクッキー** — `maxAge: 86400`（24時間）・`secure: true`（本番）・`sameSite: lax`
- **パスワードリセット** — Supabase の `resetPasswordForEmail` → コールバック経由で `/auth/reset-password` に遷移
- **コミングスーンモード** — `COMING_SOON=true` でミドルウェアが `ALLOWED_IPS` 以外を `/coming-soon` にリダイレクト。オーナー登録フローは開放
- **ユーザーBAN** — 管理者が `user_metadata.status = "banned"` を設定 → middleware でリダイレクト
- **Bot対策** — 会員登録フォームにハニーポット＋送信速度チェック
- **Service Role Key** — サーバーサイド専用（`NEXT_PUBLIC_` プレフィックスなし）
- **利用規約同意エビデンス** — 会員登録時にIP・UA・日時を `terms_agreements` テーブルへ保存

---

## メール設定

### お問い合わせフォーム（Gmail SMTP）

`GMAIL_USER` と `GMAIL_APP_PASSWORD` を設定すると自動返信と管理者通知が送信されます。  
未設定の場合はメール送信をスキップし、フォーム送信自体は完了します。

Googleアカウントのアプリパスワードは **Googleアカウント → セキュリティ → 2段階認証 → アプリパスワード** から発行してください。

### Supabase メールテンプレート（日本語）

Supabase Dashboard → **Authentication** → **Email Templates** で設定してください。

**Reset Password**

- Subject: `【NewOpen】パスワード再設定のご案内`
- Body: `{{ .ConfirmationURL }}` をボタンに埋め込み

**Confirm signup**

- Subject: `【NewOpen】メールアドレスの確認`
- Body: `{{ .ConfirmationURL }}` をボタンに埋め込み

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

---

## その他のページ

| パス | 説明 |
|---|---|
| `/about` | サービス紹介・FAQ |
| `/for-owners` | オーナー向けLP |
| `/terms` | 利用規約（`components/TermsContent.tsx` を共用） |
| `/privacy` | プライバシーポリシー |
| `/contact` | お問い合わせフォーム |
| `/coming-soon` | コミングスーンページ |
| `/auth/forgot-password` | パスワード忘れ |
| `/auth/reset-password` | パスワード再設定（メールリンクから遷移） |
| `/mypage/change-password` | パスワード変更（ログイン必須） |
| `/mypage/withdraw` | 退会 |
| `/withdraw/complete` | 退会完了 |

---

## 運営

宮田浩平（個人事業主）
