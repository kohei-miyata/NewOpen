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
  };
}

export async function getStores(userLatLng?: LatLng, limit?: number): Promise<Store[]> {
  const today = todayJST();
  let query = getSupabaseClient()
    .from("stores")
    .select("*")
    .lte("open_date", today)
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

export async function getStoreById(id: string): Promise<Store | undefined> {
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const store = toStore(data);
  if (!isWithinThreeYears(store.openDate)) return undefined;
  return store;
}

export async function getRankedStores(limit?: number): Promise<Store[]> {
  const today = todayJST();
  let query = getSupabaseClient()
    .from("stores")
    .select("*")
    .lte("open_date", today)
    .order("likes", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toStore).filter((s) => isWithinThreeYears(s.openDate));
}

export const getCoupons = unstable_cache(
  async (): Promise<Coupon[]> => {
    const { data, error } = await getSupabaseClient()
      .from("coupons")
      .select("*")
      .order("expiry_date", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(toCoupon);
  },
  ["coupons"],
  { revalidate: 60 }
);

export async function createStore(
  payload: Omit<Store, "id" | "views" | "likes"> & { ownerId?: string }
): Promise<Store> {
  const coords = await geocodeAddress(payload.address);
  if (!coords) throw new Error(`住所から座標を取得できませんでした。住所をご確認ください。`);
  const lat = coords.lat;
  const lng = coords.lng;

  const { data, error } = await getSupabaseClient()
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
      owner_id: payload.ownerId ?? null,
      views: 0,
      likes: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toStore(data);
}

export async function getTodayOpenStores(): Promise<Store[]> {
  const today = todayJST();
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .eq("open_date", today)
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toStore);
}

export async function getComingSoonStores(): Promise<Store[]> {
  const today = todayJST();
  const in30 = new Date(Date.now() + (9 + 30 * 24) * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .gt("open_date", today)
    .lte("open_date", in30)
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

export async function getCouponsByStoreId(storeId: string): Promise<Coupon[]> {
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

  const { error } = await db.from("coupons").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCoupon(id: string, client?: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const db = client ?? getSupabaseClient();
  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getUsedCouponIds(userId: string): Promise<Set<string>> {
  const { data } = await getSupabaseClient()
    .from("coupon_uses")
    .select("coupon_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r: { coupon_id: string }) => r.coupon_id));
}

export async function recordCouponUse(couponId: string, userId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("coupon_uses")
    .insert({ coupon_id: couponId, user_id: userId });

  if (error && error.code !== "23505") throw new Error(error.message); // 23505 = unique violation (already used)
}

export async function getLikedStores(userId: string): Promise<Store[]> {
  const { data, error } = await getSupabaseClient()
    .from("store_likes")
    .select("stores(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => r.stores).filter(Boolean).map(toStore);
}

export async function getUserLikedStoreIds(userId: string): Promise<Set<string>> {
  const { data } = await getSupabaseClient()
    .from("store_likes")
    .select("store_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r: { store_id: string }) => r.store_id));
}
