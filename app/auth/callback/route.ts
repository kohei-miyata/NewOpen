import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "";

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
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
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

    // Google OAuth 新規ユーザーは role 未設定 → "user" を付与
    if (user && !role) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: "user" },
      });
      role = "user";
    }

    // オーナーのメール確認完了 → 店舗登録へ
    if (role === "owner") {
      redirectTo = `${origin}/mypage/owner/stores/new?welcome=1`;
    }
  }

  // リダイレクト先が確定してからレスポンスを1つ作成し、クッキーをセット
  const response = NextResponse.redirect(redirectTo);
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...options,
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return response;
}
