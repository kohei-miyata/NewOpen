import { getSupabaseClient } from "@/lib/supabase";
import { haversineKm, type LatLng } from "@/lib/geolocation";
import type { Store, Coupon, Category } from "@/types";

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

export async function getStores(userLatLng?: LatLng): Promise<Store[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .lte("open_date", today)
    .order("open_date", { ascending: false });

  if (error) throw new Error(error.message);

  const stores = (data ?? []).map(toStore).filter((s) => isWithinThreeYears(s.openDate));

  if (userLatLng) {
    return stores.sort((a, b) => {
      const distA =
        a.lat != null && a.lng != null
          ? haversineKm(userLatLng, { lat: a.lat, lng: a.lng })
          : Infinity;
      const distB =
        b.lat != null && b.lng != null
          ? haversineKm(userLatLng, { lat: b.lat, lng: b.lng })
          : Infinity;
      return distA - distB;
    });
  }
  return stores;
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

export async function getRankedStores(): Promise<Store[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .lte("open_date", today)
    .order("likes", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toStore).filter((s) => isWithinThreeYears(s.openDate));
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await getSupabaseClient()
    .from("coupons")
    .select("*")
    .order("expiry_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toCoupon);
}

export async function createStore(
  payload: Omit<Store, "id" | "views" | "likes"> & { ownerId?: string }
): Promise<Store> {
  const { data, error } = await getSupabaseClient()
    .from("stores")
    .insert({
      name: payload.name,
      category: payload.category,
      address: payload.address,
      open_date: payload.openDate,
      description: payload.description,
      image_url: payload.imageUrl,
      lat: payload.lat,
      lng: payload.lng,
      hours_text: payload.hoursText,
      photos: payload.photos,
      tags: payload.tags,
      sns_links: payload.snsLinks,
      owner_id: payload.ownerId ?? null,
      views: 0,
      likes: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toStore(data);
}

export async function getComingSoonStores(): Promise<Store[]> {
  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
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
  if (payload.address !== undefined)     updates.address     = payload.address;
  if (payload.openDate !== undefined)    updates.open_date   = payload.openDate;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.imageUrl !== undefined)    updates.image_url   = payload.imageUrl;
  if (payload.hoursText !== undefined)   updates.hours_text  = payload.hoursText;
  if (payload.photos !== undefined)      updates.photos      = payload.photos;
  if (payload.tags !== undefined)        updates.tags        = payload.tags;
  if (payload.snsLinks !== undefined)    updates.sns_links   = payload.snsLinks;

  const { data, error } = await db
    .from("stores")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toStore(data);
}

export async function getUserLikedStoreIds(userId: string): Promise<Set<string>> {
  const { data } = await getSupabaseClient()
    .from("store_likes")
    .select("store_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r: { store_id: string }) => r.store_id));
}
