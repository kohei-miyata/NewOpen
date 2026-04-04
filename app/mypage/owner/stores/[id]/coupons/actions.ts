"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createCoupon, updateCoupon, deleteCoupon, getStoreById } from "@/lib/db";
import type { Category } from "@/types";

export async function addCoupon(storeId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const store = await getStoreById(storeId);
  if (!store) redirect("/mypage/owner");
  // RLS がオーナー以外の INSERT を弾く

  await createCoupon({
    storeId,
    storeName: store.name,
    storeCategory: store.category as Category,
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string).trim(),
    discount: (formData.get("discount") as string).trim(),
    expiryDate: formData.get("expiryDate") as string,
    code: (formData.get("code") as string).trim(),
    imageUrl: (formData.get("imageUrl") as string)?.trim() ?? "",
  }, supabase);

  redirect(`/mypage/owner/stores/${storeId}/coupons`);
}

export async function editCoupon(couponId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await updateCoupon(couponId, {
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string).trim(),
    discount: (formData.get("discount") as string).trim(),
    expiryDate: formData.get("expiryDate") as string,
    code: (formData.get("code") as string).trim(),
  }, supabase);

  const storeId = formData.get("storeId") as string;
  redirect(`/mypage/owner/stores/${storeId}/coupons`);
}

export async function removeCoupon(couponId: string, storeId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await deleteCoupon(couponId, supabase);
  redirect(`/mypage/owner/stores/${storeId}/coupons`);
}
