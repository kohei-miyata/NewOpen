"use server";

import { redirect } from "next/navigation";
import { updateStore, createStore } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Category, SnsLinks } from "@/types";

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
  const line      = (formData.get("sns_line")       as string)?.trim();
  if (website)   snsLinks.website   = website;
  if (instagram) snsLinks.instagram = instagram;
  if (twitter)   snsLinks.twitter   = twitter;
  if (tiktok)    snsLinks.tiktok    = tiktok;
  if (line)      snsLinks.line      = line;

  const twitterPostUrl  = (formData.get("post_twitter_url")   as string)?.trim() || null;
  const instagramPostUrl = (formData.get("post_instagram_url") as string)?.trim() || null;
  const tiktokPostUrl   = (formData.get("post_tiktok_url")    as string)?.trim() || null;

  return {
    name, category, address, openDate, description, hoursText, imageUrl,
    photos, tags,
    snsLinks: Object.keys(snsLinks).length > 0 ? snsLinks : null,
    twitterPostUrl,
    instagramPostUrl,
    tiktokPostUrl,
  };
}

export async function editStore(storeId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const payload = parseStoreFormData(formData);
  await updateStore(storeId, { ...payload, lat: null, lng: null }, supabase);
  redirect(`/mypage/owner`);
}

export async function newOwnerStore(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const payload = parseStoreFormData(formData);
  const store = await createStore({
    ...payload, lat: null, lng: null, ownerId: user.id,
  });
  redirect(`/stores/${store.id}`);
}
