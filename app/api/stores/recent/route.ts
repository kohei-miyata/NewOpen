import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  if (!ids.length) return NextResponse.json([]);

  const { data, error } = await getSupabaseClient()
    .from("stores")
    .select("*")
    .in("id", ids.slice(0, 6)); // 最大6件

  if (error) return NextResponse.json([], { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stores = (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: row.name,
    category: row.category,
    address: row.address,
    openDate: row.open_date,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    views: Number(row.views),
    likes: Number(row.likes),
    tags: Array.isArray(row.tags) ? row.tags : [],
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    hoursText: row.hours_text ?? null,
    photos: Array.isArray(row.photos) ? row.photos : [],
    snsLinks: row.sns_links ?? null,
  }));

  return NextResponse.json(stores);
}
