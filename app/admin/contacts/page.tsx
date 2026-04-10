import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import ContactReplyForm from "@/components/ContactReplyForm";

export const metadata: Metadata = { title: "お問い合わせ一覧 | 管理者" };

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showUnansweredOnly = filter === "unanswered";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const admin = createSupabaseAdminClient();

  const { data: contacts } = await admin
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  // 返信履歴を一括取得
  const { data: allReplies } = await admin
    .from("contact_replies")
    .select("*")
    .order("sent_at", { ascending: true });

  const repliesByContact: Record<string, { id: string; body: string; sent_at: string }[]> = {};
  (allReplies ?? []).forEach((r) => {
    if (!repliesByContact[r.contact_id]) repliesByContact[r.contact_id] = [];
    repliesByContact[r.contact_id].push(r);
  });

  const allContacts = contacts ?? [];
  const unansweredCount = allContacts.filter((c) => !repliesByContact[c.id]?.length).length;
  const displayContacts = showUnansweredOnly
    ? allContacts.filter((c) => !repliesByContact[c.id]?.length)
    : allContacts;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← 管理画面に戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <EnvelopeIcon className="w-6 h-6 text-orange-500" /> お問い合わせ一覧
          </h1>
        </div>
        <span className="text-sm text-gray-500">{displayContacts.length} 件</span>
      </div>

      {/* フィルター */}
      <div className="flex gap-2">
        <Link
          href="/admin/contacts"
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            !showUnansweredOnly
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
          }`}
        >
          すべて（{allContacts.length}）
        </Link>
        <Link
          href="/admin/contacts?filter=unanswered"
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            showUnansweredOnly
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-gray-600 border-gray-300 hover:border-red-400"
          }`}
        >
          未返信（{unansweredCount}）
        </Link>
      </div>

      <div className="space-y-4">
        {displayContacts.map((c) => {
          const replies = repliesByContact[c.id] ?? [];
          return (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${replies.length === 0 ? "border-red-200" : "border-gray-100"}`}>
              {/* 問い合わせ内容 */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      {replies.length === 0 && (
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">未返信</span>
                      )}
                    </div>
                    <a href={`mailto:${c.email}`} className="text-xs text-orange-500 hover:underline">{c.email}</a>
                    {(c.company || c.department) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[c.company, c.department].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString("ja-JP", {
                      year: "numeric", month: "2-digit", day: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.message}</p>
              </div>

              {/* 返信履歴 */}
              {replies.length > 0 && (
                <div className="border-t border-gray-50 bg-orange-50 px-5 py-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">返信履歴（{replies.length} 件）</p>
                  {replies.map((r) => (
                    <div key={r.id} className="bg-white rounded-lg border border-orange-100 px-4 py-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(r.sent_at).toLocaleString("ja-JP", {
                          year: "numeric", month: "2-digit", day: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 italic mb-2">
                        {c.name} 様<br />
                        いつもNEW OPENをご利用いただきありがとうございます。
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 返信フォーム */}
              <ContactReplyForm contactId={c.id} contactName={c.name} />
            </div>
          );
        })}

        {(!contacts || contacts.length === 0) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-12 text-center text-sm text-gray-400">
            お問い合わせはまだありません
          </div>
        )}
      </div>
    </div>
  );
}
