import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "メルマガ配信 | 管理者" };

export default async function NewsletterPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const admin = createSupabaseAdminClient();

  // 通知希望ユーザー数
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const notifyCount = users.filter((u) => u.user_metadata?.email_notifications === true).length;

  // 送信履歴
  const { data: history } = await admin
    .from("newsletter_history")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(30);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← 管理画面に戻る</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
          <MegaphoneIcon className="w-6 h-6 text-orange-500" /> メルマガ配信
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          現在 <span className="font-bold text-orange-500">{notifyCount} 人</span> が通知をオンにしています
        </p>
      </div>

      {/* 送信フォーム */}
      <NewsletterForm />

      {/* 送信履歴 */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-3">送信履歴</h2>
        {!history || history.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">
            送信履歴はまだありません
          </p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {history.map((h) => (
              <details key={h.id} className="group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-900 truncate">{h.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(h.sent_at).toLocaleString("ja-JP", {
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
                      {h.sent_count} 件送信
                    </span>
                    <span className="text-gray-300 text-xs group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="px-5 pb-4 pt-0">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
                    {h.body}
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
