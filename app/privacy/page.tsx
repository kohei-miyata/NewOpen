import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-xs text-gray-400 mb-8">最終更新日：2026年4月4日</p>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="font-bold text-gray-900 mb-2">1. 収集する情報</h2>
            <p>当サービスは以下の情報を収集します。</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>メールアドレス（アカウント登録時）</li>
              <li>ロール情報（一般ユーザー / オーナー）</li>
              <li>店舗情報（オーナーが登録した情報）</li>
              <li>アクセスログ（IPアドレス、閲覧履歴等）</li>
              <li>お問い合わせ内容（氏名・メールアドレス・法人名等）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">2. 情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>サービスの提供・運営・改善</li>
              <li>ユーザーへの通知・サポート対応</li>
              <li>不正利用の防止・セキュリティ確保</li>
              <li>エリアに基づく店舗情報の表示（IPジオロケーション）</li>
              <li>アクセス解析（Vercel Analytics）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. 第三者提供</h2>
            <p>当サービスは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. 利用するサービス・技術</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong>：データベース・認証・ストレージ（EU/US）</li>
              <li><strong>Vercel</strong>：ホスティング・アクセス解析</li>
              <li><strong>ip-api.com</strong>：IPアドレスによる位置情報取得（エリア絞り込み）</li>
              <li><strong>Google Maps</strong>：地図表示</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">5. Cookie・ローカルストレージ</h2>
            <p>当サービスは認証セッションの維持にCookieを使用します。また最近閲覧した店舗の表示にブラウザのlocalStorageを使用します。これらはサービス提供に必要なもので、第三者追跡目的では使用しません。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. 個人情報の開示・削除</h2>
            <p>ユーザーは自身のアカウント情報の開示・訂正・削除を求めることができます。お問い合わせフォームよりご連絡ください。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">7. ポリシーの変更</h2>
            <p>本ポリシーは必要に応じて変更することがあります。変更後は本ページに掲載した時点で効力を生じます。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">8. お問い合わせ</h2>
            <p>個人情報に関するお問い合わせは<a href="/contact" className="text-orange-500 hover:underline">お問い合わせフォーム</a>よりご連絡ください。</p>
          </section>

        </div>
      </div>
    </div>
  );
}
