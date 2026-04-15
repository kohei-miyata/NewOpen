import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { notifyNewUser } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "";
  const roleParam = searchParams.get("role") as "user" | "owner" | null;
  const providerParam = searchParams.get("provider") ?? null;

  if (!code && !token_hash) {
    const fallback = type === "recovery"
      ? `${origin}/auth/reset-password`
      : `${origin}/`;
    return NextResponse.redirect(fallback);
  }

  // クッキーを一時収集してからリダイレクト先確定後に1つのレスポンスにセットする
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(incoming) {
          incoming.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options: options as Record<string, unknown> });
          });
        },
      },
    }
  );

  // token_hash フロー: PKCE不要、別ブラウザでも動作する
  // code フロー: 同一ブラウザのPKCE code_verifierが必要
  let authUser: User | null = null;
  let error: { message: string } | null = null;

  if (token_hash && type) {
    const result = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email_change" | "email",
    });
    authUser = result.data?.user ?? null;
    error = result.error;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    authUser = result.data?.user ?? null;
    error = result.error;
  }

  if (error) {
    const errUrl = type === "recovery"
      ? `${origin}/auth/forgot-password?error=expired`
      : `${origin}/auth/login?error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(errUrl);
  }

  // リダイレクト先を決定
  let redirectTo = `${origin}/`;

  if (type === "recovery") {
    redirectTo = `${origin}/auth/reset-password`;
  } else {
    const user = authUser;
    let role = user?.user_metadata?.role as string | undefined;

    // OAuth 新規ユーザーは role 未設定 → roleParam or "user" を付与
    const isNewOAuthUser = user && !role;
    if (isNewOAuthUser) {
      const assignedRole = roleParam === "owner" ? "owner" : "user";
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const fullName = user!.user_metadata?.full_name as string | undefined;
      const displayName = user!.user_metadata?.display_name as string | undefined;
      await adminClient.auth.admin.updateUserById(user!.id, {
        user_metadata: {
          ...user!.user_metadata,
          role: assignedRole,
          email_notifications: true,
          display_name: displayName || fullName || undefined,
        },
      });
      role = assignedRole;
      const provider = user!.app_metadata?.provider as string | undefined;
      notifyNewUser({ email: user!.email ?? "", role: assignedRole, provider }).catch(() => {});
    }

    // オーナーのメール確認完了 → 店舗登録へ
    if (role === "owner") {
      redirectTo = `${origin}/mypage/owner/stores/new?welcome=1`;
    }

    // Google OAuth 新規ユーザー → 性別・生年月日入力へ
    const needsProfile = user && !user.user_metadata?.gender;
    if (isNewOAuthUser || needsProfile) {
      const profileUrl = new URL(`${origin}/auth/complete-profile`);
      const provider = providerParam ?? (user?.app_metadata?.provider === "google" ? "google" : null);
      if (provider) profileUrl.searchParams.set("provider", provider);
      redirectTo = profileUrl.toString();
    }
  }

  // リダイレクト先が確定してからレスポンスを1つ作成し、クッキーをセット
  // Supabase が設定したオプションをそのまま使用する（上書きしない）
  const response = NextResponse.redirect(redirectTo);
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
