"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LineSessionPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    const proceed = (user: { user_metadata?: Record<string, unknown> }) => {
      const needsProfile = !user.user_metadata?.gender;
      const role = user.user_metadata?.role as string | undefined;
      if (needsProfile) {
        router.replace("/auth/complete-profile?provider=line");
      } else if (role === "owner") {
        router.replace("/mypage/owner/stores/new?welcome=1");
      } else {
        router.replace("/");
      }
    };

    if (accessToken && refreshToken) {
      // ハッシュトークンを明示的にセッションに変換
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data: { session }, error }) => {
          if (error || !session) {
            router.replace("/auth/login?error=" + encodeURIComponent("ログインに失敗しました"));
            return;
          }
          window.history.replaceState(null, "", window.location.pathname);
          proceed(session.user);
        });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.replace("/auth/login?error=" + encodeURIComponent("ログインに失敗しました"));
          return;
        }
        proceed(session.user);
      });
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <span className="inline-block w-5 h-5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-sm">ログイン中...</span>
      </div>
    </div>
  );
}
