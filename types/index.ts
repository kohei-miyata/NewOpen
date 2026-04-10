import type { Category } from "@/lib/categories";
export type { Category };

export interface SnsLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  line?: string;
  google_maps?: string;
}

export type StoreStatus = "active" | "closed" | "temporarily_closed";
export type ApprovalStatus = "pending" | "approved" | "rejected";

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
  approvalStatus: ApprovalStatus;
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
  isActive: boolean;
  combinable: boolean;
}
