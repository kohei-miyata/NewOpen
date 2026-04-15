import type { MetadataRoute } from "next";
import { getStores } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://new-open.vercel.app";

  const stores = await getStores();
  const storeEntries: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${base}/stores/${store.id}`,
    lastModified: new Date(store.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/stores`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/ranking`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/coupons`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/for-owners`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...storeEntries,
  ];
}
