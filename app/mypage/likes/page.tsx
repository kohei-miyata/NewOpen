import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLikedStores, getLikeFolders } from "@/lib/db";
import StoreCard from "@/components/StoreCard";
import LikeFolderManager, { MoveToFolderButton } from "@/components/LikeFolderManager";
import { HeartIcon } from "@heroicons/react/24/outline";

interface Props {
  searchParams: Promise<{ folder?: string }>;
}

export default async function LikesPage({ searchParams }: Props) {
  const { folder: folderId } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [allLikes, folders] = await Promise.all([
    getLikedStores(user.id),
    getLikeFolders(user.id),
  ]);

  const filteredLikes = folderId === "none"
    ? allLikes.filter((s) => !s.folderId)
    : folderId
    ? allLikes.filter((s) => s.folderId === folderId)
    : allLikes;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/mypage" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← マイページ</Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-orange-400" /> いいねしたお店
            </h1>
          </div>
          <span className="text-sm text-gray-400">{allLikes.length} 件</span>
        </div>

        {/* フォルダ管理 */}
        <LikeFolderManager
          folders={folders}
          likes={allLikes}
          currentFolderId={folderId}
        />

        {/* 店舗一覧 */}
        {filteredLikes.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            {folderId ? "このフォルダにはまだお店がありません" : "まだいいねしたお店はありません"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLikes.map((store) => (
              <div key={store.id}>
                <StoreCard store={store} />
                <div className="mt-1 px-1">
                  <MoveToFolderButton
                    storeId={store.id}
                    folders={folders}
                    currentFolderId={store.folderId}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
