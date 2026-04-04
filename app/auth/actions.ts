"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function toJapaneseAuthError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "メールアドレスまたはパスワードが正しくありません";
  if (/email not confirmed/i.test(message))
    return "メールアドレスの確認が完了していません。確認メールのリンクをクリックしてください";
  if (/user already registered|already been registered/i.test(message))
    return "このメールアドレスはすでに登録されています";
  if (/email already in use/i.test(message))
    return "このメールアドレスはすでに使用されています";
  if (/password should be at least/i.test(message))
    return "パスワードは6文字以上で入力してください";
  if (/unable to validate email/i.test(message))
    return "メールアドレスの形式が正しくありません";
  if (/email rate limit exceeded/i.test(message))
    return "メール送信の上限に達しました。しばらく時間をおいてから再試行してください";
  if (/over_email_send_rate_limit/i.test(message))
    return "メール送信の上限に達しました。しばらく時間をおいてから再試行してください";
  if (/network/i.test(message))
    return "ネットワークエラーが発生しました。接続を確認して再試行してください";
  return "エラーが発生しました。しばらく時間をおいてから再試行してください";
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(toJapaneseAuthError(error.message))}`);
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) === "owner" ? "owner" : "user";
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { role },
    },
  });
  if (error) redirect(`/auth/signup?error=${encodeURIComponent(toJapaneseAuthError(error.message))}`);
  redirect("/auth/signup?success=1");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
