/**
 * 共通メーラー (Resend)
 * 環境変数:
 *   RESEND_API_KEY    Resendのシークレットキー (re_xxxxxxxxxxxx)
 *   MAIL_FROM         送信元アドレス 例: info@newopen.site
 *   MAIL_FROM_NAME    送信者名 例: NEW OPEN (デフォルト)
 */

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/** HTML からプレーンテキストを生成（スパム判定対策） */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export async function sendMail(options: MailOptions): Promise<void> {
  const apiKey   = process.env.RESEND_API_KEY;
  const fromAddr = process.env.MAIL_FROM ?? "info@newopen.site";
  const fromName = process.env.MAIL_FROM_NAME ?? "NEW OPEN";

  if (!apiKey) {
    console.warn("[mailer] RESEND_API_KEY が設定されていません。メール送信をスキップします。");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromAddr}>`,
    to: Array.isArray(options.to) ? options.to : [options.to],
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    text: htmlToText(options.html), // テキスト版を追加（スパム判定スコア改善）
  });

  if (error) throw new Error(error.message);
}
