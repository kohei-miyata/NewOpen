import Link from "next/link";
import { KeyIcon, TrashIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">設定</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

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