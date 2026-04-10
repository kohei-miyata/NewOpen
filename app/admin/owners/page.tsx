import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { approveStore, rejectStore, setPendingStore } from "@/app/admin/actions";
import { REJECTION_TEMPLATES } from "@/lib/rejection-templates";
import { BuildingStorefrontIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { ApproveSubmitButton, RejectSubmitButton, PendingSubmitButton } from "@/components/AdminActionButtons";

export const metadata: Metadata = { title: "店舗審査管理 | 管理者" };

type SortKey = "name" | "category" | "owner" | "created_at" | "status" | "email_count";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: "審査中",  cls: "bg-yellow-100 text-yellow-700" },
  approved: { label: "承認済",  cls: "bg-green-100  text-green-700"  },
  rejected: { label: "否認",    cls: "bg-red-100    text-red-600"    },
};

export default async function AdminOwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort, dir } = await searchParams;
  const sortKey = (sort as SortKey) || "created_at";
  const sortDir = (dir as SortDir) || "desc";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const admin = createSupabaseAdminClient();

  // 全店舗 + オーナー情報
  const { data: stores } = await admin
    .from("stores")
    .select("id, name, category, address, open_date, approval_status, owner_id, created_at")
    .order("created_at", { ascending: false });

  // owner_id → email マップ
  const ownerIds = [...new Set((stores ?? []).map((s) => s.owner_id).filter(Boolean))];
  const ownerEmailMap: Record<string, string> = {};
  await Promise.all(
    ownerIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      if (data?.user?.email) ownerEmailMap[id] = data.user.email;
    })
  );

  // 各店舗のメール送信履歴数
  const { data: emailCounts } = await admin
    .from("store_email_history")
    .select("store_id");
  const emailCountMap: Record<string, number> = {};
  (emailCounts ?? []).forEach((r) => {
    emailCountMap[r.store_id] = (emailCountMap[r.store_id] ?? 0) + 1;
  });

  const pending = (stores ?? []).filter((s) => s.approval_status === "pending");

  const rawOthers = (stores ?? []).filter((s) => s.approval_status !== "pending");
  const others = [...rawOthers].sort((a, b) => {
    let av: string, bv: string;
    switch (sortKey) {
      case "name":        av = a.name;                          bv = b.name; break;
      case "category":    av = a.category;                      bv = b.category; break;
      case "owner":       av = ownerEmailMap[a.owner_id] ?? ""; bv = ownerEmailMap[b.owner_id] ?? ""; break;
      case "status":      av = a.approval_status;               bv = b.approval_status; break;
      case "email_count": av = String(emailCountMap[a.id] ?? 0).padStart(6, "0"); bv = String(emailCountMap[b.id] ?? 0).padStart(6, "0"); break;
      default:            av = a.created_at;                    bv = b.created_at;
    }
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← 管理画面に戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" /> 店舗審査管理
          </h1>
          <p className="text-xs text-gray-400 mt-1">新規登録店舗を3営業日以内に審査し、結果をメールでお伝えします</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-yellow-600">{pending.length}</p>
          <p className="text-xs text-gray-400">審査待ち</p>
        </div>
      </div>

      {/* 審査待ち */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-3">
          審査待ち
          <span className="ml-2 text-xs font-normal bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{pending.length} 件</span>
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">審査待ちの店舗はありません</p>
        ) : (
          <div className="space-y-4">
            {pending.map((store) => (
              <StoreReviewCard
                key={store.id}
                store={store}
                ownerEmail={ownerEmailMap[store.owner_id] ?? ""}
                emailCount={emailCountMap[store.id] ?? 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* 承認済み・否認 */}
      <section>
        <h2 className="text-base font-bold text-gray-800 mb-3">
          審査済み
          <span className="ml-2 text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{others.length} 件</span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {(
                  [
                    { key: "name",        label: "店舗名" },
                    { key: "category",    label: "カテゴリ" },
                    { key: "owner",       label: "オーナー" },
                    { key: "created_at",  label: "登録日" },
                    { key: "status",      label: "ステータス" },
                    { key: "email_count", label: "メール数" },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => {
                  const active = sortKey === key;
                  const nextDir = active && sortDir === "asc" ? "desc" : "asc";
                  return (
                    <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                      <Link
                        href={`/admin/owners?sort=${key}&dir=${nextDir}`}
                        className={`inline-flex items-center gap-0.5 hover:text-orange-500 transition-colors ${active ? "text-orange-500" : ""}`}
                      >
                        {label}
                        {active
                          ? sortDir === "asc"
                            ? <ChevronUpIcon className="w-3 h-3" />
                            : <ChevronDownIcon className="w-3 h-3" />
                          : <span className="w-3 h-3 opacity-0"><ChevronUpIcon className="w-3 h-3" /></span>
                        }
                      </Link>
                    </th>
                  );
                })}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {others.map((store) => {
                const statusInfo = STATUS_LABEL[store.approval_status] ?? STATUS_LABEL.pending;
                return (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a href={`/stores/${store.id}`} target="_blank" rel="noopener" className="font-medium text-gray-900 hover:text-orange-500 transition-colors">
                        {store.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{store.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{ownerEmailMap[store.owner_id] ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(store.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{emailCountMap[store.id] ?? 0}</td>
                    <td className="px-4 py-3">
                      <form action={setPendingStore.bind(null, store.id)}>
                        <PendingSubmitButton />
                      </form>
                    </td>
                  </tr>
                );
              })}
              {others.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">まだ審査済みの店舗はありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─── 審査カード（Server Component / form actions） ───────────────────────────

function StoreReviewCard({
  store,
  ownerEmail,
  emailCount,
}: {
  store: { id: string; name: string; category: string; address: string; open_date: string; owner_id: string; created_at: string };
  ownerEmail: string;
  emailCount: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-5 space-y-4">
      {/* 店舗情報 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <a
            href={`/stores/${store.id}`}
            target="_blank"
            rel="noopener"
            className="text-base font-bold text-gray-900 hover:text-orange-500 transition-colors"
          >
            {store.name} →
          </a>
          <p className="text-xs text-gray-500 mt-0.5">{store.category} ／ {store.address}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            オープン日：{store.open_date} ／ オーナー：{ownerEmail || "-"} ／
            登録日：{new Date(store.created_at).toLocaleDateString("ja-JP")} ／
            送信メール：{emailCount} 件
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">審査中</span>
      </div>

      {/* 承認ボタン */}
      <form action={approveStore.bind(null, store.id)}>
        <ApproveSubmitButton />
      </form>

      {/* 否認フォーム */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-600 transition-colors select-none">
          ✕ 否認する
        </summary>
        <form action={rejectStore} className="mt-3 space-y-3 border-t border-red-100 pt-3">
          <input type="hidden" name="storeId" value={store.id} />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">否認理由テンプレート</label>
            <select name="templateId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              {REJECTION_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            「その他（カスタムメッセージ）」を選んだ場合は以下に本文を入力してください。
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">件名（その他の場合のみ）</label>
            <input
              name="customSubject"
              placeholder="件名を入力..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">本文（その他の場合のみ）</label>
            <textarea
              name="customBody"
              rows={4}
              placeholder="返信本文を入力..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"
            />
          </div>

          <RejectSubmitButton />
        </form>
      </details>
    </div>
  );
}
