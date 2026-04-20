import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getStores } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(`ai-search:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { query } = await request.json();
  if (!query?.trim()) {
    return NextResponse.json({ ids: [] });
  }

  const stores = await getStores();
  if (stores.length === 0) return NextResponse.json({ ids: [] });

  const storeList = stores.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    address: s.address,
    description: s.description,
    tags: s.tags,
  }));

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `あなたはお店探しのアシスタントです。
ユーザーの希望に合う店舗をリストから選び、IDを返してください。
必ず以下のJSON形式のみで返答してください（他のテキスト不要）:
{"ids": ["id1", "id2", ...]}
最大8件まで。希望に合う店がなければ {"ids": []} を返してください。`,
    messages: [
      {
        role: "user",
        content: `ユーザーの希望: ${query}

店舗リスト:
${JSON.stringify(storeList, null, 2)}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ ids: [] });

  const { ids } = JSON.parse(match[0]);
  return NextResponse.json({ ids: Array.isArray(ids) ? ids : [] });
}
