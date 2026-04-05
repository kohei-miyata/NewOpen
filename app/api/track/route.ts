import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json().catch(() => ({ path: "/" }));

    // IP アドレスを取得（Vercel/プロキシ環境対応）
    const ip =
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "127.0.0.1";

    // ローカル・プライベートIPはスキップ
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // ip-api.com（無料・1分45リクエスト制限）でジオロケーション取得
    const geo = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName&lang=ja`,
      { next: { revalidate: 0 } }
    ).then((r) => r.json()).catch(() => null);

    if (!geo || geo.status !== "success") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = createSupabaseAdminClient();
    await admin.from("access_logs").insert({
      prefecture: geo.regionName ?? null,
      country: geo.country ?? "不明",
      path: path ?? "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
