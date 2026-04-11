"use server";

import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { sendMail } from "@/lib/mailer";

export async function submitContact(formData: FormData) {
  const name       = (formData.get("name")       as string).trim();
  const email      = (formData.get("email")      as string).trim();
  const message    = (formData.get("message")    as string).trim();
  const company    = (formData.get("company")    as string).trim() || null;
  const department = (formData.get("department") as string).trim() || null;

  if (!name || !email || !message) redirect("/contact?error=missing");
  if (name.length > 100) redirect("/contact?error=missing");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/contact?error=missing");
  if (message.length < 10 || message.length > 5000) redirect("/contact?error=missing");
  if ((company ?? "").length > 200) redirect("/contact?error=missing");
  if ((department ?? "").length > 200) redirect("/contact?error=missing");

  const { error } = await getSupabaseClient()
    .from("contacts")
    .insert({ name, email, message, company, department });

  if (error) redirect(`/contact?error=${encodeURIComponent(error.message)}`);

  const adminEmail = (process.env.ADMIN_EMAIL ?? process.env.MAIL_FROM ?? "info@newopen.site").trim();
  const results = await Promise.allSettled([
    // ユーザーへの自動返信
    sendMail({
      to: email,
      subject: "【NEW OPEN】お問い合わせを受け付けました",
      html: `
        <p>${name} 様</p>
        <p>お問い合わせいただきありがとうございます。<br>
        内容を確認の上、担当者よりご連絡いたします。</p>
        <hr>
        <p><strong>お問い合わせ内容</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
      `,
    }),
    // 運営への通知
    sendMail({
      to: adminEmail,
      subject: `【NEW OPEN】お問い合わせ：${name}`,
      html: `
        <p><strong>氏名：</strong>${name}</p>
        <p><strong>メール：</strong>${email}</p>
        ${company    ? `<p><strong>会社名：</strong>${company}</p>`   : ""}
        ${department ? `<p><strong>部署：</strong>${department}</p>` : ""}
        <p><strong>内容：</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }),
  ]);
  if (results[0].status === "rejected") console.error("[contact] user mail failed:", results[0].reason);
  if (results[1].status === "rejected") console.error("[contact] admin mail failed:", results[1].reason, "to:", adminEmail);

  redirect("/contact?success=1");
}
