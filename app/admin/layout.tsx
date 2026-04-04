import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gray-900 text-white px-4 py-2 text-xs text-center font-medium tracking-wide">
        管理者ダッシュボード
      </div>
      {children}
    </div>
  );
}
