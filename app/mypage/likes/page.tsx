import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLikedStores } from "@/lib/db";
import LikesSearchList from "@/components/LikesSearchList";
import { HeartIcon } from "@heroicons/react/24/solid";

export default async function LikesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const allLikes = await getLikedStores(user.id);
  const likedStoreIds = new Set(allLikes.map((s) => s.id));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/mypage" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← マイページ</Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-orange-400" /> 応援しているお店
            </h1>
          </div>
          <span className="text-sm text-gray-400">{allLikes.length} 件</span>
        </div>

        <LikesSearchList
          stores={allLikes}
          isLoggedIn={true}
          likedStoreIds={likedStoreIds}
        />
      </div>
    </div>
  );
}
