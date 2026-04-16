import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStoreById } from "@/lib/db";
import OwnerStoreForm from "@/components/OwnerStoreForm";
import { editAdminStore } from "@/app/admin/actions";

export const metadata: Metadata = { title: "店舗編集 | 管理者" };

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminEditStorePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");

  const store = await getStoreById(id);
  if (!store) notFound();

  const action = editAdminStore.bind(null, id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/admin/owners" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← 店舗審査管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">店舗情報を編集（管理者）</h1>
        <OwnerStoreForm action={action} defaultValues={store} submitLabel="保存する" serverError={error} isEdit />
      </div>
    </div>
  );
}
