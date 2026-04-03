import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { increment } = (await req.json()) as { increment: boolean };

  if (increment) {
    await supabase.from("store_likes").upsert({ user_id: user.id, store_id: id });
  } else {
    await supabase.from("store_likes").delete().eq("user_id", user.id).eq("store_id", id);
  }

  // likes カウントを store_likes の件数に同期
  const { count } = await supabase
    .from("store_likes")
    .select("*", { count: "exact", head: true })
    .eq("store_id", id);

  await supabase.from("stores").update({ likes: count ?? 0 }).eq("id", id);

  return NextResponse.json({ likes: count ?? 0 });
}
