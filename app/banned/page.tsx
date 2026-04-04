import Link from "next/link";
import { logout } from "@/app/auth/actions";

export default function BannedPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">アカウントが停止されています</h1>
        <p className="text-sm text-gray-500 mb-6">
          このアカウントは利用規約違反により停止されました。
          心当たりがある場合は
          <Link href="/contact" className="text-orange-500 hover:underline mx-1">お問い合わせ</Link>
          ください。
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-full hover:border-gray-400 transition-colors"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
