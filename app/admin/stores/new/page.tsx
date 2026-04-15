import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import OwnerStoreForm from "@/components/OwnerStoreForm";
import { newAdminStore } from "@/app/admin/actions";

export const metadata: Metadata = { title: "店舗登録（代行）| 管理者" };

export default async function AdminNewStorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/admin/owners" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← 店舗審査管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">店舗登録（代行）</h1>
        <p className="text-sm text-gray-500 mb-6">
          オーナーに代わって店舗情報を登録します。登録後、審査管理画面からオーナーを紐付けてください。
        </p>
        <OwnerStoreForm action={newAdminStore} submitLabel="登録する" serverError={error} />
      </div>
    </div>
  );
}
