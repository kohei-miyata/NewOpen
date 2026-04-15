"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { REJECTION_TEMPLATES } from "@/lib/rejection-templates";
import { sendMail } from "@/lib/mailer";
import { createStore } from "@/lib/db";
import type { Category, SnsLinks } from "@/types";

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Forbidden");
}

// ─── 店舗登録（管理者代行） ───────────────────────────────────────────────────

export type AdminStoreFormState = { error?: string } | null;

function parseAdminStoreFormData(formData: FormData) {
  const name        = formData.get("name") as string;
  const category    = formData.get("category") as Category;
  const address     = formData.get("address") as string;
  const openDate    = formData.get("openDate") as string;
  const description = formData.get("description") as string;
  const hoursText   = (formData.get("hoursText") as string) || null;
  const imageUrl    = (formData.get("imageUrl") as string) || "";
  const tagsRaw     = (formData.get("tags") as string) || "";

  const photos: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const url = (formData.get(`photo${i}`) as string)?.trim();
    if (url) photos.push(url);
  }

  const tags = tagsRaw.split(/[,、]/).map((t) => t.trim()).filter(Boolean);

  const snsLinks: SnsLinks = {};
  const website    = (formData.get("sns_website")    as string)?.trim();
  const instagram  = (formData.get("sns_instagram")  as string)?.trim();
  const twitter    = (formData.get("sns_twitter")    as string)?.trim();
  const tiktok     = (formData.get("sns_tiktok")     as string)?.trim();
  const line       = (formData.get("sns_line")        as string)?.trim();
  const googleMaps = (formData.get("sns_google_maps") as string)?.trim();
  if (website)    snsLinks.website     = website;
  if (instagram)  snsLinks.instagram   = instagram;
  if (twitter)    snsLinks.twitter     = twitter;
  if (tiktok)     snsLinks.tiktok      = tiktok;
  if (line)       snsLinks.line        = line;
  if (googleMaps) snsLinks.google_maps = googleMaps;

  const twitterPostUrl   = (formData.get("post_twitter_url")   as string)?.trim() || null;
  const instagramPostUrl = (formData.get("post_instagram_url") as string)?.trim() || null;
  const tiktokPostUrl    = (formData.get("post_tiktok_url")    as string)?.trim() || null;

  const statusRaw = (formData.get("status") as string) || "active";
  const status = ["active", "temporarily_closed", "closed"].includes(statusRaw)
    ? (statusRaw as "active" | "temporarily_closed" | "closed")
    : "active" as const;

  return {
    name, category, address, openDate, description, hoursText, imageUrl,
    photos, tags,
    snsLinks: Object.keys(snsLinks).length > 0 ? snsLinks : null,
    twitterPostUrl, instagramPostUrl, tiktokPostUrl, status,
  };
}

export async function newAdminStore(
  _prevState: AdminStoreFormState,
  formData: FormData
): Promise<AdminStoreFormState> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const payload = parseAdminStoreFormData(formData);

  if (!payload.address?.trim()) return { error: "住所を入力してください" };
  if (!/[都道府県]/.test(payload.address)) return { error: "都道府県から入力してください" };
  if (!/[市区町村郡]/.test(payload.address)) return { error: "市区町村まで入力してください" };

  try {
    await createStore({ ...payload, lat: null, lng: null, ownerId: undefined }, admin);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "登録に失敗しました" };
  }

  revalidateTag("store");
  redirect("/admin/owners");
}

// ─── ユーザー管理 ────────────────────────────────────────────────────────────

export async function banUser(userId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { status: "banned" },
  });
  revalidatePath("/admin");
}

export async function unbanUser(userId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { status: "active" },
  });
  revalidatePath("/admin");
}

// ─── 店舗審査 ─────────────────────────────────────────────────────────────────

