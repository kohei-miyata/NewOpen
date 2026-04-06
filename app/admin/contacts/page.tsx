import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = { title: "お問い合わせ一覧 | 管理者" };

export default async function AdminContactsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const admin = createSupabaseAdminClient();
  const { data: contacts } = await admin
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← 管理画面に戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <EnvelopeIcon className="w-6 h-6 text-orange-500" /> お問い合わせ一覧
          </h1>
        </div>
        <span className="text-sm text-gray-500">{contacts?.length ?? 0} 件</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">日時</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">名前</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">メール</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">会社・部署</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">内容</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-orange-50 transition-colors align-top">
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(c.created_at).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-3">
                  <a href={`mailto:${c.email}`} className="text-orange-500 hover:underline">{c.email}</a>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {[c.company, c.department].filter(Boolean).join(" / ") || "-"}
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-sm">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed line-clamp-3">{c.message}</p>
                </td>
              </tr>
            ))}
            {(!contacts || contacts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  お問い合わせはまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
