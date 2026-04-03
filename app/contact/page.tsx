import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sp = await searchParams;

  if (sp.success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-gray-900">お問い合わせを受け付けました</h2>
          <p className="text-sm text-gray-500 mt-2">内容を確認の上、ご連絡いたします。</p>
          <Link href="/" className="inline-block mt-6 text-orange-500 hover:underline text-sm">
            ホームに戻る →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-8">
          ご質問・ご要望はこちらからお送りください。
        </p>
        <ContactForm serverError={sp.error} />
      </div>
    </div>
  );
}
