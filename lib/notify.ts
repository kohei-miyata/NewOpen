const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL;

async function sendGoogleChat(text: string): Promise<void> {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {}
}

export async function notifyNewUser({
  email,
  role,
  provider,
}: {
  email: string;
  role: string;
  provider?: string;
}): Promise<void> {
  const roleLabel = role === "owner" ? "オーナー" : "一般ユーザー";
  const providerLabel = provider === "google" ? "Google" : provider === "line" ? "LINE" : "メール";
  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sendGoogleChat(
    `🆕 新規ユーザー登録\n👤 ${email}\n🏷 ${roleLabel}　📲 ${providerLabel}\n🕐 ${now}`
  );
}

export async function notifyNewStore({
  storeName,
  category,
  ownerEmail,
}: {
  storeName: string;
  category: string;
  ownerEmail?: string;
}): Promise<void> {
  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sendGoogleChat(
    `🏪 新規店舗登録（審査待ち）\n📛 ${storeName}\n🍽 ${category}${ownerEmail ? `\n👤 ${ownerEmail}` : ""}\n🕐 ${now}`
  );
}
