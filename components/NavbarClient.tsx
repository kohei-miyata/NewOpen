"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/auth/actions";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/stores", label: "新規オープン" },
  { href: "/ranking", label: "ランキング" },
  { href: "/coupons", label: "クーポン" },
  { href: "/for-owners", label: "掲載する" },
];

interface Props {
  user: { email?: string } | null;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function NavbarClient({ user, isOwner, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="NewOpen" width={140} height={32} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <ul className="flex gap-6 text-sm font-medium text-gray-600">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-orange-500 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/mypage" className="text-xs text-gray-600 hover:text-orange-500 transition-colors font-medium">
                マイページ
              </Link>
              {isOwner && (
                <Link
                  href="/mypage/owner"
                  className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors font-medium"
                >
                  オーナー管理
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors font-medium"
                >
                  管理者
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors">
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-xs text-gray-600 hover:text-orange-500 transition-colors font-medium">
                ログイン
              </Link>
              <Link href="/auth/signup" className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition-colors font-medium">
                新規登録
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: auth shortcut + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {!user && (
            <Link href="/auth/login" className="text-xs text-orange-500 font-medium">
              ログイン
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="メニュー"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors border-b border-gray-50 last:border-0"
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link href="/mypage" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors border-b border-gray-50">
                マイページ
              </Link>
              {isOwner && (
                <Link href="/mypage/owner" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors border-b border-gray-50">
                  オーナー管理
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors border-b border-gray-50">
                  管理者ダッシュボード
                </Link>
              )}
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">{user.email}</p>
                <form action={logout}>
                  <button type="submit" className="w-full text-sm text-gray-600 border border-gray-300 py-2 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-colors">
                    ログアウト
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link href="/auth/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm border border-gray-300 text-gray-700 py-2 rounded-lg hover:border-orange-400 hover:text-orange-500 transition-colors">
                ログイン
              </Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)} className="flex-1 text-center text-sm bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                新規登録
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
