import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });

  const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: "JPG・PNG・WebP・GIF形式の画像のみアップロードできます" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは10MB以下にしてください" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("NewOpen")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[upload] storage error:", error);
    return NextResponse.json({ error: "画像のアップロードに失敗しました。もう一度お試しください" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("NewOpen")
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
