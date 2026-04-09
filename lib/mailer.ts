/**
 * 共通メーラー
 * 環境変数:
 *   SMTP_HOST      例: sv****.onamae.ne.jp
 *   SMTP_PORT      例: 587 (デフォルト)
 *   SMTP_USER      例: info@newopen.site
 *   SMTP_PASS      SMTPパスワード
 *   MAIL_FROM_NAME 例: NEW OPEN (デフォルト)
 */
export async function getMailer() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port   = Number(process.env.SMTP_PORT ?? 587);
  const secure = port === 465;
  const fromName = process.env.MAIL_FROM_NAME ?? "NEW OPEN";

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return {
    transporter,
    from: `${fromName} <${user}>`,
  };
}
