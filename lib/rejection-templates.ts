export const REJECTION_TEMPLATES = [
  {
    id: "adult",
    label: "風俗・成人向け店舗",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      誠に恐れ入りますが、ご登録いただいた店舗情報を審査した結果、<br>
      <strong>風俗・成人向けに該当する</strong>との判断により、掲載をお断りさせていただきます。</p>
      <p>ご了承のほど、よろしくお願いいたします。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "no_physical_store",
    label: "実店舗ではない",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      誠に恐れ入りますが、ご登録いただいた情報を審査した結果、<br>
      <strong>実店舗として確認できなかった</strong>ため、掲載をお断りさせていただきます。</p>
      <p>実店舗をお持ちの場合は、住所・写真等を正確にご入力の上、再度ご登録ください。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "insufficient_info",
    label: "情報不足",
    subject: "【NEW OPEN】掲載審査の結果について（情報の追加をお願いします）",
    body: (storeName: string) => `
      <p>${storeName} 担当者様</p>
      <p>この度はNEW OPENへのご登録ありがとうございます。<br>
      ご登録いただいた情報を審査した結果、<strong>掲載に必要な情報が不足</strong>しているため、<br>
      現時点では掲載をお断りさせていただきます。</p>
      <p>店舗写真・住所・説明文等を充実させた上で、再度ご登録いただけますと幸いです。</p>
      <hr>
      <p style="font-size:12px;color:#888;">NEW OPEN — あなたの街の新規オープン情報</p>
    `,
  },
  {
    id: "other",
    label: "その他（カスタムメッセージ）",
    subject: "【NEW OPEN】掲載審査の結果について",
    body: (_storeName: string) => ``,
  },
];
