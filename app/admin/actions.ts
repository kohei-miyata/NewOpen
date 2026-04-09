"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") throw new Error("Forbidden");
}

async function getMailer() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) return null;
  const nodemailer = await import("nodemailer");
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    }),
    gmailUser,
  };
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

  // オーナーのメールを取得
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

  // オーナーへ承認メール
  if (storeRow.owner_id) {
    const { data: ownerData } = await admin.auth.admin.getUserById(storeRow.owner_id);
    const ownerEmail = ownerData?.user?.email;
    if (ownerEmail) {
      const mailer = await getMailer();
      if (mailer) {
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
        await mailer.transporter.sendMail({
          from: `NEW OPEN <${mailer.gmailUser}>`,
          to: ownerEmail,
          subject,
          html: body,
        }).catch(console.error);

        await admin.from("store_email_history").insert({
          store_id: storeId,
          subject,
          body,
          recipient_email: ownerEmail,
        }).then(null, console.error);
      }
    }
  }

  revalidatePath("/admin/owners");
}

/** 否認テンプレート一覧 */
export const REJECTION_TEMPLATES = [
  {
    id: "adult",
    label: "風俗・成人向け店舗",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      誠に恐れ入りますが、ご登録いただいた店舗情報を審査した結果、<br>
      <strong>風俗・成人向けに該当する</strong>との判断により、掲載をお断りさせていただきます。</p>
      <p>ご了承のほど、よろしくお願いいたします。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "no_physical_store",
    label: "実店舗ではない",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      誠に恐れ入りますが、ご登録いただいた情報を審査した結果、<br>
      <strong>実店舗として確認できなかった</strong>ため、掲載をお断りさせていただきます。</p>
      <p>実店舗をお持ちの場合は、住所・写真等を正確にご入力の上、再度ご登録ください。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "insufficient_info",
    label: "情報不足",
    subject: "【NEW OPEN】掲載審査の結果について（情報の追加をお願いします）",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      ご登録いただいた情報を審査した結果、<strong>掲載に必要な情報が不足</strong>しているため、<br>
      現時点では掲載をお断りさせていただきます。</p>
      <p>店舗写真・住所・説明文等を充実させた上で、再度ご登録いただけますと幸いです。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "other",
    label: "その他（カスタムメッセージ）",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (_storeName: string) => ``,
  },
];

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

      const mailer = await getMailer();
      if (mailer) {
        await mailer.transporter.sendMail({
          from: `NEW OPEN <${mailer.gmailUser}>`,
          to: ownerEmail,
          subject,
          html: body,
        }).catch(console.error);

        await admin.from("store_email_history").insert({
          store_id: storeId,
          subject,
          body,
          recipient_email: ownerEmail,
        }).then(null, console.error);
      }
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

  const gmailUser = process.env.GMAIL_USER;
  const mailer = await getMailer();
  const fullHtml = `
    <p>${contact.name} 様</p>
    <p>いつもNEW OPENをご利用いただきありがとうございます。</p>
    <p>${replyBody.replace(/\n/g, "<br>")}</p>
    <hr>
    <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報<br>
    ※このメールは運営からの返信です。</p>
  `;

  if (mailer) {
    await mailer.transporter.sendMail({
      from: `NEW OPEN <${mailer.gmailUser}>`,
      to: contact.email,
      subject: `【NEW OPEN】お問い合わせへのご返信`,
      html: fullHtml,
    });
  }

  await admin.from("contact_replies").insert({
    contact_id: contactId,
    body: replyBody,
  });

  revalidatePath("/admin/contacts");
}
