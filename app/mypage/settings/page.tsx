import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyIcon, TrashIcon, ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EmailNotificationToggle from "@/components/EmailNotificationToggle";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const displayName = (user.user_metadata?.display_name as string) || null;
  const emailNotifications = (user.user_metadata?.email_notifications as boolean) ?? false;

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">設定</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* お名前変更 */}
        <Link
          href="/mypage/change-name"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 border-b"
        >
          <UserIcon className="w-5 h-5 text-gray-400" />
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium">お名前</span>
            {displayName && <span className="block text-xs text-gray-400">{displayName}</span>}
          </div>
          <ChevronRightIcon className="w-4 h-4 text-gray-300" />
        </Link>

        {/* メール通知 */}
        <EmailNotificationToggle defaultEnabled={emailNotifications} />

        {/* パスワード変更 */}
        <Link
          href="/mypage/change-password"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 border-b"
        >
          <KeyIcon className="w-5 h-5 text-gray-400" />
          <span className="flex-1 text-sm font-medium">パスワード変更</span>
          <ChevronRightIcon className="w-4 h-4 text-gray-300" />
        </Link>

        {/* 退会 */}
        <Link
          href="/mypage/withdraw"
          className="flex items-center gap-3 px-5 py-4 hover:bg-red-50"
        >
          <TrashIcon className="w-5 h-5 text-red-400" />
          <span className="flex-1 text-sm font-medium text-red-500">退会する</span>
          <ChevronRightIcon className="w-4 h-4 text-gray-300" />
        </Link>

      </div>
    </div>
  );
}
