import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import PageHeader from "@/components/PageHeader";
import StoreForm from "@/components/StoreForm";

export default async function NewStorePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signup?redirect=/stores/new&role=owner");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PageHeader title="お店を登録する" description="新規オープン情報を投稿してみんなに知らせましょう" />
        <StoreForm />
      </div>
    </div>
  );
}
