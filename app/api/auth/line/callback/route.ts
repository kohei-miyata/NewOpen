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

  // LINE の id_token からメールアドレスを取得（権限申請済みの場合のみ返ってくる）
  let realEmail: string | null = null;
  if (tokenData.id_token) {
    try {
      const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          id_token: tokenData.id_token,
          client_id: process.env.LINE_CHANNEL_ID!,
        }),
      });
      if (verifyRes.ok) {
        const payload = await verifyRes.json();
        if (payload.email && typeof payload.email === "string") {
          realEmail = payload.email;
        }
      }
    } catch {}
  }

  const lineEmail = realEmail ?? `line_${profile.userId}@line.newopen.site`;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ユーザー作成を試みる（重複エラーは無視して続行）
  const { error: createError } = await admin.auth.admin.createUser({
    email: lineEmail,
    email_confirm: true,
    user_metadata: {
      provider: "line",
      line_user_id: profile.userId,
      display_name: profile.displayName,
      avatar_url: profile.pictureUrl,
      role,
      email_notifications: true,
    },
  });

  // createError が null 以外でも重複以外は失敗
  // ただし重複かどうかの判定はせず、generateLink の成否に委ねる
  if (createError) {
    // ユーザーが既に存在する場合は続行、それ以外は失敗
    const msg = createError.message.toLowerCase();
    const isDuplicate = msg.includes("already") || msg.includes("duplicate") || msg.includes("exists") || msg.includes("registered");
    if (!isDuplicate) {
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent("アカウント作成に失敗しました: " + createError.message)}`
      );
    }
  }

  // Supabase の verify URL に直接リダイレクト（セッション確立後に /auth/callback へ戻る）
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: lineEmail,
  });

  if (linkError || !linkData?.properties?.action_link) {
    const msg = linkError?.message ?? "action_link missing";
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("ログインに失敗しました: " + msg)}`
    );
  }

  // Supabase の verify URL が hash トークンをつけてリダイレクトするページ
  const verifyUrl = new URL(linkData.properties.action_link);
  verifyUrl.searchParams.set("redirect_to", `${siteUrl}/auth/line-session`);

  return NextResponse.redirect(verifyUrl.toString());
}
