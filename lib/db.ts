import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { haversineKm, type LatLng } from "@/lib/geolocation";
import { geocodeAddress } from "@/lib/geocode";
import type { Store, Coupon, Category } from "@/types";

function todayJST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function isWithinThreeYears(openDate: string): boolean {
  const open = new Date(openDate);
  const limit = new Date(open);
  limit.setFullYear(limit.getFullYear() + 3);
  return new Date() < limit;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStore(row: any): Store {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category as Category,
    address: row.address,
    openDate: row.open_date,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    views: Number(row.views),
    likes: Number(row.likes),
    tags: Array.isArray(row.tags) ? row.tags : [],
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    hoursText: row.hours_text ?? null,
    photos: Array.isArray(row.photos) ? row.photos : [],
    snsLinks: row.sns_links ?? null,
    twitterPostUrl: row.twitter_post_url ?? null,
    instagramPostUrl: row.instagram_post_url ?? null,
    tiktokPostUrl: row.tiktok_post_url ?? null,
    status: (row.status ?? "active") as Store["status"],
    approvalStatus: (row.approval_status ?? "approved") as Store["approvalStatus"],
    ownerId: row.owner_id ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCoupon(row: any): Coupon {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    storeName: row.store_name,
    storeCategory: row.store_category as Category,
    title: row.title,
    description: row.description ?? "",
    discount: row.discount,
    expiryDate: row.expiry_date,
    code: row.code,
    imageUrl: row.image_url ?? "",
    isActive: row.is_active ?? true,
    combinable: row.combinable ?? false,
  };
}

export async function getStores(userLatLng?: LatLng, limit?: number): Promise<Store[]> {
  const today = todayJST();
  let query = getSupabaseClient()
    .from("stores")
    .select("*")
    .lte("open_date", today)
    .eq("approval_status", "approved")
    .order("open_date", { ascending: false });

  if (limit) query = query.limit(limit * 3); // 3年フィルタで減る分を考慮して多めに取得

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const stores = (data ?? []).map(toStore).filter((s) => isWithinThreeYears(s.openDate));
  const result = limit ? stores.slice(0, limit) : stores;

  if (userLatLng) {
    return result.sort((a, b) => {
      const distA = a.lat != null && a.lng != null ? haversineKm(userLatLng, { lat: a.lat, lng: a.lng }) : Infinity;
      const distB = b.lat != null && b.lng != null ? haversineKm(userLatLng, { lat: b.lat, lng: b.lng }) : Infinity;
      return distA - distB;
    });
  }
  return result;
}

export async function getStoreOwnerId(storeId: string): Promise<string | null> {
  const { data } = await getSupabaseClient()
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single();
  return data?.owner_id ?? null;
}

export const getStoreById = unstable_cache(
  async (id: string): Promise<Store | undefined> => {
    const { data, error } = await getSupabaseClient()
      .from("stores")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return toStore(data);
  },
  ["store-by-id"],
  { revalidate: 30, tags: ["store"] }
);

export const getRankedStores = unstable_cache(
  async (limit?: number): Promise<Store[]> => {
    const today = todayJST();
    let query = getSupabaseClient()
      .from("stores")
      .select("*")
      .lte("open_date", today)
      .eq("approval_status", "approved")
      .order("likes", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toStore).filter((s) => isWithinThreeYears(s.openDate));
  },
  ["ranked-stores"],
  { revalidate: 60, tags: ["store"] }
);

export const getCoupons = unstable_cache(
  async (): Promise<Coupon[]> => {
    const { data, error } = await getSupabaseClient()
      .from("coupons")
      .select("*, stores!inner(approval_status)")
      .eq("is_active", true)
      .gte("expiry_date", todayJST())
      .eq("stores.approval_status", "approved")
      .order("expiry_date", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toCoupon);
  },
  ["coupons"],
  { revalidate: 60, tags: ["coupons"] }
);

export type CouponWithLocation = Coupon & { lat: number | null; lng: number | null };

export const getCouponsWithLocation = unstable_cache(
  async (): Promise<CouponWithLocation[]> => {
    const { data, error } = await getSupabaseClient()
      .from("coupons")
      .select("*, stores!inner(lat, lng, image_url, approval_status)")
      .eq("is_active", true)
      .gte("expiry_date", todayJST())
      .eq("stores.approval_status", "approved")
      .order("expiry_date", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const store = row.stores as any;
      const coupon = toCoupon(row);
      return {
        ...coupon,
        // imageUrl が空なら店舗のメイン画像をフォールバック
        imageUrl: coupon.imageUrl || store?.image_url || "",
        lat: store?.lat ?? null,
        lng: store?.lng ?? null,
      };
    });
  },
  ["coupons-with-location"],
  { revalidate: 60, tags: ["coupons-with-location"] }
);

