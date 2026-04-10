import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import OwnerStoreForm from "@/components/OwnerStoreForm";
import { newOwnerStore } from "@/app/mypage/owner/stores/actions";

export default async function OwnerNewStorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; welcome?: string }>;
}) {
  const { error, welcome } = await searchParams;
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
        {welcome && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 mb-6 space-y-3">
            <p className="text-sm font-bold text-orange-800">オーナー登録が完了しました！さっそく店舗情報を登録しましょう。</p>
            <ul className="text-xs text-orange-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🔍</span>
                <span><span className="font-semibold">審査について</span> — 登録後、管理者が内容を確認してから公開されます。審査完了までしばらくお待ちください。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📅</span>
                <span><span className="font-semibold">掲載期間</span> — オープン日から3年間掲載されます。期間終了後は自動的に非公開になります。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📸</span>
                <span><span className="font-semibold">写真・SNS</span> — 写真やInstagram・Xなどのリンクを充実させると、ユーザーへの訴求力が高まります。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🎟️</span>
                <span><span className="font-semibold">クーポン発行</span> — 店舗登録後にオープン記念クーポンを作成・管理できます。クーポンコードの使用状況もリアルタイムで確認できます。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📊</span>
                <span><span className="font-semibold">アナリティクス</span> — 閲覧数・いいね数・クーポン使用数の推移をオーナー管理画面から確認できます。</span>
              </li>
            </ul>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新規店舗登録</h1>
        <OwnerStoreForm action={newOwnerStore} submitLabel="登録する" serverError={error} />
      </div>
    </div>
  );
}
