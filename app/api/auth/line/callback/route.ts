import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";
  const lineError = searchParams.get("error");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;

  if (lineError || !code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("LINEログインがキャンセルされました")}`
    );
  }

  const role = state.startsWith("role:owner") ? "owner" : "user";

  // LINE のアクセストークンを取得
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${siteUrl}/api/auth/line/callback`,
      client_id: process.env.LINE_CHANNEL_ID!,
      client_secret: process.env.LINE_CHANNEL_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("LINE認証に失敗しました")}`
    );
  }

  const tokenData = await tokenRes.json();

  // LINE プロフィールを取得
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("LINEプロフィールの取得に失敗しました")}`
    );
  }

  const profile = await profileRes.json();
  const lineEmail = `line_${profile.userId}@line.newopen.site`;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ユーザー作成を試みる（既存なら duplicate エラー）
  let isNewUser = false;
  const { error: createError } = await admin.auth.admin.createUser({
    email: lineEmail,
    email_confirm: true,
    user_metadata: {
      line_user_id: profile.userId,
      display_name: profile.displayName,
      avatar_url: profile.pictureUrl,
      role,
      email_notifications: true,
    },
  });

  if (!createError) {
    isNewUser = true;
  } else if (!/already registered|already exists|duplicate/i.test(createError.message)) {
    // duplicate 以外のエラーは失敗
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("アカウント作成に失敗しました")}`
    );
  }

  // マジックリンクでセッションを生成
  const redirectTo = isNewUser ? `${siteUrl}/auth/complete-profile` : `${siteUrl}/`;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: lineEmail,
    options: { redirectTo },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("ログインに失敗しました")}`
    );
  }

  return NextResponse.redirect(linkData.properties.action_link);
}
