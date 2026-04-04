export type Category =
  | "レストラン"
  | "カフェ"
  | "スイーツ"
  | "居酒屋"
  | "ラーメン"
  | "美容院"
  | "ジム"
  | "ショップ"
  | "その他";

export interface SnsLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  line?: string;
}

export type StoreStatus = "active" | "closed" | "temporarily_closed";

export interface Store {
  id: string;
  name: string;
  category: Category;
  address: string;
  openDate: string;
  description: string;
  imageUrl: string;
  views: number;
  likes: number;
  tags: string[];
  lat: number | null;
  lng: number | null;
  hoursText: string | null;
  photos: string[];
  snsLinks: SnsLinks | null;
  twitterPostUrl: string | null;
  instagramPostUrl: string | null;
  tiktokPostUrl: string | null;
  status: StoreStatus;
}

export interface Coupon {
  id: string;
  storeId: string;
  storeName: string;
  storeCategory: Category;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  code: string;
  imageUrl: string;
}
