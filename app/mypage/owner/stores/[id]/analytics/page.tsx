import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getStoreById } from "@/lib/db";
import {
  HeartIcon,
  EyeIcon,
  TicketIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = { title: "アナリティクス | オーナー管理" };

interface Props {
  params: Promise<{ id: string }>;
}

function todayJST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}

function daysAgoJST(days: number): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000 - days * 86400000).toISOString().split("T")[0];
}

export default async function StoreAnalyticsPage({ params }: Props) {
  const { id: storeId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = user.user_metadata?.role as string;
  if (role !== "owner") redirect("/mypage");

  const store = await getStoreById(storeId);
  if (!store) redirect("/mypage/owner");

  // オーナー所有確認（admin経由で owner_id 取得）
  const admin = createSupabaseAdminClient();
  const { data: storeRow } = await admin
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single();
  if (!storeRow || storeRow.owner_id !== user.id) redirect("/mypage/owner");

  // 過去30日の閲覧数推移
  const today = todayJST();
  const thirtyDaysAgo = daysAgoJST(29);
  const { data: viewHistory } = await admin
    .from("store_view_history")
    .select("date, count")
    .eq("store_id", storeId)
    .gte("date", thirtyDaysAgo)
    .lte("date", today)
    .order("date", { ascending: true });

  // 30日分の日付ラベルと閲覧数マップを作る
  const viewMap: Record<string, number> = {};
  (viewHistory ?? []).forEach((row) => { viewMap[row.date] = row.count; });

  const days30: { date: string; label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = daysAgoJST(i);
    const dt = new Date(d);
    const label = `${dt.getMonth() + 1}/${dt.getDate()}`;
    days30.push({ date: d, label, count: viewMap[d] ?? 0 });
  }

  const viewsTotal30 = days30.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...days30.map((d) => d.count), 1);

  // クーポン使用数
  const { data: coupons } = await admin
    .from("coupons")
    .select("id")
    .eq("store_id", storeId);
  const couponIds = (coupons ?? []).map((c) => c.id);

  let totalCouponUses = 0;
  if (couponIds.length > 0) {
    const { count } = await admin
      .from("coupon_uses")
      .select("*", { count: "exact", head: true })
      .in("coupon_id", couponIds);
    totalCouponUses = count ?? 0;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/mypage/owner" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
              ← オーナー管理
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-orange-500" />
              アナリティクス
            </h1>
            <p className="text-sm text-gray-500">{store.name}</p>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="flex justify-center mb-1">
              <EyeIcon className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{store.views.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">累計閲覧数</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="flex justify-center mb-1">
              <HeartIcon className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{store.likes.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">いいね数</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="flex justify-center mb-1">
              <TicketIcon className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{totalCouponUses.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">クーポン使用数</p>
          </div>
        </div>

        {/* 30日間の閲覧数推移 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">過去30日間の閲覧数推移</h2>
            <span className="text-xs text-gray-500">
              合計 <span className="font-bold text-blue-500">{viewsTotal30.toLocaleString()}</span> 回
            </span>
          </div>

          {viewsTotal30 === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">まだ閲覧データがありません</p>
          ) : (
            <>
              {/* バーチャート */}
              <div className="flex items-end gap-0.5 h-32 mb-2">
                {days30.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className="w-full bg-blue-200 group-hover:bg-blue-400 rounded-t transition-colors"
                      style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "2px" : "0" }}
                    />
                    {/* ツールチップ */}
                    {d.count > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {d.count}回
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* X軸ラベル（7日おき） */}
              <div className="flex items-end gap-0.5">
                {days30.map((d, i) => (
                  <div key={d.date} className="flex-1 text-center">
                    {(i === 0 || i === 7 || i === 14 || i === 21 || i === 29) && (
                      <span className="text-[9px] text-gray-400">{d.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* クーポン管理へのリンク */}
        <div className="text-center">
          <Link
            href={`/mypage/owner/stores/${storeId}/coupons`}
            className="text-sm text-orange-500 hover:underline"
          >
            クーポン管理を見る →
          </Link>
        </div>

      </div>
    </div>
  );
}
