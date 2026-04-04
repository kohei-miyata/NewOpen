import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://new-open.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NewOpen | あなたの街の新規オープン情報",
    template: "%s | NewOpen",
  },
  description: "新規オープン店舗をいち早くチェック。レストラン・カフェ・スイーツ・美容院など、あなたの街の最新オープン情報をお届けします。",
  keywords: ["新規オープン", "新店", "グルメ", "カフェ", "レストラン", "美容院", "新しいお店"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "NewOpen",
    type: "website",
    locale: "ja_JP",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
