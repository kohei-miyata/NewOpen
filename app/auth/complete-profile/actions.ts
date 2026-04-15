"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function completeProfile(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const gender    = (formData.get("gender")    as string) || null;
  const birthdate = (formData.get("birthdate") as string) || null;

  if (!gender)    return { error: "性別を選択してください" };
  if (!birthdate) return { error: "生年月日を入力してください" };

  const d = new Date(birthdate);
  const now = new Date();
  const age = now.getFullYear() - d.getFullYear()
    - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  if (age < 13)  return { error: "13歳未満の方はご登録いただけません" };
  if (age > 120) return { error: "正しい生年月日を入力してください" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await supabase.auth.updateUser({
    data: { gender, birthdate },
  });
  if (error) return { error: "保存に失敗しました。もう一度お試しください。" };

  const role = user.user_metadata?.role as string | undefined;
  if (role === "owner") {
    redirect("/mypage/owner/stores/new?welcome=1");
  }
  redirect("/");
}
