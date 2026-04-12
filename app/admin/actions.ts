"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { REJECTION_TEMPLATES } from "@/lib/rejection-templates";
import { sendMail } from "@/lib/mailer";

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Forbidden");
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
