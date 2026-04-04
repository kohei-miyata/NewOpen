import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://new-open.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/auth/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
