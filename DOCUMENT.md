# NewOpen - 技術仕様ドキュメント

あなたの街の新規オープン情報をいち早くお届けするプラットフォーム。3年間限定サービス。

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
11. [認証・認可・ミドルウェア](#認証認可ミドルウェア)
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
| クラッカー演出 | canvas-confetti | ^1.x |
| アイコン | react-icons (fa / md / gi / bs) ※ Heroicons 不使用 | ^5.x |

---

## ディレクトリ構成

```
NewOpen/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # ルートレイアウト (Navbar + Footer + AnnouncementModal)
│   ├── page.tsx                  # トップページ
│   ├── globals.css               # グローバルスタイル
│   │
│   ├── api/
│   │   ├── stores/
│   │   │   ├── [id]/
│   │   │   │   ├── like/route.ts
│   │   │   │   └── view/route.ts
│   │   │   └── recent/route.ts
│   │   └── upload/route.ts
│   │
│   ├── auth/
│   │   ├── actions.ts
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── complete-profile/page.tsx
│   │   └── callback/route.ts
│   │
│   ├── stores/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/
│   │       ├── page.tsx
│   │       └── actions.ts
│   │
│   ├── ranking/page.tsx
│   ├── coupons/page.tsx
│   ├── coming-soon/page.tsx
│   ├── for-owners/page.tsx
│   ├── about/page.tsx
│   ├── banned/page.tsx
│   │
│   ├── contact/
│   │   ├── page.tsx
│   │   └── actions.ts
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   └── actions.ts
│   │
│   └── mypage/
│       ├── page.tsx
│       ├── likes/
│       │   ├── page.tsx
│       │   └── actions.ts
│       └── owner/
│           ├── page.tsx
│           └── stores/
│               ├── actions.ts
│               ├── new/page.tsx
│               └── [id]/
│                   ├── edit/page.tsx
│                   ├── analytics/page.tsx
│                   └── coupons/
│                       ├── page.tsx
│                       └── actions.ts
│
├── components/
│   ├── Navbar.tsx
│   ├── NavbarClient.tsx
│   ├── Footer.tsx
│   ├── PageHeader.tsx
│   ├── StoreCard.tsx             # 画像右上に CardLikeButton 付き
│   ├── CardLikeButton.tsx        # カード用コンパクトいいねボタン
│   ├── LikeButton.tsx            # 店舗詳細用いいねボタン（応援する）
│   ├── LikesSearchList.tsx       # いいね一覧のキーワード検索 (Client)
│   ├── HeroSearch.tsx            # トップページ検索バー + クイックカテゴリ (Client)
│   ├── AnnouncementModal.tsx     # 初回アクセスモーダル + confetti 演出 (Client)
│   ├── CategoryShortcuts.tsx     # カテゴリ一覧ショートカット (react-icons)
│   ├── AreaLinks.tsx             # 都道府県リンク一覧
│   ├── AreaRanking.tsx           # エリア別いいねランキング
│   ├── TopStoresSections.tsx     # まもなくオープン + 最新オープン (Client / 位置情報)
│   ├── RelatedStores.tsx         # 店舗詳細の関連店舗セクション
  ├── StoreCalendar.tsx         # オープンカレンダー (Client)
│   ├── StoreForm.tsx
│   ├── OwnerStoreForm.tsx
│   ├── CouponCard.tsx
│   ├── ViewTracker.tsx
│   ├── ImageUpload.tsx           # HEIC 自動変換対応
│   ├── Map.tsx
│   ├── MapWrapper.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ContactForm.tsx
│   ├── StoresFilter.tsx          # カテゴリボタンに react-icons アイコン付き
│   ├── StoresWithLocation.tsx    # 位置情報ソート付き店舗一覧 (Client)
│   ├── StoresLoadMore.tsx        # ページネーション付き店舗一覧 (Client)
│   ├── RecentlyViewedSection.tsx
│   ├── RecentlyViewedSaver.tsx
│   ├── ShareButtons.tsx
│   ├── SnsPostEmbed.tsx
│   ├── ScrollToTop.tsx
│   ├── AdminStoreTable.tsx
│   ├── LocalStorageConsentBanner.tsx
│   └── DeleteStoreButton.tsx
│
├── lib/
│   ├── db.ts
│   ├── categories.ts
│   ├── faqs.ts
│   ├── geolocation.ts
│   ├── supabase.ts
│   ├── supabase-server.ts
│   └── supabase-browser.ts
│
├── types/
│   └── index.ts
│
├── supabase/
│   ├── schema.sql
│   ├── migration.sql
│   ├── migration2.sql
│   ├── migration3.sql
│   ├── migration4.sql
│   ├── functions.sql
│   └── seed2.sql
│
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
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

# カミングスーン制御 (true で /coming-soon へリダイレクト)
COMING_SOON=true

# カミングスーン時に通過を許可するIPアドレス (カンマ区切り)
ALLOWED_IPS=xxx.xxx.xxx.xxx

# 管理画面へのアクセスを許可するIPアドレス (カンマ区切り、未設定=制限なし)
ADMIN_ALLOWED_IPS=xxx.xxx.xxx.xxx

# Basic認証 (未設定=スキップ)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=password

# 初回アクセスモーダル表示 (true で有効)
NEXT_PUBLIC_SHOW_ANNOUNCEMENT_MODAL=true
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
| `likes` | INTEGER DEFAULT 0 | いいね（応援）数 |
| `tags` | TEXT[] | タグ配列 |
| `lat` | FLOAT | 緯度 (nullable) |
| `lng` | FLOAT | 経度 (nullable) |
| `hours_text` | TEXT | 営業時間テキスト |
| `photos` | TEXT[] | サブ画像 URL 配列 (最大5枚) |
| `sns_links` | JSONB | SNS リンク JSON |
| `owner_id` | UUID FK→auth.users | オーナーユーザー ID |
| `approval_status` | TEXT DEFAULT 'pending' | 承認ステータス (pending/approved/rejected) |
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
| `is_active` | BOOLEAN DEFAULT true | 有効フラグ |

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
  SELECT → 全員 (approval_status = 'approved' のみ表示、オーナー・管理者は全件)
  INSERT → 全員
  UPDATE → auth.uid() = owner_id (オーナーのみ)
  DELETE → auth.uid() = owner_id (オーナーのみ)

coupons:
  SELECT → stores!inner(approval_status=approved) JOIN で承認済み店舗のみ
  INSERT / UPDATE / DELETE → auth.uid() = stores.owner_id

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

### カテゴリの追加方法

カテゴリは **`lib/categories.ts`** で一元管理されています。

```typescript
export const CATEGORIES = [
  "レストラン", "カフェ", "スイーツ", "居酒屋", "ラーメン",
  "美容院", "ジム", "ショップ", "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];
```

反映先（変更不要）:
- `types/index.ts` — `Category` 型
- `components/OwnerStoreForm.tsx` — 登録フォームのドロップダウン
- `components/CategoryShortcuts.tsx` — トップページのカテゴリアイコン一覧
- `app/stores/page.tsx` — 店舗一覧のカテゴリフィルター

### よくある質問の追加方法

FAQは **`lib/faqs.ts`** で一元管理。`tags` で表示ページを制御。

| tag | 表示ページ |
|-----|-----------|
| `"general"` | `/about` |
| `"owner"` | `/for-owners` |
| `"contact"` | `/contact` |

### `types/index.ts`

```typescript
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
  photos: string[];
  snsLinks: SnsLinks | null;
  ownerId: string | null;
  approvalStatus: string;
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
  isActive: boolean;
}
```

---

## ライブラリ層 (lib/)

### `lib/db.ts` — DB クエリ関数

| 関数 | 概要 |
|---|---|
| `getStores()` | `open_date <= 今日` かつ `approval_status = approved` の店舗 |
| `getRankedStores(limit)` | likes 降順 |
| `getComingSoonStores()` | 今日 < open_date <= 今日+30日 |
| `getTodayOpenStores()` | open_date = 今日 |
| `getThisWeekOpenStores()` | open_date が明日〜7日後 |
| `getStoreById(id)` | 単件取得（未承認は notFound に） |
| `getOwnerStores(ownerId)` | オーナーの全店舗（未承認含む） |
| `createStore(payload)` | INSERT して返す |
| `updateStore(id, payload, client?)` | 差分 UPDATE |
| `getCoupons()` | 承認済み店舗のクーポンのみ取得 |
| `getCouponsByStoreId(storeId)` | 店舗別クーポン |
| `getUserLikedStoreIds(userId)` | いいね済み ID の `Set<string>` |
| `getUsedCouponIds(userId, supabase)` | 使用済みクーポン ID の `Set<string>` |
| `getRelatedStores(storeId, tags, category, limit?)` | タグ一致優先 → 同カテゴリ補完で関連店舗取得（デフォルト4件） |

**キャッシュ戦略**: `unstable_cache` + `tags` オプションで `revalidateTag` による即時無効化に対応。

```typescript
// 例: 承認アクション実行時
revalidateTag("store");
revalidateTag("coupons");
revalidateTag("coupons-with-location");
```

### `lib/geolocation.ts`

- `haversineKm(a, b)` — 2点間の距離 (km)
- `getLatLngFromIp(ip)` — IP → 緯度経度変換（東京フォールバック）

---

## API ルート

### `POST /api/stores/[id]/like`

```
Body: { increment: boolean }
処理:
  1. ユーザー認証 → 未ログインは 401
  2. increment=true  → store_likes に UPSERT
  3. increment=false → store_likes から DELETE
  4. COUNT → stores.likes を UPDATE
  5. { likes: number } を返す
```

### `POST /api/stores/[id]/view`

```
Supabase RPC increment_views(id) を呼び出す
```

### `GET /api/stores/recent?ids=id1,id2,...`

```
localStorage の閲覧履歴 ID から最大6件の店舗データを取得
```

### `POST /api/upload`

```
FormData: file → Supabase Storage "NewOpen" バケットにアップロード
パス: {userId}/{Date.now()}.{ext}
レスポンス: { url: publicUrl }
```

---

## サーバーアクション

### `app/auth/actions.ts`

- `login(formData)` — signInWithPassword。成功後 `next` パラメータがあればそのURLへ、なければ `/` へ
- `signup(formData)` — signUp。`user.identities?.length === 0` で重複メール検出
- `logout()` — signOut → `/`
- `signInWithGoogle()` — Google OAuth
- `signInWithLine()` — LINE OAuth (Supabase Custom Provider "line")

### `app/stores/new/actions.ts`

- `registerStore(formData)` — 一般ユーザーの店舗登録

### `app/mypage/owner/stores/actions.ts`

- `editStore(storeId, formData)` — 認証済みクライアントを渡して RLS を通過
- `newOwnerStore(formData)` — オーナーによる新規登録

### `app/admin/actions.ts`

- `approveStore(id)` — approval_status を approved に変更 + キャッシュ無効化
- `rejectStore(id)` — rejected に変更 + キャッシュ無効化
- `setPendingStore(id)` — pending に戻す + キャッシュ無効化

### `app/mypage/owner/stores/[id]/coupons/actions.ts`

- `addCoupon` / `editCoupon` / `toggleCoupon` / `removeCoupon` — 全てキャッシュ無効化済み

---

## ページ一覧

### トップページ `app/page.tsx`

```
データ取得 (並列):
  getStores()               → allStores
  getRankedStores(10)       → ranked
  getCoupons()              → coupons
  getComingSoonStores()     → comingSoon
  getTodayOpenStores()      → todayStores
  getThisWeekOpenStores()   → thisWeekStores
  getUsedCouponIds(userId)  → usedCouponIds
  getUserLikedStoreIds(userId) → likedStoreIds

セクション順 (上から):
  1. Hero (検索バー + クイックカテゴリ + 統計バー)
  2. あなたへのおすすめ (RecommendedStores / スコアリング)
  3. 本日オープン
  3. 今週オープン予定 / まもなくオープン / 最新オープン
     ※ 3セクションを件数の多い順に自動並び替え
  4. オープンカレンダー
  5. カテゴリから探す (CategoryShortcuts)
  6. エリアから探す (AreaLinks、上位12都道府県)
  7. お得なクーポン
  8. 全国応援ランキング TOP3
  9. エリア別ランキング (AreaRanking)
 10. 最近見たお店
 11. オーナー向けバナー (一般ユーザーには非表示)

いいね（応援）ボタン:
  全 StoreCard に CardLikeButton を画像右上に配置
  likedStoreIds を使って初期状態を設定
```

### 店舗一覧 `app/stores/page.tsx`

```
searchParams: area? / category? / filter? / tag?
フィルター組み合わせ例: /stores?filter=coming_soon&category=カフェ&area=渋谷
タグ検索例: /stores?tag=テイクアウト
```

### 店舗詳細 `app/stores/[id]/page.tsx`

```
- 未承認店舗は オーナー・管理者以外 notFound()
- メイン画像右上に LikeButton を配置
- 画像なしの場合はテキスト下に LikeButton
- RecentlyViewedSaver で閲覧履歴に追加
- 地図セクションの下に RelatedStores（関連店舗）を表示
```

### マイページいいね一覧 `app/mypage/likes/page.tsx`

```
- フォルダ機能なし
- キーワード検索 (LikesSearchList) でリアルタイム絞り込み
  対象: お店名・エリア・カテゴリ
- 各カードから直接いいねの取り消し可能
```

---

## コンポーネント一覧

### `AnnouncementModal.tsx` (Client Component)

```
制御:
  NEXT_PUBLIC_SHOW_ANNOUNCEMENT_MODAL=true のときのみ動作
  pathname === "/" (トップページ) のときのみ表示
  localStorage["newopen_announcement_seen_v1"] で初回判定

演出:
  canvas-confetti で左右 + 中央からクラッカー発射 (モーダル表示 200ms 後)
  グラデーションヘッダー + ドット背景でめでたい雰囲気

再表示:
  STORAGE_KEY の末尾バージョン番号を変えることで全ユーザーに再表示可能
  例: "v1" → "v2"
```

### `HeroSearch.tsx` (Client Component)

```
検索バー → /stores?area=xxx に遷移 (空欄なら /stores)
クイックカテゴリ (react-icons アイコン + ラベル) → /stores?category=xxx
「すべて見る」ボタン → /stores
```

### `StoreCard.tsx`

```
Props: { store, rank?, isLoggedIn?, initialLiked? }
- 画像右上に CardLikeButton を絶対配置
- rank が渡されると番号バッジ (黄色) を上に重ねる
- NEW / SOON / 閉店 / 休業中 バッジ (左上)
```

### `CardLikeButton.tsx` (Client Component)

```
Props: { storeId, initialLikes, initialLiked, isLoggedIn }
- e.preventDefault() + e.stopPropagation() で Link 遷移を防止
- アイコンのみ表示 (カウント非表示)
- liked: HeartSolid (オレンジ) / 未liked: HeartOutline (白背景)
```

### `LikeButton.tsx` (Client Component)

```
Props: { storeId, initialLikes, initialLiked, isLoggedIn }
- 店舗詳細ページ用のフルサイズボタン
- ラベル: 「応援する {count}」/ 「応援中 {count}」
- HeartIcon (outline / solid) 使用
- bg-white/90 backdrop-blur で画像上でも視認性を確保
```

### `LikesSearchList.tsx` (Client Component)

```
Props: { stores, isLoggedIn, likedStoreIds }
- テキスト入力でリアルタイムフィルタリング (useState)
- 対象フィールド: name / address / category
- 絞り込み中は「N件 / M件中」を表示
```

### `TopStoresSections.tsx` (Client Component)

```
Props: { allStores, comingSoon, innerOrder?, isLoggedIn?, likedStoreIds? }
- innerOrder: ["coming_soon", "latest"] の順で各セクションを描画
- 位置情報取得後に現在地に近い順でソート
- 拒否時はその旨を表示
```

### `CategoryShortcuts.tsx`

```
Props: { counts? }
- react-icons 使用 (絵文字なし)
  レストラン=FaUtensils / カフェ=FaCoffee / スイーツ=MdCake
  居酒屋=FaBeer / ラーメン=GiNoodles / 美容院=FaCut
  ジム=FaDumbbell / ショップ=FaShoppingBag / その他=BsThreeDots
```

### `app/page.tsx` セクションヘッダーアイコン

```
react-icons のみ使用 (Heroicons 廃止):
  本日オープン         → MdOutlineNewReleases
  今週オープン予定     → FaCalendarCheck
  オープンカレンダー   → FaCalendarAlt
  カテゴリから探す     → FaTags
  エリアから探す       → MdOutlineLocationOn
  お得なクーポン       → FaTicketAlt
  全国応援ランキング   → FaHeart
  エリア別ランキング   → FaTrophy
  オーナーバナー       → FaStore
```

### `RecommendedStores.tsx` (Client Component)

```
Props: { stores, isLoggedIn, likedStoreIds }
- 位置情報取得中はスケルトン表示
- スコアリングロジック（合計100点満点）で上位4件を表示
  距離スコア (0-40): ≤1km=40 / ≤5km=30 / ≤20km=20 / ≤50km=10
  鮮度スコア (0-30): 当日=30 / 7日=25 / 30日=20 / 90日=10 / 1年=5
  応援数スコア (0-20): likes/maxLikes × 20
  オープンブースト (0-10): 当日=+10 / 今週=+5
- 位置情報なし時は鮮度+応援数のみでスコアリング
- 閲覧履歴カテゴリスコア (0-20): 1位カテゴリ=20 / 2位=12 / 3位=6
  localStorage の newopen_recently_viewed から抽出（API不要）
- ラベルは取得状況に応じて動的に変化
  現在地あり+履歴あり: 「現在地・閲覧履歴・新着・人気をもとにおすすめ」
```

### `RelatedStores.tsx`

```
Props: { stores, isLoggedIn, likedStoreIds }
- 店舗詳細ページの最下部に表示
- タグが1つ以上一致する店舗を優先、足りなければ同カテゴリで補完
- 最大4件をグリッド表示 (2列 / sm: 4列)
```

### `AreaRanking.tsx`

```
Props: { stores }
- 都道府県ごとに likes 合計を集計、上位6エリア表示
- 各エリアの likes 上位3店舗をリスト表示
- HeartIcon (solid) でいいね数を表示
```

### `ImageUpload.tsx` (Client Component)

```
HEIC/HEIF ファイルを自動検出 → heic2any で JPEG に変換 → canvas でリサイズ
PC での HEIC アップロードに対応
```

---

## 認証・認可・ミドルウェア

### `middleware.ts` の処理順

```
1. COMING_SOON チェック
   - COMING_SOON=true かつ ALLOWED_IPS に含まれないIPは /coming-soon へ
   - COMING_SOON=false のときに /coming-soon へ直アクセス → / へリダイレクト

2. 管理画面 IP チェック
   - ADMIN_ALLOWED_IPS が設定されている場合、/admin へのアクセスを制限

3. Basic認証チェック
   - BASIC_AUTH_USER / BASIC_AUTH_PASS が設定されている場合のみ動作

4. Supabase セッションリフレッシュ

5. ログイン済みユーザーの /auth/login・/auth/signup アクセス → / へ

6. 未ログインユーザーの /mypage・/admin アクセス
   → /auth/login?next={元のURL} へ (ログイン後に元のページへ戻る)

7. BAN ユーザーの制御 (user_metadata.status === "banned")

8. メール未認証ガード (email プロバイダーのみ)

9. プロフィール未完了ガード (gender 未設定)
```

### ユーザーロール

| ロール | user_metadata.role | 権限 |
|---|---|---|
| 一般ユーザー | `"user"` | 閲覧・いいね・クーポン使用 |
| オーナー | `"owner"` | 店舗登録・編集・クーポン管理 |
| 管理者 | `"admin"` | 全操作 + 承認/却下 |

---

## 画像アップロード

```
1. ファイル選択 (ImageUpload コンポーネント)
2. HEIC/HEIF 判定 → heic2any で JPEG 変換
3. canvas でリサイズ (最大 1200px)
4. POST /api/upload
5. Supabase Storage "NewOpen" バケットに保存
6. publicUrl → hidden input に設定 → フォーム送信で DB 保存
```

---

## 位置情報・エリア検索

### トップページの現在地ソート

```
TopStoresSections (Client):
  ボタンクリック → navigator.geolocation.getCurrentPosition()
  取得成功 → Haversine 距離でソートした上位4件を表示
  取得失敗/拒否 → デフォルト順 (open_date 降順) で表示
```

### 店舗一覧のエリア検索

```
/stores?area=渋谷 → address と name に部分一致フィルター
```

---

## データフロー

### 応援（いいね）機能

```
トップページ:
  StoreCard → CardLikeButton (画像右上)
    → e.stopPropagation() で Link 遷移を防止
    → POST /api/stores/{id}/like

店舗詳細:
  メイン画像右上 → LikeButton
    → POST /api/stores/{id}/like

API 処理:
  store_likes に UPSERT or DELETE
  COUNT(*) → stores.likes に UPDATE
  { likes: count } をレスポンス
```

### 承認フロー

```
オーナー登録 → approval_status = "pending"
管理者が /admin で確認 → approveStore() / rejectStore()
  → revalidateTag("store") でキャッシュ即時無効化
  → 承認後のみ /stores・クーポン一覧に表示
```

### カミングスーン制御

```
COMING_SOON=true:
  ALLOWED_IPS に含まれるIP → 通過 (オーナー・管理者確認用)
  その他のIP → /coming-soon へリダイレクト

COMING_SOON=false:
  /coming-soon への直アクセス → / へリダイレクト
```

---

## Supabase マイグレーション手順

Supabase ダッシュボードの SQL Editor で順番に実行:

```
1. supabase/schema.sql        # 初期テーブル作成
2. supabase/migration.sql     # lat/lng/hours_text/photos カラム追加
3. supabase/migration2.sql    # sns_links/store_likes テーブル追加
4. supabase/functions.sql     # RPC 関数
5. supabase/migration3.sql    # rating 削除/owner_id/contacts テーブル
6. supabase/migration4.sql    # contacts に company/department 追加
7. supabase/seed2.sql         # サンプルデータ投入
```

Storage の設定:

```
1. Supabase ダッシュボード → Storage
2. New bucket: "NewOpen" (Public: ON)
3. RLS ポリシー設定 (認証済みユーザーがアップロード可 / 公開読み取り)
```
