import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseClient } from "@/lib/supabase";
import { banUser, unbanUser } from "./actions";
import AdminStoreTable from "@/components/AdminStoreTable";
import {
  HeartIcon,
  EyeIcon,
  TagIcon,
  MapIcon,
  UserIcon,
  TicketIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = { title: "管理者ダッシュボード" };

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const admin = createSupabaseAdminClient();
  const db = getSupabaseClient();

  // ユーザー一覧
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });

const generalUsers = users.filter((u) => u.user_metadata?.role !== "owner" && u.user_metadata?.role !== "admin");
  const ownerUsers   = users.filter((u) => u.user_metadata?.role === "owner");

  // ログイン統計（1週間以内 / 1週間以上）
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const loginWithin1Week = users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= oneWeekAgo).length;
  const loginOver1Week   = users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) < oneWeekAgo).length;
  const neverLoggedIn    = users.filter((u) => !u.last_sign_in_at).length;

  // 店舗一覧（全件）
  const { data: stores } = await db.from("stores").select("id, name, category, address, views, likes, open_date, owner_id").order("likes", { ascending: false });
  const storeList = stores ?? [];

  // オーナー別登録店舗数
  const storeCountByOwner = storeList.reduce<Record<string, number>>((acc, s) => {
    if (s.owner_id) acc[s.owner_id] = (acc[s.owner_id] ?? 0) + 1;
    return acc;
  }, {});

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

  // 審査待ち店舗数
  const { count: pendingStoreCount } = await admin
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "pending");

  // 未対応お問い合わせ数（返信履歴がない）
  const { data: allContacts } = await admin.from("contacts").select("id");
  const { data: repliedContactIds } = await admin.from("contact_replies").select("contact_id");
  const repliedIds = new Set((repliedContactIds ?? []).map((r) => r.contact_id));
  const unansweredContactCount = (allContacts ?? []).filter((c) => !repliedIds.has(c.id)).length;

  // クーポン使用状況（adminクライアントでRLS回避）
  const { data: allCoupons } = await db
    .from("coupons")
    .select("id, title, code, discount, store_id");
  const { data: allUses } = await admin
    .from("coupon_uses")
    .select("coupon_id, used_at");

  const couponUsageMap: Record<string, number> = {};
  (allUses ?? []).forEach((u) => {
    couponUsageMap[u.coupon_id] = (couponUsageMap[u.coupon_id] ?? 0) + 1;
  });
  const topCoupons = [...(allCoupons ?? [])]
    .map((c) => ({ ...c, uses: couponUsageMap[c.id] ?? 0 }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 10);
  const totalCouponUses = Object.values(couponUsageMap).reduce((s, n) => s + n, 0);

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
          { label: "クーポン使用数", value: totalCouponUses,    sub: "uses" },
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">登録店舗数</th>
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
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {u.user_metadata?.role === "owner"
                      ? (storeCountByOwner[u.id] ?? 0) > 0
                        ? <Link href={`/admin/owners?owner_id=${u.id}`} className="font-bold text-orange-500 hover:underline">{storeCountByOwner[u.id]}</Link>
                        : <span className="text-gray-400">0</span>
                      : <span className="text-gray-300">—</span>
                    }
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
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><HeartIcon className="w-5 h-5 text-orange-500" /> いいね上位10店舗</h2>
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
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><EyeIcon className="w-5 h-5 text-blue-500" /> 閲覧数上位10店舗</h2>
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

      {/* カテゴリ別 + エリア別店舗数 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><TagIcon className="w-5 h-5 text-orange-500" /> カテゴリ別店舗数</h2>
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
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><MapIcon className="w-5 h-5 text-blue-500" /> エリア別店舗数（上位10）</h2>
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

{/* エリア別閲覧数 + ユーザー属性 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><EyeIcon className="w-5 h-5 text-purple-500" /> エリア別閲覧数（上位10）</h2>
          <p className="text-xs text-gray-400 mb-2">どのエリアの店舗がよく見られているか</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {(() => {
              const viewsByArea = storeList.reduce<Record<string, number>>((acc, s) => {
                const area = extractArea(s.address ?? "");
                acc[area] = (acc[area] ?? 0) + (s.views ?? 0);
                return acc;
              }, {});
              const maxViews = Math.max(...Object.values(viewsByArea), 1);
              return Object.entries(viewsByArea)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([area, views]) => (
                  <div key={area} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <span className="flex-1 text-sm text-gray-800">{area}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-purple-400"
                        style={{ width: `${Math.round((views / maxViews) * 120)}px` }}
                      />
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{views.toLocaleString()}</span>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5"><UserIcon className="w-5 h-5 text-gray-500" /> ユーザー属性</h2>
          <div className="space-y-4">
            {/* 性別 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="px-4 pt-3 text-xs font-semibold text-gray-500">性別</p>
              {(() => {
                const genderMap: Record<string, string> = { male: "男性", female: "女性", other: "その他", prefer_not_to_say: "回答しない" };
                const counts = users.reduce<Record<string, number>>((acc, u) => {
                  const g = (u.user_metadata?.gender as string) || "未設定";
                  acc[g] = (acc[g] ?? 0) + 1;
                  return acc;
                }, {});
                const total = users.length;
                return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([g, n]) => (
                  <div key={g} className="flex items-center gap-3 px-4 py-2 border-t border-gray-50">
                    <span className="flex-1 text-sm text-gray-800">{genderMap[g] ?? g}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{Math.round(n / total * 100)}%</span>
                    <span className="text-sm font-bold text-gray-700 w-6 text-right">{n}</span>
                  </div>
                ));
              })()}
            </div>
            {/* 登録月別 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="px-4 pt-3 text-xs font-semibold text-gray-500">月別登録数（直近6ヶ月）</p>
              {(() => {
                const counts: Record<string, number> = {};
                const now = new Date();
                for (let i = 5; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  counts[`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
                }
                users.forEach((u) => {
                  if (!u.created_at) return;
                  const d = new Date(u.created_at);
                  const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                  if (key in counts) counts[key]++;
                });
                const max = Math.max(...Object.values(counts), 1);
                return Object.entries(counts).map(([month, n]) => (
                  <div key={month} className="flex items-center gap-3 px-4 py-2 border-t border-gray-50">
                    <span className="text-sm text-gray-800 w-20">{month}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-green-400" style={{ width: `${Math.round((n / max) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-6 text-right">{n}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>
      </div>

      {/* クーポン使用ランキング */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <TicketIcon className="w-5 h-5 text-orange-500" /> クーポン使用数ランキング（上位10）
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">順位</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">クーポン名</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">コード</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">割引内容</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">店舗</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">使用数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topCoupons.map((c, i) => {
                const store = storeList.find((s) => s.id === c.store_id);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-300">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.code}</td>
                    <td className="px-4 py-3">
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{c.discount}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {store ? (
                        <a href={`/stores/${store.id}`} className="hover:text-orange-500 transition-colors">{store.name}</a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-orange-500">{c.uses}</td>
                  </tr>
                );
              })}
              {topCoupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">まだクーポンの使用履歴がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ログイン統計 */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <ClockIcon className="w-5 h-5 text-blue-500" /> ログイン状況
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">1週間以内にログイン</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{loginWithin1Week.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">アクティブユーザー</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">1週間以上ログインなし</p>
            <p className="text-3xl font-extrabold text-orange-500 mt-1">{loginOver1Week.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">非アクティブユーザー</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">ログイン履歴なし</p>
            <p className="text-3xl font-extrabold text-gray-400 mt-1">{neverLoggedIn.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">未ログインユーザー</p>
          </div>
        </div>
      </section>

      {/* クイックリンク */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/admin/owners"
          className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-3 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors"
        >
          <BuildingStorefrontIcon className="w-4 h-4" />
          店舗審査管理
          {(pendingStoreCount ?? 0) > 0 && (
            <span className="ml-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingStoreCount}
            </span>
          )}
          →
        </Link>
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-3 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-colors"
        >
          <EnvelopeIcon className="w-4 h-4" />
          お問い合わせ一覧
          {unansweredContactCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unansweredContactCount}
            </span>
          )}
          →
        </Link>
      </section>

      {/* 全店舗一覧 */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">全店舗一覧</h2>
        <AdminStoreTable stores={storeList} />
      </section>

    </div>
  );
}
