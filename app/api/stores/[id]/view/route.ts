import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("increment_views", { store_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 日別閲覧数を記録（アナリティクス用）
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
  const admin = createSupabaseAdminClient();
  await admin.rpc("upsert_view_history", { p_store_id: id, p_date: today }).then(null, console.error);

  return NextResponse.json({ ok: true });
}
