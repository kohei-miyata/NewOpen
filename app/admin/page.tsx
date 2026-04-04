import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseClient } from "@/lib/supabase";
import { banUser, unbanUser } from "./actions";

export const metadata: Metadata = { title: "管理者ダッシュボード" };

export default async function AdminPage() {
  const admin = createSupabaseAdminClient();
  const db = getSupabaseClient();

  // ユーザー一覧
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const generalUsers = users.filter((u) => u.user_metadata?.role !== "owner" && u.user_metadata?.role !== "admin");
  const ownerUsers   = users.filter((u) => u.user_metadata?.role === "owner");

  // 店舗一覧（全件）
  const { data: stores } = await db.from("stores").select("id, name, category, address, views, likes, open_date, owner_id").order("likes", { ascending: false });
  const storeList = stores ?? [];

  // いいね上位
  const topLiked = [...storeList].sort((a, b) => b.likes - a.likes).slice(0, 10);

  // 閲覧数上位
  const topViewed = [...storeList].sort((a, b) => b.views - a.views).slice(0, 10);

  // カテゴリ別集計
  const byCategory = storeList.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  // 都道府県＋市区町村別集計
  function extractArea(address: string): string {
    if (!address) return "不明";
    // 「○○区」「○○市」「○○郡」「○○町」「○○村」の位置で切る
    const m = address.match(/^(.{2,6}?[都道府県])(.{1,6}?[市区町村郡])/);
    if (m) return m[1] + m[2];
    // 都道府県だけでも取れる場合
    const pref = address.match(/^.{2,4}?[都道府県]/);
    if (pref) return pref[0];
    return address.slice(0, 6);
  }
  const byArea = storeList.reduce<Record<string, number>>((acc, s) => {
    const area = extractArea(s.address ?? "");
    acc[area] = (acc[area] ?? 0) + 1;
    return acc;
  }, {});
  const topAreas = Object.entries(byArea).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // いいね総数
  const { count: totalLikes } = await db.from("store_likes").select("*", { count: "exact", head: true });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "総ユーザー数", value: users.length, sub: "registered" },
          { label: "一般ユーザー", value: generalUsers.length, sub: "users" },
          { label: "オーナー",     value: ownerUsers.length,   sub: "owners" },
          { label: "掲載店舗数",   value: storeList.length,    sub: "stores" },
          { label: "いいね総数",   value: totalLikes ?? 0,     sub: "likes" },
          { label: "総閲覧数",     value: storeList.reduce((s, r) => s + (r.views ?? 0), 0), sub: "views" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ユーザー一覧 */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">ユーザー一覧</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">メールアドレス</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ロール</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ステータス</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">登録日</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">最終ログイン</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.filter((u) => u.user_metadata?.role !== "admin").map((u) => {
                const isBanned = u.user_metadata?.status === "banned";
                return (
                <tr key={u.id} className={`hover:bg-gray-50 ${isBanned ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 text-gray-800">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      u.user_metadata?.role === "owner"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.user_metadata?.role === "owner" ? "オーナー" : "一般"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isBanned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>
                      {isBanned ? "BAN" : "有効"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("ja-JP") : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("ja-JP") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {isBanned ? (
                      <form action={unbanUser.bind(null, u.id)}>
                        <button type="submit" className="text-xs text-green-600 border border-green-200 px-2 py-1 rounded-full hover:bg-green-50 transition-colors">
                          解除
                        </button>
                      </form>
                    ) : (
                      <form action={banUser.bind(null, u.id)}>
                        <button type="submit" className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-full hover:bg-red-50 transition-colors">
                          BAN
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* いいね・閲覧ランキング */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">❤️ いいね上位10店舗</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {topLiked.map((s, i) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-orange-50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.category}</p>
                </div>
                <span className="text-sm font-bold text-orange-500">{s.likes.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">👁️ 閲覧数上位10店舗</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {topViewed.map((s, i) => (
              <Link
                key={s.id}
                href={`/stores/${s.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.category}</p>
                </div>
                <span className="text-sm font-bold text-blue-500">{s.views.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* カテゴリ別 + エリア別 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">🏷️ カテゴリ別店舗数</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <span className="flex-1 text-sm text-gray-800">{cat}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-orange-400"
                    style={{ width: `${Math.round((count / storeList.length) * 120)}px` }}
                  />
                  <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">🗺️ エリア別店舗数（上位10）</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {topAreas.map(([area, count]) => (
              <div key={area} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <span className="flex-1 text-sm text-gray-800">{area}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-blue-400"
                    style={{ width: `${Math.round((count / storeList.length) * 120)}px` }}
                  />
                  <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 全店舗一覧 */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">全店舗一覧</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">店舗名</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">カテゴリ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">エリア</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">いいね</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">閲覧数</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">オープン日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {storeList.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/stores/${s.id}`} className="font-medium text-gray-900 hover:text-orange-500 transition-colors">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.category}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-32 truncate">{s.address}</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">{s.likes}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-500">{s.views}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.open_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
