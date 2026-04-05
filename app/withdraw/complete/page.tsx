import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function WithdrawCompletePage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircleIcon className="w-14 h-14 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">退会が完了しました</h1>
        <p className="text-sm text-gray-500">ご利用いただきありがとうございました。</p>
        <Link
          href="/"
          className="inline-block mt-4 bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-colors text-sm"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
