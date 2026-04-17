"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// ログインが必要なパス（前方一致）
const PROTECTED_PATHS = ["/mypage", "/admin"];

export default function AuthSessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
        if (isProtected) {
          router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
