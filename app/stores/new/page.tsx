import PageHeader from "@/components/PageHeader";
import StoreForm from "@/components/StoreForm";

export default function NewStorePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <PageHeader title="お店を登録する" description="新規オープン情報を投稿してみんなに知らせましょう" />
        <StoreForm />
      </div>
    </div>
  );
}
