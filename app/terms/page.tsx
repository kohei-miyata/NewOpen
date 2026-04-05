import type { Metadata } from "next";
import TermsContent from "@/components/TermsContent";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-xs text-gray-400 mb-8">最終更新日：2026年4月4日</p>
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <TermsContent />
        </div>
      </div>
    </div>
  );
}