/** 承認：approval_status → approved */
export async function approveStore(storeId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const { data: storeRow } = await admin
    .from("stores")
    .select("id, name, category, address, open_date, owner_id")
    .eq("id", storeId)
    .single();
  if (!storeRow) throw new Error("店舗が見つかりません");

  await admin
    .from("stores")
    .update({ approval_status: "approved" })
    .eq("id", storeId);

  if (storeRow.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(storeRow.owner_id);
    const ownerEmail = ownerData?.user?.email;
    if (ownerEmail) {
      const subject = `【NEW OPEN】${storeRow.name}様の掲載が承認されました`;
      const body = `
        <p>${storeRow.name} 担当者様</p>
        <p>この度はNEW OPENへのご登録ありがとうございます。<br>
        ご登録いただいた店舗情報の審査が完了し、<strong>掲載が承認</strong>されました。<br>
        現在、一般公開されています。</p>
        <p>今後ともNEW OPENをよろしくお願いいたします。</p>
        <hr>
        <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
      `;
      await sendMail({ to: ownerEmail, subject, html: body }).catch(console.error);
      await admin.from("store_email_history").insert({
        store_id: storeId, subject, body, recipient_email: ownerEmail,
      }).then(null, console.error);
    }
  }

  // 通知希望の一般ユーザーへ一斉送信
  const { data: { users: allUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const notifyUsers = allUsers.filter(
    (u) => u.user_metadata?.email_notifications === true
      && u.user_metadata?.role !== "owner"
      && u.user_metadata?.role !== "admin"
      && u.email
  );

  if (notifyUsers.length > 0) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const notifySubject = `【NEW OPEN】新しいお店がオープンしました！「${storeRow.name}」`;
    const notifyHtml = `
      <p>NEW OPEN をご利用いただきありがとうございます。</p>
      <p>新しいお店の掲載が開始されました。</p>
      <table style="border-collapse:collapse;margin:16px 0;">
        <tr><td style="color:#888;padding:4px 12px 4px 0;font-size:14px;">店舗名</td><td style="font-size:14px;font-weight:bold;">${storeRow.name}</td></tr>
        <tr><td style="color:#888;padding:4px 12px 4px 0;font-size:14px;">カテゴリ</td><td style="font-size:14px;">${storeRow.category ?? ""}</td></tr>
        <tr><td style="color:#888;padding:4px 12px 4px 0;font-size:14px;">住所</td><td style="font-size:14px;">${storeRow.address ?? ""}</td></tr>
        <tr><td style="color:#888;padding:4px 12px 4px 0;font-size:14px;">オープン日</td><td style="font-size:14px;">${storeRow.open_date ?? ""}</td></tr>
      </table>
      <p><a href="${siteUrl}/stores/${storeRow.id}" style="background:#f97316;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">店舗の詳細を見る →</a></p>
      <hr style="margin:24px 0;">
      <p style="font-size:12px;color:#888;">
        NEW OPEN — あなたの街の新規オープン情報<br>
        メール通知の停止は<a href="${siteUrl}/mypage/settings" style="color:#f97316;">マイページの設定</a>から行えます。
      </p>
    `;
    await Promise.allSettled(
      notifyUsers.map((u) =>
        sendMail({ to: u.email!, subject: notifySubject, html: notifyHtml })
      )
    );
  }

  revalidatePath("/admin/owners");
  revalidateTag("store");
  revalidateTag("coupons");
  revalidateTag("coupons-with-location");
}

/** 否認：approval_status → rejected、メール送信 */
export async function rejectStore(formData: FormData) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const storeId       = formData.get("storeId") as string;
  const templateId    = formData.get("templateId") as string;
  const customSubject = (formData.get("customSubject") as string)?.trim();
  const customBody    = (formData.get("customBody") as string)?.trim();

  const { data: storeRow } = await admin
    .from("stores")
    .select("id, name, owner_id")
    .eq("id", storeId)
    .single();
  if (!storeRow) throw new Error("店舗が見つかりません");

  await admin
    .from("stores")
    .update({ approval_status: "rejected" })
    .eq("id", storeId);

  if (storeRow.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(storeRow.owner_id);
    const ownerEmail = ownerData?.user?.email;
    if (ownerEmail) {
      const tmpl = REJECTION_TEMPLATES.find((t) => t.id === templateId);
      let subject = tmpl?.subject ?? "【NEW OPEN】掲載審査の結果について";
      let body    = tmpl?.body(storeRow.name) ?? "";

      if (templateId === "other") {
        subject = customSubject || subject;
        body    = customBody
          ? `<p>${storeRow.name} 担当者様</p><p>${customBody.replace(/\n/g, "<br>")}</p><hr><p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>`
          : body;
      }

      await sendMail({ to: ownerEmail, subject, html: body }).catch(console.error);
      await admin.from("store_email_history").insert({
        store_id: storeId, subject, body, recipient_email: ownerEmail,
      }).then(null, console.error);
    }
  }

  revalidatePath("/admin/owners");
  revalidateTag("store");
  revalidateTag("coupons");
  revalidateTag("coupons-with-location");
}

