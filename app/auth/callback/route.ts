import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  const redirectUrl = type === "recovery"
    ? `${origin}/auth/reset-password`
    : `${origin}/`;

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  // レスポンスを先に作り、そこにCookieを直接セットする
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errUrl = type === "recovery"
      ? `${origin}/auth/forgot-password?error=expired`
      : `${origin}/auth/login?error=${encodeURIComponent(error.message)}`;
    return NextResponse.redirect(errUrl);
  }
  return response;
}
