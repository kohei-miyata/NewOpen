import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import OwnerStoreForm from "@/components/OwnerStoreForm";
import { newOwnerStore } from "@/app/mypage/owner/stores/actions";

export default async function OwnerNewStorePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if ((user.user_metadata?.role as string) !== "owner") redirect("/mypage");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/mypage/owner" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← オーナー管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新規店舗登録</h1>
        <OwnerStoreForm action={newOwnerStore} submitLabel="登録する" />
      </div>
    </div>
  );
}