/** オーナーをメールアドレスで紐付ける */
export async function setStoreOwner(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const storeId = formData.get("storeId") as string;
  const email   = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    await admin.from("stores").update({ owner_id: null }).eq("id", storeId);
    revalidatePath("/admin/owners");
    return {};
  }

  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const target = users.find((u) => u.email?.toLowerCase() === email);
  if (!target) return { error: "ユーザーが見つかりません" };

  const { error } = await admin.from("stores").update({ owner_id: target.id }).eq("id", storeId);
  if (error) return { error: error.message };

  revalidatePath("/admin/owners");
  revalidateTag("store");
  return {};
}

/** 審査待ちに戻す */
export async function setPendingStore(storeId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.from("stores").update({ approval_status: "pending" }).eq("id", storeId);
  revalidatePath("/admin/owners");
  revalidateTag("store");
  revalidateTag("coupons");
  revalidateTag("coupons-with-location");
}

// ─── メルマガ配信 ─────────────────────────────────────────────────────────────

export async function sendNewsletter(formData: FormData): Promise<{ sent: number; error?: string }> {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const subject = (formData.get("subject") as string).trim();
  const body    = (formData.get("body")    as string).trim();
  if (!subject || !body) return { sent: 0, error: "件名と本文を入力してください" };

  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const targets = users.filter(
    (u) => u.user_metadata?.email_notifications === true && u.email
  );
  if (targets.length === 0) return { sent: 0, error: "送信対象ユーザーがいません" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      ${body.replace(/\n/g, "<br>")}
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;">
        NEW OPEN — あなたの街の新規オープン情報<br>
        メール通知の停止は<a href="${siteUrl}/mypage/settings" style="color:#f97316;">マイページの設定</a>から行えます。
      </p>
    </div>
  `;

  const results = await Promise.allSettled(
    targets.map((u) => sendMail({ to: u.email!, subject, html }))
  );
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  if (failed > 0) console.error(`[sendNewsletter] ${failed}件 送信失敗`);

  await admin.from("newsletter_history").insert({ subject, body, sent_count: sent }).then(null, console.error);

  revalidatePath("/admin/newsletter");
  return { sent };
}

export async function sendNewsletterTest(formData: FormData): Promise<{ error?: string }> {
  await assertAdmin();
  const subject = (formData.get("subject") as string).trim();
  const body    = (formData.get("body")    as string).trim();
  const to      = (formData.get("testTo")  as string).trim();
  if (!subject || !body) return { error: "件名と本文を入力してください" };
  if (!to) return { error: "送信先アドレスを入力してください" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#fff3e0;border:1px solid #fb923c;border-radius:8px;padding:8px 16px;margin-bottom:16px;font-size:12px;color:#c2410c;">
        ⚠️ これはテスト送信です
      </div>
      ${body}
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;">
        NEW OPEN — あなたの街の新規オープン情報<br>
        メール通知の停止は<a href="${siteUrl}/mypage/settings" style="color:#f97316;">マイページの設定</a>から行えます。
      </p>
    </div>
  `;
  try {
    await sendMail({ to, subject: `[テスト] ${subject}`, html });
    return {};
  } catch (e) {
    return { error: `送信失敗: ${e instanceof Error ? e.message : "不明なエラー"}` };
  }
}

// ─── 問い合わせ返信 ───────────────────────────────────────────────────────────

export async function replyToContact(formData: FormData) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();

  const contactId = formData.get("contactId") as string;
  const replyBody = (formData.get("replyBody") as string)?.trim();
  if (!replyBody) throw new Error("返信内容を入力してください");

  const { data: contact } = await admin
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();
  if (!contact) throw new Error("問い合わせが見つかりません");

  const fullHtml = `
    <p>${contact.name} 様</p>
    <p>いつもNEW OPENをご利用いただきありがとうございます。</p>
    <p>${replyBody.replace(/\n/g, "<br>")}</p>
    <hr>
    <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報<br>
    ※このメールは運営からの返信です。</p>
  `;

  try {
    await sendMail({
      to: contact.email,
      subject: "【NEW OPEN】お問い合わせへのご返信",
      html: fullHtml,
    });
  } catch (e) {
    console.error("[replyToContact] メール送信失敗:", e);
  }

  await admin.from("contact_replies").insert({
    contact_id: contactId,
    body: replyBody,
  });

  revalidatePath("/admin/contacts");
}
