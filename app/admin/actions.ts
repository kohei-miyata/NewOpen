"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Forbidden");
}

export async function banUser(userId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { status: "banned" },
  });
  revalidatePath("/admin");
}

export async function unbanUser(userId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { status: "active" },
  });
  revalidatePath("/admin");
}
