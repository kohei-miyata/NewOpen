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
            <p>当サービスが個人情報を収集・利用する目的は，以下のとおりです。</p>
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
              <li>当サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>ユーザーが利用中のサービスの新機能，更新情報，キャンペーン等及び当サービスが提供する他のサービスの案内のメールを送付するため</li>
              <li>メンテナンス，重要なお知らせなど必要に応じたご連絡のため</li>
              <li>利用規約に違反したユーザーや，不正・不当な目的でサービスを利用しようとするユーザーの特定をし，ご利用をお断りするため</li>
              <li>ユーザーにご自身の登録情報の閲覧や変更，削除，ご利用状況の閲覧を行っていただくため</li>
              <li>有料サービスにおいて，ユーザーに利用料金を請求するため</li>
              <li>上記の利用目的に付随する目的</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">3. 第三者提供</h2>
            <p>当サービスは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">4. 個人情報の訂正および削除</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>ユーザーは，当サービスの保有する自己の個人情報が誤った情報である場合には，当サービスが定める手続きにより，当サービスに対して個人情報の訂正，追加または削除（以下，「訂正等」といいます。）を請求することができます。</li>
              <li>当サービスは，ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には，遅滞なく，当該個人情報の訂正等を行うものとします。</li>
              <li>当サービスは，前項の規定に基づき訂正等を行った場合，または訂正等を行わない旨の決定をしたときは遅滞なく，これをユーザーに通知します。</li>

            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">5. Cookie・ローカルストレージ</h2>
            <p>当サービスは認証セッションの維持にCookieを使用します。また最近閲覧した店舗の表示にブラウザのlocalStorageを使用します。これらはサービス提供に必要なもので、第三者追跡目的では使用しません。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">6. ポリシーの変更</h2>
            <p>本ポリシーは必要に応じて変更することがあります。変更後は本ページに掲載した時点で効力を生じます。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">7. 運営者情報</h2>
            <ul className="space-y-1">
              <li>氏名：宮田浩平</li>
              <li>事業形態：個人事業主</li>
            </ul>
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
