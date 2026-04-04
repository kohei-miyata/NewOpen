import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { geocodeAddress } from "@/lib/geocode";

// 管理者のみ呼べる一回限りの一括geocoding API
// GET /api/admin/geocode-all
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { data: stores, error } = await admin
    .from("stores")
    .select("id, address")
    .is("lat", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!stores || stores.length === 0) {
    return NextResponse.json({ message: "座標未設定の店舗はありません", updated: 0 });
  }

  let updated = 0;
  let failed = 0;
  const results: { id: string; address: string; status: string }[] = [];

  for (const store of stores) {
    // Nominatim の利用規約: 1秒に1リクエストまで
    await new Promise((r) => setTimeout(r, 1100));

    const coords = await geocodeAddress(store.address);
    if (!coords) {
      failed++;
      results.push({ id: store.id, address: store.address, status: "failed" });
      continue;
    }

    const { error: updateError } = await admin
      .from("stores")
      .update({ lat: coords.lat, lng: coords.lng })
      .eq("id", store.id);

    if (updateError) {
      failed++;
      results.push({ id: store.id, address: store.address, status: `error: ${updateError.message}` });
    } else {
      updated++;
      results.push({ id: store.id, address: store.address, status: `ok (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` });
    }
  }

  return NextResponse.json({ updated, failed, total: stores.length, results });
}
