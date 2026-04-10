import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CONTACT_FAQS as FAQS } from "@/lib/faqs";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const sp = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const defaultName  = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const defaultEmail = user?.email ?? "";

  if (sp.success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 flex justify-center"><CheckCircleIcon className="w-12 h-12 text-green-500" /></div>
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
      <div className="max-w-lg mx-auto px-4 py-10 space-y-12">

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-1">よくある質問</h2>
          <p className="text-sm text-gray-500 mb-4">お問い合わせの前にご確認ください</p>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center px-4 py-3.5 cursor-pointer font-medium text-sm text-gray-900 hover:bg-orange-50 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-orange-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-2">+</span>
                </summary>
                <p className="px-4 pb-3.5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* お問い合わせフォーム */}
        <section>
          <h1 className="text-lg font-bold text-gray-900 mb-1">お問い合わせ</h1>
          <p className="text-sm text-gray-500 mb-6">
            上記で解決しない場合はこちらからお送りください。
          </p>
          <ContactForm serverError={sp.error} defaultName={defaultName} defaultEmail={defaultEmail} />
        </section>

      </div>
    </div>
  );
}
