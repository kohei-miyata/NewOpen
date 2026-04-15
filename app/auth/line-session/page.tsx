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

    // Supabase ブラウザクライアントが URL ハッシュのトークンを自動処理する
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login?error=" + encodeURIComponent("ログインに失敗しました"));
        return;
      }

      const user = session.user;
      const needsProfile = !user.user_metadata?.gender;
      const role = user.user_metadata?.role as string | undefined;

      if (needsProfile) {
        router.replace("/auth/complete-profile?provider=line");
      } else if (role === "owner") {
        router.replace("/mypage/owner/stores/new?welcome=1");
      } else {
        router.replace("/");
      }
    });
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
