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
    "image/heic": "heic",
    "image/heif": "heif",
  };
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: "JPG・PNG・WebP・GIF形式の画像のみアップロードできます" }, { status: 400 });
  }

  // HEIC/HEIFはマジックバイト検証をスキップ（フォーマット多様）
  const isHeic = file.type === "image/heic" || file.type === "image/heif";
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは10MB以下にしてください" }, { status: 400 });
  }

  // マジックバイト検証（クライアントの file.type 偽装対策）
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
  const isPng  = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  const isWebp = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
                 header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  const isGif  = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38;
  const magicOk = isHeic
               || (file.type === "image/jpeg" && isJpeg)
               || (file.type === "image/png"  && isPng)
               || (file.type === "image/webp" && isWebp)
               || (file.type === "image/gif"  && isGif);
  if (!magicOk) {
    return NextResponse.json({ error: "ファイル形式が不正です" }, { status: 400 });
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
