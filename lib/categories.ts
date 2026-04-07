export const CATEGORIES = [
  "レストラン",
  "カフェ",
  "スイーツ",
  "居酒屋",
  "ラーメン",
  "美容院",
  "ジム",
  "ショップ",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];
