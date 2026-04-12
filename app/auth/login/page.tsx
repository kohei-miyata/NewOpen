import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-orange-500">NewOpen</Link>
          <p className="text-sm text-gray-500 mt-1">ログイン</p>
        </div>

        <LoginForm serverError={sp.error} next={sp.next} />

        <p className="text-center text-sm text-gray-500 mt-4">
          アカウントをお持ちでない方は{" "}
          <Link href="/auth/signup" className="text-orange-500 hover:underline font-medium">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
