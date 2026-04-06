"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function createFolder(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) return;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase.from("like_folders").insert({ user_id: user.id, name });
  revalidatePath("/mypage/likes");
}

export async function deleteFolder(folderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // likes の folder_id は ON DELETE SET NULL なので自動でnullに
  await supabase.from("like_folders").delete().eq("id", folderId).eq("user_id", user.id);
  revalidatePath("/mypage/likes");
}

export async function moveLikeToFolder(storeId: string, folderId: string | null) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("store_likes")
    .update({ folder_id: folderId })
    .eq("user_id", user.id)
    .eq("store_id", storeId);
  revalidatePath("/mypage/likes");
}
