"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { recordCouponUse } from "@/lib/db";

export async function markCouponUsed(couponId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  try {
    await recordCouponUse(couponId, user.id, supabase);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "エラーが発生しました" };
  }
}
