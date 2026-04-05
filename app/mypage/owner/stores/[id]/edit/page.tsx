import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStoreById } from "@/lib/db";
import OwnerStoreForm from "@/components/OwnerStoreForm";
import { editStore } from "@/app/mypage/owner/stores/actions";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditStorePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if ((user.user_metadata?.role as string) !== "owner") redirect("/mypage");

  const store = await getStoreById(id);
  if (!store) notFound();

  // オープンから3年経過した店舗は編集不可
  const openMs = new Date(store.openDate).getTime();
  const threeYearsMs = 3 * 365.25 * 24 * 60 * 60 * 1000;
  if (Date.now() - openMs >= threeYearsMs) redirect("/mypage/owner");

  const action = editStore.bind(null, id);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/mypage/owner" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← オーナー管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">店舗情報を編集</h1>
        <OwnerStoreForm action={action} defaultValues={store} submitLabel="保存する" serverError={error} isEdit />
      </div>
    </div>
  );
}
