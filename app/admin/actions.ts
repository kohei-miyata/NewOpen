"use server";

import { revalidatePath } from "next/cache";
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
    .select("id, name, owner_id")
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

  revalidatePath("/admin/owners");
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
}

/** 審査待ちに戻す */
export async function setPendingStore(storeId: string) {
  await assertAdmin();
  const admin = createSupabaseAdminClient();
  await admin.from("stores").update({ approval_status: "pending" }).eq("id", storeId);
  revalidatePath("/admin/owners");
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

  await sendMail({
    to: contact.email,
    subject: "【NEW OPEN】お問い合わせへのご返信",
    html: fullHtml,
  });

  await admin.from("contact_replies").insert({
    contact_id: contactId,
    body: replyBody,
  });

  revalidatePath("/admin/contacts");
}
