"use server";

import { redirect } from "next/navigation";
import { createStore } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Category, SnsLinks } from "@/types";

export async function registerStore(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = formData.get("name") as string;
  const category = formData.get("category") as Category;
  const address = formData.get("address") as string;
  const openDate = formData.get("openDate") as string;
  const description = formData.get("description") as string;
  const hoursText = (formData.get("hoursText") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || "";
  const tagsRaw = (formData.get("tags") as string) || "";

  // photos: 最大5枚
  const photos: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const url = (formData.get(`photo${i}`) as string)?.trim();
    if (url) photos.push(url);
  }

  const tags = tagsRaw
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean);

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

  const store = await createStore({
    name,
    category,
    address,
    openDate,
    description,
    imageUrl,
    hoursText,
    lat: null,
    lng: null,
    photos,
    tags,
    snsLinks: Object.keys(snsLinks).length > 0 ? snsLinks : null,
    twitterPostUrl,
    instagramPostUrl,
    tiktokPostUrl,
    status: "active",
    ownerId: user?.id,
  });

  redirect(`/stores/${store.id}`);
}
