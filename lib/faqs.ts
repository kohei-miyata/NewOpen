export interface Faq {
  q: string;
  a: string;
  tags: ("general" | "owner" | "contact")[];
}

export const ALL_FAQS: Faq[] = [
  {
    q: "掲載は本当に無料ですか？",
    a: "はい、完全無料です。掲載・編集・クーポン発行・SNS埋め込みもすべて0円です。",
    tags: ["general", "owner", "contact"],
  },
  {
    q: "オープン前から掲載できますか？",
    a: "はい、オープン30日前から「まもなくオープン」として掲載できます。事前に話題を作りましょう。",
    tags: ["general", "owner", "contact"],
  },
  {
    q: "掲載内容はいつでも変更できますか？",
    a: "オーナーアカウントのマイページからいつでも編集・更新できます。",
    tags: ["general", "owner", "contact"],
  },
  {
    q: "掲載期間はありますか？",
    a: "オープン日から3年間、店舗情報が一般公開されます。3年経過後は自動的に一般公開が終了しますが、マイページからは引き続き確認・管理できます。",
    tags: ["general", "owner", "contact"],
  },
  {
    q: "希望するカテゴリがない場合はどうすればいいですか？",
    a: "お問い合わせよりご連絡ください。ご要望を参考に随時追加を検討いたします。",
    tags: ["general", "owner", "contact"],
  },
  {
    q: "どのSNSに対応していますか？",
    a: "X（Twitter）・Instagram・TikTok・LINE公式アカウント・公式サイトのリンクと、X/Instagram/TikTokの投稿埋め込みに対応しています。",
    tags: ["general"],
  },
  {
    q: "会員登録しないと使えませんか？",
    a: "店舗情報の閲覧は会員登録不要です。クーポンの使用・いいね機能をご利用の場合は無料会員登録が必要です。",
    tags: ["general"],
  },
  {
    q: "掲載されない店舗はありますか？",
    a: "風俗・アダルト関連など、公序良俗に反する店舗は掲載をお断りしています。詳しくは利用規約をご確認ください。",
    tags: ["general"],
  },
  {
    q: "掲載審査はありますか？",
    a: "はい、店舗情報をご登録いただいた後、運営が内容を確認してから公開されます。審査には通常3営業日以内かかります。承認・否認の結果は登録メールアドレスにお送りします。",
    tags: ["owner", "contact"],
  },
  {
    q: "複数店舗の登録は可能ですか？",
    a: "はい、1アカウントで複数店舗を登録・管理できます。",
    tags: ["owner", "contact"],
  },
];

export const GENERAL_FAQS = ALL_FAQS.filter((f) => f.tags.includes("general"));
export const OWNER_FAQS   = ALL_FAQS.filter((f) => f.tags.includes("owner"));
export const CONTACT_FAQS = ALL_FAQS.filter((f) => f.tags.includes("contact"));
