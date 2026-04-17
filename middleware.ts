import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function basicAuth(request: NextRequest): NextResponse | null {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return null; // 環境変数未設定時はスキップ

  const auth = request.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [u, p] = decoded.split(":");
      if (u === user && p === pass) return null; // 認証成功
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="NewOpen"' },
  });
}

// カミングスーン制御
// オーナー登録関連は常に通す
const COMING_SOON_OPEN_PATHS = [
  "/coming-soon",
  "/for-owners",
  "/auth/",
  "/api/",
  "/_next/",
  "/favicon",
  "/mypage/owner",
  "/mypage",
];

function isComingSoonBlocked(request: NextRequest): boolean {
  if (process.env.COMING_SOON !== "true") return false;

  const { pathname, searchParams } = request.nextUrl;

  // ?preview=true の場合は通す
  if (searchParams.get("preview") === "true") return false;

  // 許可パスは通す
  if (COMING_SOON_OPEN_PATHS.some((p) => pathname.startsWith(p))) return false;

  // 許可IPは通す
  const allowedIps = (process.env.ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";
  if (allowedIps.includes(ip)) return false;

  return true;
}

function isAdminBlocked(request: NextRequest): boolean {
  if (!request.nextUrl.pathname.startsWith("/admin")) return false;

  const allowedIps = (process.env.ADMIN_ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowedIps.length === 0) return false; // 環境変数未設定時はスキップ

  const ip =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";
  return !allowedIps.includes(ip);
}

export async function middleware(request: NextRequest) {
  // カミングスーンチェック
  if (isComingSoonBlocked(request)) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  // COMING_SOON が無効のときに /coming-soon へ直アクセスしたらトップへ
  if (
    process.env.COMING_SOON !== "true" &&
    request.nextUrl.pathname === "/coming-soon"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 管理画面IPチェック
  if (isAdminBlocked(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Basic認証チェック
  const authResponse = basicAuth(request);
  if (authResponse) return authResponse;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // auth系・API・静的ファイルは全ガードをスキップ
  const isAuthPath    = pathname.startsWith("/auth/") || pathname.startsWith("/api/auth/");
  const isApiPath     = pathname.startsWith("/api/");
  const isPublicAsset = pathname.startsWith("/_next/") || pathname.startsWith("/icons/") || pathname.startsWith("/public/");

  // ログイン済みユーザーが /auth/login or /auth/signup にアクセスしたらトップへ
  if (user && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 未ログインユーザーが保護パスにアクセスしたらログインへ（next付き）
  const isProtected = pathname.startsWith("/mypage") || pathname.startsWith("/admin");
  if (!user && isProtected && !isApiPath) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // BANユーザーは /banned 以外アクセス不可
  if (
    user?.user_metadata?.status === "banned" &&
    !pathname.startsWith("/banned") &&
    !pathname.startsWith("/auth/logout") &&
    !isApiPath
  ) {
    return NextResponse.redirect(new URL("/banned", request.url));
  }

  if (user && !isAuthPath && !isApiPath && !isPublicAsset) {
    // メール未認証ガード（メール/パスワード登録のみ対象）
    // Google OAuthはemail_confirmed_atが自動でセットされるため対象外
    const isEmailUser = user.app_metadata?.provider === "email";
    if (isEmailUser && !user.email_confirmed_at && !pathname.startsWith("/banned")) {
      return NextResponse.redirect(new URL("/auth/signup?success=1", request.url));
    }

    // プロフィール未完了ガード（メール確認済み or Googleユーザー）
    const profileDone = pathname === "/auth/complete-profile";
    if (!profileDone && !user.user_metadata?.gender) {
      return NextResponse.redirect(new URL("/auth/complete-profile", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
