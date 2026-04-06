"use server";

import { redirect } from "next/navigation";
import { updateStore, createStore, getStoreOwnerId, getStoreById } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Category, SnsLinks } from "@/types";

function validateAddress(address: string): string | null {
  if (!address?.trim()) return "住所を入力してください";
  if (!/[都道府県]/.test(address)) return "都道府県から入力してください";
  if (!/[市区町村郡]/.test(address)) return "市区町村まで入力してください";
  return null;
}

function parseStoreFormData(formData: FormData) {
  const name        = formData.get("name") as string;
  const category    = formData.get("category") as Category;
  const address     = formData.get("address") as string;
  const openDate    = formData.get("openDate") as string;
  const description = formData.get("description") as string;
  const hoursText   = (formData.get("hoursText") as string) || null;
  const imageUrl    = (formData.get("imageUrl") as string) || "";
  const tagsRaw     = (formData.get("tags") as string) || "";

  const photos: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const url = (formData.get(`photo${i}`) as string)?.trim();
    if (url) photos.push(url);
  }

  const tags = tagsRaw.split(/[,、]/).map((t) => t.trim()).filter(Boolean);

  const snsLinks: SnsLinks = {};
  const website   = (formData.get("sns_website")   as string)?.trim();
  const instagram = (formData.get("sns_instagram")  as string)?.trim();
  const twitter   = (formData.get("sns_twitter")    as string)?.trim();
  const tiktok    = (formData.get("sns_tiktok")     as string)?.trim();
  const line       = (formData.get("sns_line")        as string)?.trim();
  const googleMaps = (formData.get("sns_google_maps") as string)?.trim();
  if (website)    snsLinks.website    = website;
  if (instagram)  snsLinks.instagram  = instagram;
  if (twitter)    snsLinks.twitter    = twitter;
  if (tiktok)     snsLinks.tiktok     = tiktok;
  if (line)       snsLinks.line       = line;
  if (googleMaps) snsLinks.google_maps = googleMaps;

  const twitterPostUrl  = (formData.get("post_twitter_url")   as string)?.trim() || null;
  const instagramPostUrl = (formData.get("post_instagram_url") as string)?.trim() || null;
  const tiktokPostUrl   = (formData.get("post_tiktok_url")    as string)?.trim() || null;

  const statusRaw = (formData.get("status") as string) || "active";
  const status = ["active", "temporarily_closed", "closed"].includes(statusRaw)
    ? (statusRaw as "active" | "temporarily_closed" | "closed")
    : "active" as const;

  return {
    name, category, address, openDate, description, hoursText, imageUrl,
    photos, tags,
    snsLinks: Object.keys(snsLinks).length > 0 ? snsLinks : null,
    twitterPostUrl,
    instagramPostUrl,
    tiktokPostUrl,
    status,
  };
}

export async function editStore(storeId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [ownerId, existingStore] = await Promise.all([
    getStoreOwnerId(storeId),
    getStoreById(storeId),
  ]);
  if (ownerId !== user.id) redirect("/mypage/owner");
  if (!existingStore) redirect("/mypage/owner");

  const payload = parseStoreFormData(formData);
  // オープン日は登録後に変更不可 — フォームの値を無視して既存値を使う
  payload.openDate = existingStore.openDate;
  const addrErr = validateAddress(payload.address);
  if (addrErr) redirect(`/mypage/owner/stores/${storeId}/edit?error=${encodeURIComponent(addrErr)}`);

  const admin = createSupabaseAdminClient();
  try {
    await updateStore(storeId, payload, admin);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存に失敗しました";
    redirect(`/mypage/owner/stores/${storeId}/edit?error=${encodeURIComponent(msg)}`);
  }
  redirect(`/mypage/owner`);
}

export async function newOwnerStore(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const payload = parseStoreFormData(formData);
  const addrErr = validateAddress(payload.address);
  if (addrErr) redirect(`/mypage/owner/stores/new?error=${encodeURIComponent(addrErr)}`);

  let store;
  try {
    const admin = createSupabaseAdminClient();
    store = await createStore({ ...payload, lat: null, lng: null, ownerId: user.id }, admin);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "登録に失敗しました";
    redirect(`/mypage/owner/stores/new?error=${encodeURIComponent(msg)}`);
  }
  redirect(`/stores/${store.id}`);
}