export async function createStore(
  payload: Omit<Store, "id" | "views" | "likes" | "approvalStatus" | "ownerId"> & { ownerId?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<Store> {
  const coords = await geocodeAddress(payload.address);
  if (!coords) throw new Error(`住所から座標を取得できませんでした。住所をご確認ください。`);
  const lat = coords.lat;
  const lng = coords.lng;

  const db = client ?? getSupabaseClient();
  const { data, error } = await db
    .from("stores")
    .insert({
      name: payload.name,
      category: payload.category,
      address: payload.address,
      open_date: payload.openDate,
      description: payload.description,
      image_url: payload.imageUrl,
      lat,
      lng,
      hours_text: payload.hoursText,
      photos: payload.photos,
      tags: payload.tags,
      sns_links: payload.snsLinks,
      twitter_post_url: payload.twitterPostUrl ?? null,
      instagram_post_url: payload.instagramPostUrl ?? null,
      tiktok_post_url: payload.tiktokPostUrl ?? null,
      status: payload.status ?? "active",
      approval_status: "pending",
      owner_id: payload.ownerId ?? null,
      views: 0,
      likes: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toStore(data);
}

export const getTodayOpenStores = unstable_cache(
  async (): Promise<Store[]> => {
    const today = todayJST();
    const { data, error } = await getSupabaseClient()
      .from("stores")
      .select("*")
      .eq("open_date", today)
      .eq("status", "active")
      .eq("approval_status", "approved")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toStore);
  },
  ["today-open-stores"],
  { revalidate: 300, tags: ["store"] }
);

export const getThisWeekOpenStores = unstable_cache(
  async (): Promise<Store[]> => {
    const today = todayJST();
    const in7 = new Date(Date.now() + (9 + 7 * 24) * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data, error } = await getSupabaseClient()
      .from("stores")
      .select("*")
      .gt("open_date", today)
      .lte("open_date", in7)
      .eq("approval_status", "approved")
      .order("open_date", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toStore);
  },
  ["this-week-open-stores"],
  { revalidate: 300, tags: ["store"] }
);

export async function getComingSoonStores(): Promise<Store[]> {
  const today = todayJST();
  const in30 = new Date(Date.now() + (9 + 30 * 24) * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .gt("open_date", today)
    .lte("open_date", in30)
    .eq("approval_status", "approved")
    .order("open_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toStore);
}

export async function getOwnerStores(ownerId: string): Promise<Store[]> {
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toStore);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateStore(
  id: string,
  payload: Partial<Omit<Store, "id" | "views" | "likes">>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<Store> {
  const db = client ?? getSupabaseClient();
  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined)        updates.name        = payload.name;
  if (payload.category !== undefined)    updates.category    = payload.category;
  if (payload.address !== undefined) {
    updates.address = payload.address;
    const coords = await geocodeAddress(payload.address);
    if (!coords) throw new Error(`住所から座標を取得できませんでした。住所をご確認ください。`);
    updates.lat = coords.lat;
    updates.lng = coords.lng;
  }
  if (payload.openDate !== undefined)    updates.open_date   = payload.openDate;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.imageUrl !== undefined)    updates.image_url   = payload.imageUrl;
  if (payload.hoursText !== undefined)   updates.hours_text  = payload.hoursText;
  if (payload.photos !== undefined)      updates.photos      = payload.photos;
  if (payload.tags !== undefined)        updates.tags        = payload.tags;
  if (payload.snsLinks !== undefined)        updates.sns_links         = payload.snsLinks;
  if (payload.twitterPostUrl !== undefined)  updates.twitter_post_url  = payload.twitterPostUrl;
  if (payload.instagramPostUrl !== undefined) updates.instagram_post_url = payload.instagramPostUrl;
  if (payload.tiktokPostUrl !== undefined)   updates.tiktok_post_url   = payload.tiktokPostUrl;
  if (payload.status !== undefined)          updates.status             = payload.status;

  const { data, error } = await db
    .from("stores")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toStore(data);
}

export async function deleteStore(
  storeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any
): Promise<void> {
  const { error } = await client.from("stores").delete().eq("id", storeId);
  if (error) throw new Error(error.message);
}

/** 公開用：有効クーポンのみ */
export async function getCouponsByStoreId(storeId: string): Promise<Coupon[]> {
  const { data, error } = await getSupabaseClient()
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("expiry_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toCoupon);
}

/** オーナー管理用：有効・無効含む全件 */
export async function getAllCouponsByStoreId(storeId: string): Promise<Coupon[]> {
  const { data, error } = await getSupabaseClient()
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .order("expiry_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toCoupon);
}

export async function createCoupon(
  payload: Omit<Coupon, "id">,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<Coupon> {
  const db = client ?? getSupabaseClient();
  const { data, error } = await db
    .from("coupons")
    .insert({
      store_id: payload.storeId,
      store_name: payload.storeName,
      store_category: payload.storeCategory,
      title: payload.title,
      description: payload.description,
      discount: payload.discount,
      expiry_date: payload.expiryDate,
      code: payload.code,
      image_url: payload.imageUrl,
      combinable: payload.combinable ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCoupon(data);
}

export async function updateCoupon(
  id: string,
  payload: Partial<Omit<Coupon, "id" | "storeId" | "storeName" | "storeCategory">>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client?: any
): Promise<void> {
  const db = client ?? getSupabaseClient();
  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined)       updates.title       = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.discount !== undefined)    updates.discount    = payload.discount;
  if (payload.expiryDate !== undefined)  updates.expiry_date = payload.expiryDate;
  if (payload.code !== undefined)        updates.code        = payload.code;
  if (payload.imageUrl !== undefined)    updates.image_url   = payload.imageUrl;
  if (payload.combinable !== undefined)  updates.combinable  = payload.combinable;

  const { error } = await db.from("coupons").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCoupon(id: string, client?: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = client ?? getSupabaseClient();
  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getUsedCouponIds(userId: string, client?: any): Promise<Set<string>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = client ?? getSupabaseClient();
  const { data } = await db
    .from("coupon_uses")
    .select("coupon_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r: { coupon_id: string }) => r.coupon_id));
}

export async function recordCouponUse(couponId: string, userId: string, client?: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = client ?? getSupabaseClient();
  const { error } = await db
    .from("coupon_uses")
    .insert({ coupon_id: couponId, user_id: userId });

  if (error && error.code !== "23505") throw new Error(error.message); // 23505 = unique violation (already used)
}

export interface LikeFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface LikedStoreWithFolder extends Store {
  folderId: string | null;
}

export async function getLikedStores(userId: string): Promise<LikedStoreWithFolder[]> {
  const { data, error } = await getSupabaseClient()
    .from("store_likes")
    .select("folder_id, stores(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => r.stores ? { ...toStore(r.stores), folderId: r.folder_id ?? null } : null).filter(Boolean) as LikedStoreWithFolder[];
}

export async function getLikeFolders(userId: string): Promise<LikeFolder[]> {
  const { data, error } = await getSupabaseClient()
    .from("like_folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
}

export async function getUserLikedStoreIds(userId: string): Promise<Set<string>> {
  const { data } = await getSupabaseClient()
    .from("store_likes")
    .select("store_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r: { store_id: string }) => r.store_id));
}

/**
 * 関連店舗を取得する。
 * タグが1つ以上一致する店舗を優先し、足りなければ同カテゴリで補完。
 * 最大 `limit` 件（デフォルト4）返す。
 */
export async function getRelatedStores(
  storeId: string,
  tags: string[],
  category: Category,
  limit = 4
): Promise<Store[]> {
  const today = todayJST();
  const result: Store[] = [];
  const seen = new Set<string>([storeId]);

  // 1. タグ一致（タグがある場合）
  if (tags.length > 0) {
    const { data: tagData } = await getSupabaseClient()
      .from("stores")
      .select("*")
      .lte("open_date", today)
      .eq("approval_status", "approved")
      .neq("id", storeId)
      .overlaps("tags", tags)
      .order("likes", { ascending: false })
      .limit(limit);

    for (const row of tagData ?? []) {
      const store = toStore(row);
      if (!seen.has(store.id) && isWithinThreeYears(store.openDate)) {
        result.push(store);
        seen.add(store.id);
        if (result.length >= limit) return result;
      }
    }
  }

  // 2. 同カテゴリで補完
  if (result.length < limit) {
    const { data: catData } = await getSupabaseClient()
      .from("stores")
      .select("*")
      .lte("open_date", today)
      .eq("approval_status", "approved")
      .neq("id", storeId)
      .eq("category", category)
      .order("likes", { ascending: false })
      .limit(limit);

    for (const row of catData ?? []) {
      const store = toStore(row);
      if (!seen.has(store.id) && isWithinThreeYears(store.openDate)) {
        result.push(store);
        seen.add(store.id);
        if (result.length >= limit) return result;
      }
    }
  }

  return result;
}
