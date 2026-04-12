"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

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

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(toJapaneseAuthError(error.message))}`);
  if (data.url) redirect(data.url);
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
  const display_name = (formData.get("display_name") as string)?.trim() || null;
  const gender = (formData.get("gender") as string) || null;
  const birthdate = (formData.get("birthdate") as string) || null;
  const supabase = await createSupabaseServerClient();

  const metadata: Record<string, string | boolean> = { role, email_notifications: true };
  if (display_name) metadata.display_name = display_name;
  if (gender) metadata.gender = gender;
  if (birthdate) metadata.birthdate = birthdate;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: metadata,
    },
  });
  if (error) redirect(`/auth/signup?error=${encodeURIComponent(toJapaneseAuthError(error.message))}`);

  // identities が空 = 既存メールアドレス（Supabaseはメール列挙対策でエラーを返さない）
  if (signUpData.user && signUpData.user.identities?.length === 0) {
    redirect(`/auth/signup?error=${encodeURIComponent("このメールアドレスはすでに登録されています")}`);
  }

  // 利用規約同意エビデンスをDBに保存
  if (signUpData.user) {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
    const ua = hdrs.get("user-agent") ?? null;
    const admin = createSupabaseAdminClient();
    await admin.from("terms_agreements").insert({
      user_id: signUpData.user.id,
      version: "1.0",
      ip_address: ip,
      user_agent: ua,
    });
  }

  redirect("/auth/signup?success=1");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function changePassword(formData: FormData): Promise<{ error?: string }> {
  const currentPassword = formData.get("currentPassword") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!currentPassword) return { error: "現在のパスワードを入力してください" };
  if (!password || password.length < 6) return { error: "新しいパスワードは6文字以上で入力してください" };
  if (password !== confirm) return { error: "パスワードが一致しません" };
  if (currentPassword === password) return { error: "現在のパスワードと同じパスワードは使用できません" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login");

  // 現在のパスワードを検証
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "現在のパスワードが正しくありません" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: toJapaneseAuthError(error.message) };
  redirect("/mypage/change-password?success=1");
}

export async function forgotPassword(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  if (!email) return { error: "メールアドレスを入力してください" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
  });
  if (error) return { error: toJapaneseAuthError(error.message) };
  redirect("/auth/forgot-password?success=1");
}

export async function resetPassword(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 6) return { error: "パスワードは6文字以上で入力してください" };
  if (password !== confirm) return { error: "パスワードが一致しません" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: toJapaneseAuthError(error.message) };
  redirect("/auth/reset-password?success=1");
}

export async function updateEmailNotifications(enabled: boolean): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ data: { email_notifications: enabled } });
  if (error) return { error: "設定の更新に失敗しました" };
  return {};
}

export async function updateDisplayName(formData: FormData): Promise<{ error?: string }> {
  const display_name = (formData.get("display_name") as string)?.trim();
  if (!display_name) return { error: "お名前を入力してください" };
  if (display_name.length > 50) return { error: "お名前は50文字以内で入力してください" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ data: { display_name } });
  if (error) return { error: "更新に失敗しました。しばらく時間をおいてから再試行してください。" };
  redirect("/mypage/change-name?success=1");
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase.auth.signOut();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "退会処理に失敗しました。しばらく時間をおいてから再試行してください。" };
  redirect("/withdraw/complete");
}
