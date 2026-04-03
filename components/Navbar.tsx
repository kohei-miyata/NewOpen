import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logout } from "@/app/auth/actions";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/stores", label: "新規オープン" },
  { href: "/ranking", label: "ランキング" },
  { href: "/coupons", label: "クーポン" },
];

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-500 tracking-tight">
          NewOpen
        </Link>

        <div className="flex items-center gap-4">
          <ul className="hidden sm:flex gap-6 text-sm font-medium text-gray-600">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-orange-500 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[140px]">
                {user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-xs text-gray-600 hover:text-orange-500 transition-colors font-medium"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors font-medium"
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
