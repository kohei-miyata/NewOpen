import Link from "next/link";
import SignupForm from "@/components/SignupForm";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; role?: string }>;
}) {
  const sp = await searchParams;

  if (sp.success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 flex justify-center"><EnvelopeIcon className="w-12 h-12 text-orange-500" /></div>
          <h2 className="text-lg font-bold text-gray-900">確認メールを送信しました</h2>
          <p className="text-sm text-gray-500 mt-2">メールのリンクをクリックして登録を完了してください。</p>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-left">
            <p className="text-xs font-semibold text-amber-800 mb-1">ご注意</p>
            <p className="text-xs text-amber-700">
              メールのリンクは、<span className="font-bold">このページを開いたブラウザと同じブラウザ</span>で開いてください。
              別のブラウザやスマートフォンで開くとログインできない場合があります。
            </p>
          </div>
          <Link href="/auth/login" className="inline-block mt-6 text-orange-500 hover:underline text-sm">
            ログインページへ →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-orange-500">NewOpen</Link>
          <p className="text-sm text-gray-500 mt-1">新規登録</p>
        </div>

        <SignupForm serverError={sp.error} defaultRole={sp.role === "owner" ? "owner" : "user"} />

        <p className="text-center text-sm text-gray-500 mt-4">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="text-orange-500 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
