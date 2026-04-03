# NewOpen - 技術仕様ドキュメント

あなたの街の新規オープン情報をいち早くお届けするプラットフォーム。

---

## 目次

1. [技術スタック](#技術スタック)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [環境変数](#環境変数)
4. [データベース設計](#データベース設計)
5. [型定義](#型定義)
6. [ライブラリ層 (lib/)](#ライブラリ層-lib)
7. [APIルート](#apiルート)
8. [サーバーアクション](#サーバーアクション)
9. [ページ一覧](#ページ一覧)
10. [コンポーネント一覧](#コンポーネント一覧)
11. [認証・認可](#認証認可)
12. [画像アップロード](#画像アップロード)
13. [位置情報・エリア検索](#位置情報エリア検索)
14. [データフロー](#データフロー)
15. [Supabase マイグレーション手順](#supabase-マイグレーション手順)

---

## 技術スタック

| 分類 | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | ^15.0.0 |
| UI ライブラリ | React | ^18.3.0 |
| スタイリング | Tailwind CSS | ^3.4.14 |
| 言語 | TypeScript | ^5 |
| データベース | Supabase (PostgreSQL) | ^2.101.1 |
| 認証 | Supabase Auth (@supabase/ssr) | ^0.10.0 |
| ストレージ | Supabase Storage | — |
| 地図 | @react-google-maps/api | ^2.20.8 |
| IP ジオロケーション | ip-api.com (外部 API) | — |

---

## ディレクトリ構成

```
NewOpen/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト (Navbar + Footer 共通)
│   ├── page.tsx                  # トップページ
│   ├── globals.css               # グローバルスタイル
│   │
│   ├── api/                      # API Route Handlers
│   │   ├── stores/
│   │   │   ├── [id]/
│   │   │   │   ├── like/route.ts     # いいね Toggle API
│   │   │   │   └── view/route.ts     # 閲覧数 Increment API
│   │   │   └── recent/route.ts       # 最近見た店舗取得 API
│   │   └── upload/route.ts           # 画像アップロード API
│   │
│   ├── auth/
│   │   ├── actions.ts            # Server Actions: login / signup / logout
│   │   ├── login/page.tsx        # ログインページ
│   │   ├── signup/page.tsx       # 新規登録ページ (ロール選択付き)
│   │   └── callback/route.ts     # OAuth コールバック
│   │
│   ├── stores/
│   │   ├── page.tsx              # 店舗一覧ページ (フィルター付き)
│   │   ├── [id]/page.tsx         # 店舗詳細ページ
│   │   └── new/
│   │       ├── page.tsx          # 店舗登録ページ (一般向け)
│   │       └── actions.ts        # Server Action: registerStore
│   │
│   ├── ranking/page.tsx          # いいねランキングページ
│   ├── coupons/page.tsx          # クーポン一覧ページ
│   │
│   ├── contact/
│   │   ├── page.tsx              # お問い合わせページ
│   │   └── actions.ts            # Server Action: submitContact
│   │
│   └── mypage/
│       ├── page.tsx              # マイページ (一般ユーザー)
│       └── owner/
│           ├── page.tsx          # オーナー管理ページ
│           └── stores/
│               ├── actions.ts    # Server Actions: editStore / newOwnerStore
│               ├── new/page.tsx  # 店舗新規作成 (オーナー)
│               └── [id]/edit/page.tsx  # 店舗編集
│
├── components/                   # 共通コンポーネント
│   ├── Navbar.tsx                # ナビゲーション (Server Component ラッパー)
│   ├── NavbarClient.tsx          # ナビゲーション (Client Component・モバイル対応)
│   ├── Footer.tsx                # フッター
│   ├── PageHeader.tsx            # ページタイトル + 説明
│   ├── StoreCard.tsx             # 店舗カード
│   ├── StoreForm.tsx             # 店舗登録フォーム (一般向け)
│   ├── OwnerStoreForm.tsx        # 店舗登録・編集フォーム (オーナー向け)
│   ├── CouponCard.tsx            # クーポンカード
│   ├── LikeButton.tsx            # いいねボタン
│   ├── ViewTracker.tsx           # 閲覧数トラッカー
│   ├── ImageUpload.tsx           # 画像アップロードコンポーネント
│   ├── Map.tsx                   # Google Maps / iframe フォールバック
│   ├── MapWrapper.tsx            # Map の動的インポートラッパー
│   ├── LoginForm.tsx             # ログインフォーム
│   ├── SignupForm.tsx            # 新規登録フォーム
│   ├── ContactForm.tsx           # お問い合わせフォーム
│   ├── StoresFilter.tsx          # 店舗絞り込みフィルター
│   ├── RecentlyViewedSection.tsx # 最近見たお店セクション (Client)
│   └── RecentlyViewedSaver.tsx   # 閲覧履歴保存 (Client)
│
├── lib/                          # ユーティリティ・DB アクセス層
│   ├── db.ts                     # 全 DB クエリ関数
│   ├── geolocation.ts            # IP ジオロケーション + Haversine 距離計算
│   ├── supabase.ts               # 匿名クライアント初期化
│   ├── supabase-server.ts        # SSR 用サーバークライアント
│   └── supabase-browser.ts      # ブラウザ用クライアント
│
├── types/
│   └── index.ts                  # TypeScript 型定義
│
├── supabase/
│   ├── schema.sql                # 初期テーブル定義
│   ├── migration.sql             # lat/lng/hours_text/photos 追加
│   ├── migration2.sql            # sns_links / store_likes テーブル追加
│   ├── migration3.sql            # rating 削除 / owner_id / contacts テーブル
│   ├── migration4.sql            # contacts に company / department 追加
│   ├── functions.sql             # RPC 関数 (increment_views, toggle_like)
│   ├── seed.sql                  # 旧テストデータ
│   └── seed2.sql                 # 最新テストデータ (rating なし)
│
├── middleware.ts                 # Supabase セッションリフレッシュ
├── next.config.mjs               # Next.js 設定
├── tailwind.config.ts            # Tailwind CSS 設定
└── tsconfig.json                 # TypeScript 設定
```

---

## 環境変数

`.env.local` に以下を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Maps (省略可 → iframe フォールバック)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# 本番 URL (メール確認リンク用)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## データベース設計

### テーブル: `stores`

| カラム | 型 | 説明 |
|---|---|---|
| `id` | UUID PK | 自動生成 |
| `name` | TEXT NOT NULL | 店舗名 |
| `category` | TEXT NOT NULL | カテゴリ (Category 型) |
| `address` | TEXT NOT NULL | 住所 |
| `open_date` | DATE NOT NULL | オープン日 |
| `description` | TEXT | 説明文 |
| `image_url` | TEXT | メイン画像 URL |
| `views` | INTEGER DEFAULT 0 | 閲覧数 |
| `likes` | INTEGER DEFAULT 0 | いいね数 |
| `tags` | TEXT[] | タグ配列 |
| `lat` | FLOAT | 緯度 (nullable) |
| `lng` | FLOAT | 経度 (nullable) |
| `hours_text` | TEXT | 営業時間テキスト |
| `photos` | TEXT[] | サブ画像 URL 配列 (最大5枚) |
| `sns_links` | JSONB | SNS リンク JSON |
| `owner_id` | UUID FK→auth.users | オーナーユーザー ID |
| `created_at` | TIMESTAMPTZ | 作成日時 |

### テーブル: `coupons`

| カラム | 型 | 説明 |
|---|---|---|
| `id` | UUID PK | 自動生成 |
| `store_id` | UUID FK→stores | 対象店舗 |
| `store_name` | TEXT NOT NULL | 店舗名 (非正規化) |
| `store_category` | TEXT NOT NULL | カテゴリ |
| `title` | TEXT NOT NULL | クーポンタイトル |
| `description` | TEXT | 説明 |
| `discount` | TEXT NOT NULL | 割引内容テキスト |
| `expiry_date` | DATE NOT NULL | 有効期限 |
| `code` | TEXT NOT NULL | クーポンコード |
| `image_url` | TEXT | 画像 URL |

### テーブル: `store_likes`

| カラム | 型 | 説明 |
|---|---|---|
| `user_id` | UUID FK→auth.users | ユーザー ID |
| `store_id` | UUID FK→stores | 店舗 ID |
| `created_at` | TIMESTAMPTZ | いいね日時 |

- PK: `(user_id, store_id)` ← 複合主キーで重複防止

### テーブル: `contacts`

| カラム | 型 | 説明 |
|---|---|---|
| `id` | UUID PK | 自動生成 |
| `company` | TEXT | 法人名 (任意) |
| `department` | TEXT | 部署名 (任意) |
| `name` | TEXT NOT NULL | 担当者名 |
| `email` | TEXT NOT NULL | メールアドレス |
| `message` | TEXT NOT NULL | 問い合わせ内容 |
| `created_at` | TIMESTAMPTZ | 送信日時 |

### RLS ポリシー

```
stores:
  SELECT → 全員
  INSERT → 全員 (MVP)
  UPDATE → auth.uid() = owner_id (オーナーのみ)
  DELETE → auth.uid() = owner_id (オーナーのみ)

store_likes:
  SELECT → 全員
  INSERT → auth.uid() = user_id
  DELETE → auth.uid() = user_id

contacts:
  INSERT → 全員 (WITH CHECK true)
```

### RPC 関数 (`supabase/functions.sql`)

```sql
-- 閲覧数をアトミックに +1
increment_views(store_id UUID)

-- いいね数をアトミックに操作
toggle_like(p_store_id UUID, increment BOOLEAN)
```

---

## 型定義

`types/index.ts`

```typescript
export type Category =
  | "レストラン" | "カフェ" | "スイーツ" | "居酒屋" | "ラーメン"
  | "美容院" | "ジム" | "ショップ" | "その他";

export interface SnsLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  line?: string;
}

export interface Store {
  id: string;
  name: string;
  category: Category;
  address: string;
  openDate: string;           // "YYYY-MM-DD"
  description: string;
  imageUrl: string;
  views: number;
  likes: number;
  tags: string[];
  lat: number | null;
  lng: number | null;
  hoursText: string | null;
  photos: string[];           // 最大5枚
  snsLinks: SnsLinks | null;
}

export interface Coupon {
  id: string;
  storeId: string;
  storeName: string;
  storeCategory: Category;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  code: string;
  imageUrl: string;
}
```

---

## ライブラリ層 (lib/)

### `lib/db.ts` — DB クエリ関数

#### `toStore(row): Store`
DB の生レコードを `Store` 型に変換するプライベート関数。カラム名スネークケース → キャメルケースのマッピングを担う。

#### `isWithinThreeYears(openDate: string): boolean`
オープン日から3年以内かどうかを判定。`open_date + 3年 > 現在日時` が true の店舗のみ表示対象とする。

---

| 関数 | 引数 | 戻り値 | 概要 |
|---|---|---|---|
| `getStores` | `userLatLng?: LatLng` | `Store[]` | `open_date <= 今日` の店舗を取得。`userLatLng` があれば Haversine 距離でソート |
| `getRankedStores` | — | `Store[]` | `open_date <= 今日` かつ `likes` 降順 |
| `getComingSoonStores` | — | `Store[]` | `今日 < open_date <= 今日+30日` の店舗を `open_date` 昇順 |
| `getStoreById` | `id: string` | `Store \| undefined` | 3年フィルター付きで単件取得 |
| `getOwnerStores` | `ownerId: string` | `Store[]` | `owner_id` が一致する全店舗 |
| `createStore` | `payload + ownerId?` | `Store` | 新規店舗を INSERT して返す |
| `updateStore` | `id, payload, client?` | `Store` | 差分 UPDATE。`client` 省略時は匿名クライアント |
| `getCoupons` | — | `Coupon[]` | 有効期限昇順で全クーポン取得 |
| `getUserLikedStoreIds` | `userId: string` | `Set<string>` | ユーザーがいいねした店舗 ID の Set |

> `updateStore` の `client` 引数: RLS ポリシー通過のため、オーナー編集時は `createSupabaseServerClient()` の結果を渡す必要がある。

---

### `lib/geolocation.ts`

#### `haversineKm(a: LatLng, b: LatLng): number`
2点間のキロメートル距離を Haversine 公式で計算。
```
R = 6371 km
dLat = (b.lat - a.lat) * π/180
dLng = (b.lng - a.lng) * π/180
h = sin(dLat/2)² + cos(a.lat) * cos(b.lat) * sin(dLng/2)²
distance = R * 2 * arcsin(√h)
```

#### `getLatLngFromIp(ip: string | null): Promise<LatLng>`
- `127.0.0.1` / `::1` / `192.168.*` → 東京 `(35.6895, 139.6917)` を返す
- それ以外 → `http://ip-api.com/json/{ip}?fields=lat,lon,status` にリクエスト
- 失敗時も東京にフォールバック
- Next.js の `fetch` キャッシュ: `revalidate: 3600`（1時間）

---

### `lib/supabase.ts`
匿名 Supabase クライアントを遅延初期化。環境変数未設定時にビルドエラーにならないよう `getSupabaseClient()` 関数経由でアクセス。

### `lib/supabase-server.ts`
`@supabase/ssr` の `createServerClient` を使用。Next.js の `cookies()` API で Cookie を読み書きし、セッションをサーバー側で管理。

### `lib/supabase-browser.ts`
`@supabase/ssr` の `createBrowserClient` を使用。クライアントコンポーネントからの認証操作に使用。

---

## API ルート

### `POST /api/stores/[id]/like`
**ファイル**: `app/api/stores/[id]/like/route.ts`

いいねの追加・取り消し。

```
リクエスト:
  Body: { increment: boolean }
  Cookie: Supabase セッション (必須)

処理:
  1. createSupabaseServerClient() でユーザー取得
  2. 未ログイン → 401
  3. increment=true  → store_likes に UPSERT (重複無視)
  4. increment=false → store_likes から DELETE
  5. store_likes の count を stores.likes に UPDATE
  6. { likes: number } を返す
```

---

### `POST /api/stores/[id]/view`
**ファイル**: `app/api/stores/[id]/view/route.ts`

閲覧数のインクリメント。

```
処理:
  Supabase RPC increment_views(id) を呼び出す
  → { ok: true } を返す
```

---

### `GET /api/stores/recent?ids=id1,id2,...`
**ファイル**: `app/api/stores/recent/route.ts`

localStorage に保存した閲覧履歴 ID から店舗データをまとめて取得。

```
クエリパラメータ: ids (カンマ区切り、最大6件)
処理:
  ids.slice(0, 6) で Supabase に .in("id", ids) クエリ
  → Store[] を返す (ids が空なら [])
```

---

### `POST /api/upload`
**ファイル**: `app/api/upload/route.ts`

画像を Supabase Storage にアップロード。

```
リクエスト:
  FormData: file (image/*)
  Cookie: Supabase セッション (必須)

処理:
  1. ユーザー取得 → 未ログインは 401
  2. ファイル名: {userId}/{timestamp}.{ext}
  3. supabase.storage.from("NewOpen").upload(path, file)
  4. エラー時: { error: message } 500
  5. 成功時: { url: publicUrl } を返す
```

---

## サーバーアクション

### `app/auth/actions.ts`

#### `login(formData: FormData)`
`supabase.auth.signInWithPassword({ email, password })` を呼び出す。
- 失敗: `/auth/login?error=...` にリダイレクト
- 成功: `/` にリダイレクト

#### `signup(formData: FormData)`
`supabase.auth.signUp()` を呼び出す。`options.data.role` に `"user"` または `"owner"` を設定し `user_metadata` に保存。
- 失敗: `/auth/signup?error=...`
- 成功: `/auth/signup?success=1`

#### `logout()`
`supabase.auth.signOut()` 後に `/` にリダイレクト。

---

### `app/stores/new/actions.ts`

#### `registerStore(formData: FormData)`
一般ユーザー向け店舗登録。

```
処理フロー:
  1. createSupabaseServerClient() → user 取得 (ログイン任意)
  2. FormData から name/category/address/openDate/description/
     hoursText/imageUrl/tags/photo1-5/sns_* を取得
  3. タグ: カンマ・読点で split → trim → filter(Boolean)
  4. SNS: 各フィールドが空でなければ snsLinks オブジェクトに追加
  5. createStore({ ...fields, ownerId: user?.id }) を呼び出す
  6. /stores/{store.id} にリダイレクト
```

---

### `app/contact/actions.ts`

#### `submitContact(formData: FormData)`
```
処理:
  company / department → 空文字なら null として保存 (任意)
  name / email / message → いずれか空なら ?error=missing
  supabase.from("contacts").insert({ company, department, name, email, message })
  成功: /contact?success=1
  失敗: /contact?error={message}
```

---

### `app/mypage/owner/stores/actions.ts`

#### `parseStoreFormData(formData)` (内部ヘルパー)
`registerStore` と同一のフォームデータ解析ロジックを共通化。

#### `editStore(storeId: string, formData: FormData)`
```
処理:
  1. ユーザー取得 → 未ログインは /auth/login にリダイレクト
  2. parseStoreFormData でデータ取得
  3. updateStore(storeId, payload, supabase) — 認証済みクライアントを渡す
  4. /mypage/owner にリダイレクト
```

> RLS ポリシー対応のため `supabase` (認証済みクライアント) を `updateStore` に渡す。

#### `newOwnerStore(formData: FormData)`
```
処理:
  1. ユーザー取得 → 未ログインは /auth/login にリダイレクト
  2. parseStoreFormData でデータ取得
  3. createStore({ ...payload, ownerId: user.id })
  4. /stores/{store.id} にリダイレクト
```

---

## ページ一覧

### トップページ `app/page.tsx`

```
データ取得 (並列):
  getStores()         → recentStores (先頭4件)
  getRankedStores()   → topStores (先頭3件)
  getCoupons()        → latestCoupons (先頭3件)
  getComingSoonStores() → comingSoon (先頭4件)

セクション:
  Hero          → グラデーションバナー
  RecentlyViewedSection → localStorage から閲覧履歴 (Client)
  まもなくオープン → comingSoon.length > 0 のときのみ表示
  最新オープン    → recentStores (open_date <= 今日)
  ランキング      → topStores (likes 降順)
  クーポン        → latestCoupons
```

---

### 店舗一覧 `app/stores/page.tsx`

```
searchParams:
  area?     → テキスト検索 (address / name に部分一致)
  category? → カテゴリ完全一致
  filter?   → "coming_soon" でまもなくオープン店舗のみ取得

処理フロー:
  1. filter=coming_soon → getComingSoonStores() (IP ジオロケーション不要)
     その他 → getLatLngFromIp(ip) → getStores(userLatLng)
  2. areaQuery でインメモリフィルタリング
  3. categoryFilter でインメモリフィルタリング
  4. タイトルを filter=coming_soon の場合 "まもなくオープン" に変更

複数フィルター組み合わせ例:
  /stores?filter=coming_soon&category=カフェ&area=渋谷
  → まもなくオープン × カフェ × 渋谷 の絞り込みが可能
```

---

### 店舗詳細 `app/stores/[id]/page.tsx`

```
データ取得:
  getStoreById(id)          → 店舗データ
  createSupabaseServerClient() → ユーザー取得
  getUserLikedStoreIds(user.id) → いいね済み ID の Set

レンダリング:
  RecentlyViewedSaver → localStorage に保存
  写真ギャラリー (imageUrl + photos 最大5枚)
  営業時間 / 説明 / タグ
  SNS リンク (SnsLinks から存在するものだけ表示)
  LikeButton (isLoggedIn + initialLiked props)
  ViewTracker (mount 時に閲覧数 +1)
  MapWrapper (lat/lng がある場合のみ)
```

---

### マイページ `app/mypage/page.tsx`

```
認証:
  未ログイン → /auth/login にリダイレクト

データ:
  getUserLikedStoreIds(user.id) → いいね店舗一覧
  getStoreById(id) × n → 各店舗データを並列取得

表示:
  ユーザーメール
  オーナーなら「オーナー管理 →」ボタン
  いいねしたお店一覧 (StoreCard)
  最近見たお店は / のページで確認案内
```

---

### オーナー管理 `app/mypage/owner/page.tsx`

```
認証:
  未ログイン → /auth/login
  role !== "owner" → /mypage

データ:
  getOwnerStores(user.id) → owner_id が一致する店舗一覧

表示:
  店舗リスト (image / name / address / category / openDate)
  各店舗に「表示」「編集」ボタン
  「+ 新規登録」ボタン → /mypage/owner/stores/new
```

---

### 店舗編集 `app/mypage/owner/stores/[id]/edit/page.tsx`

```
認証:
  未ログイン → /auth/login
  role !== "owner" → /mypage

処理:
  getStoreById(id) → 既存データ取得
  editStore.bind(null, id) → storeId をバインドした Server Action 生成
  OwnerStoreForm に defaultValues と action を渡す
```

---

## コンポーネント一覧

### `Navbar.tsx` (Server Component)
Supabase からユーザー情報と role を取得し `NavbarClient` に渡すラッパー。

### `NavbarClient.tsx` (Client Component)
```
Props: { user: { email? } | null, isOwner: boolean }
機能:
  デスクトップ: リンク横並び + ログイン状態によって分岐
  モバイル: ハンバーガーボタン + スライドダウンメニュー
  useState(open) でメニュー開閉管理
```

### `StoreCard.tsx`
```
Props: { store: Store, rank?: number }
機能:
  isNew = openDate から 7日以内 → "NEW" バッジ表示
  rank が渡されると右上に番号バッジ (黄色)
  imageUrl 空文字 → Unsplash フォールバック画像
```

### `LikeButton.tsx` (Client Component)
```
Props: { storeId, initialLikes, initialLiked, isLoggedIn }
機能:
  未ログイン → /auth/login にリダイレクト
  POST /api/stores/{storeId}/like { increment: !liked }
  レスポンスの likes でカウント更新 / liked 状態トグル
  二重クリック防止 (loading state)
```

### `ViewTracker.tsx` (Client Component)
```
Props: { storeId, initialViews }
機能:
  useEffect で mount 時に一度だけ POST /api/stores/{storeId}/view
  レスポンスで views 更新
  "{n} 回閲覧" テキスト表示
```

### `ImageUpload.tsx` (Client Component)
```
Props: { name, label?, defaultValue? }
機能:
  hidden input でフォーム送信用 URL を保持
  クリック / ドラッグ&ドロップでファイル選択
  POST /api/upload → publicUrl を hidden input に設定
  プレビュー画像 / 削除ボタン / アップロード中表示
```

### `Map.tsx`
```
Props: { lat, lng, name }
機能:
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 設定あり
    → @react-google-maps/api の GoogleMap コンポーネント
    → loadError 時は IframeMap にフォールバック
  API Key なし → IframeMap (Google Maps Embed API iframe)
  IframeMap は https://maps.google.com/maps?q={lat},{lng} を埋め込み
```

### `MapWrapper.tsx`
```
機能:
  next/dynamic({ ssr: false }) で Map を動的インポート
  SSR での window/document エラーを防止
  "use client" コンポーネント
```

### `StoresFilter.tsx` (Client Component)
```
Props: { categories, currentArea, currentCategory, currentFilter }
機能:
  useState(area) でエリア入力管理

  buildUrl(area, category, filter): URLSearchParams で 3つのパラメータを組み立て
    → /stores?area=...&category=...&filter=...

  handleCategoryClick(cat):
    → currentCategory と同じなら解除、違えば選択
    → currentFilter (coming_soon) を保持したまま router.push()

  handleFilterToggle():
    → currentFilter が "coming_soon" なら解除、そうでなければ "coming_soon" をセット
    → currentCategory / area を保持したまま router.push()

  フィルターボタン構成:
    [すべて] [🗓 まもなくオープン] [カテゴリ×9]
    まもなくオープンは青色 (bg-blue-500)、カテゴリはオレンジ (bg-orange-500)

  アクティブフィルタータグ:
    現在適用中のフィルター (coming_soon / カテゴリ / エリア) を
    タグ形式で下部に表示

  リセットボタン: area/category/filter を全クリア
```

### `RecentlyViewedSaver.tsx` (Client Component)
```
Props: { storeId }
機能:
  useEffect で localStorage["newopen_recently_viewed"] を読み込み
  storeId が含まれなければ先頭に追加
  最大6件を超えた分は末尾から削除
  mount 時に一度だけ実行
```

### `RecentlyViewedSection.tsx` (Client Component)
```
機能:
  useEffect で localStorage["newopen_recently_viewed"] から ids 取得
  GET /api/stores/recent?ids={ids.join(",")} でデータ取得
  ids の順序を保持して表示 (sort by indexOf)
  横スクロールのカードリスト
  ids が空 または 取得0件 → null を返す (表示なし)
```

### `SignupForm.tsx` (Client Component)
```
機能:
  useState(role: "user" | "owner") でロール管理
  hidden input name="role" で Server Action に渡す
  バリデーション: email 形式 / パスワード8文字以上英数字 / 確認一致
  ロール切り替えボタン (一般ユーザー / オーナー)
```

### `ContactForm.tsx` (Client Component)
```
Props: { serverError?: string }
機能:
  company / department: 任意入力 (横並びグリッド、バリデーションなし)
  name / email / message: 必須バリデーション
    - email: 正規表現で形式チェック
    - message: 10文字以上
  submitContact Server Action に送信
  serverError の "missing" を日本語に変換して表示
```

---

## 認証・認可

### ユーザーロール

| ロール | 保存場所 | 値 |
|---|---|---|
| 一般ユーザー | `user_metadata.role` | `"user"` |
| オーナー | `user_metadata.role` | `"owner"` |

新規登録時に SignupForm のロール選択 → `signup()` Server Action → `supabase.auth.signUp({ options: { data: { role } } })` で `user_metadata` に保存。

### セッション管理

`middleware.ts` が全リクエストで Supabase セッションをリフレッシュ。Cookie ベースで `@supabase/ssr` が管理。

### アクセス制御パターン

```typescript
// Server Component での保護
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/auth/login");
if (user.user_metadata?.role !== "owner") redirect("/mypage");

// API Route での保護
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "..." }, { status: 401 });
```

---

## 画像アップロード

### フロー

```
1. ユーザーがファイルを選択 (ImageUpload コンポーネント)
2. POST /api/upload (FormData: file)
3. サーバー:
   - createSupabaseServerClient() でユーザー認証
   - ファイルパス: {userId}/{Date.now()}.{ext}
   - supabase.storage.from("NewOpen").upload(path, file)
4. publicUrl 取得 → クライアントに返す
5. ImageUpload の hidden input に URL を設定
6. フォーム送信時、URL が DB に保存される
```

### Supabase Storage RLS ポリシー

```sql
-- 認証済みユーザーがアップロード可
CREATE POLICY "authenticated users can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'NewOpen');

-- 公開読み取り
CREATE POLICY "public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'NewOpen');
```

---

## 位置情報・エリア検索

### IP ジオロケーション

```
本番環境:
  リクエストヘッダー x-forwarded-for / x-real-ip から IP 取得
  → ip-api.com/json/{ip} で緯度経度取得 (1時間キャッシュ)

開発環境 (localhost):
  IP が 127.0.0.1 / ::1 → 東京 (35.6895, 139.6917) にフォールバック
```

### 距離ソート

```typescript
// getStores() 内
if (userLatLng) {
  stores.sort((a, b) => {
    const distA = a.lat && a.lng
      ? haversineKm(userLatLng, { lat: a.lat, lng: a.lng })
      : Infinity;  // lat/lng null の店舗は末尾
    return distA - distB;
  });
}
```

> 現在のサンプルデータは `lat/lng = NULL` のため距離ソートが有効に機能しない。実運用では住所から座標を設定することで近い順表示が有効になる。

### エリア検索 (テキストフィルター)

```typescript
if (areaQuery) {
  stores = stores.filter((s) =>
    s.address.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q)
  );
}
```

---

## データフロー

### 店舗登録 (一般ユーザー)

```
/stores/new ページ
  └─ StoreForm (Client)
       ├─ バリデーション (name/address/openDate/description)
       ├─ ImageUpload → POST /api/upload → URL を hidden input に
       └─ form action → registerStore (Server Action)
             ├─ FormData をパース
             ├─ createStore({ ...payload, ownerId: user?.id })
             └─ redirect /stores/{store.id}
```

### いいね機能

```
StoreDetailPage (Server)
  └─ LikeButton (Client)
       └─ クリック
            ├─ 未ログイン → /auth/login
            └─ POST /api/stores/{id}/like { increment: !liked }
                   ├─ store_likes に UPSERT or DELETE
                   ├─ COUNT(*) from store_likes where store_id=id
                   ├─ stores.likes = count に UPDATE
                   └─ { likes: count } を返す
                        └─ UI 更新 (setLikes / setLiked)
```

### 閲覧履歴

```
StoreDetailPage
  └─ RecentlyViewedSaver (mount 時)
       └─ localStorage["newopen_recently_viewed"]
            └─ [storeId, ...既存 IDs].slice(0, 6) で保存

トップページ
  └─ RecentlyViewedSection (mount 時)
       └─ localStorage から ids 取得
            └─ GET /api/stores/recent?ids=...
                 └─ Supabase から最大6件取得
                      └─ ids 順序で sort して表示
```

### まもなくオープン表示

```
DB クエリ:
  SELECT * FROM stores
  WHERE open_date > '{今日}' AND open_date <= '{今日+30日}'
  ORDER BY open_date ASC

表示:
  TOP ページ → 最大4件
  /stores?filter=coming_soon → 全件 + エリア/カテゴリフィルター可能
```

---

## Supabase マイグレーション手順

Supabase ダッシュボードの **SQL Editor** で以下の順番で実行:

```
1. supabase/schema.sql        # 初期テーブル作成
2. supabase/migration.sql     # lat/lng/hours_text/photos カラム追加
3. supabase/migration2.sql    # sns_links/store_likes テーブル追加
4. supabase/functions.sql     # RPC 関数 (increment_views, toggle_like)
5. supabase/migration3.sql    # rating 削除/owner_id/contacts テーブル
6. supabase/migration4.sql    # contacts に company/department 追加
7. supabase/seed2.sql         # サンプルデータ投入
```

Storage の設定:
```
1. Supabase ダッシュボード → Storage
2. New bucket: "NewOpen" (Public: ON)
3. Policies タブで upload/read/update/delete ポリシーを設定
```
