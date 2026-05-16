import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "Wendo 文渡 — 跨境外贸网站本地化与文化适配诊断平台",
  description:
    "Wendo 文渡帮助中国出海企业发现并修复英文官网中的文化适配问题。AI 驱动的跨文化商务智能诊断，让品牌温暖触达全球用户。",
  keywords: ["跨境外贸", "网站本地化", "文化适配", "出海企业", "英文网站诊断", "B2B", "品牌出海"],
  authors: [{ name: "Wendo 文渡" }],
  metadataBase: new URL("https://rayysummers.github.io"),
  openGraph: {
    title: "Wendo 文渡 — 跨境外贸网站本地化与文化适配诊断平台",
    description: "帮助中国出海企业发现并修复英文官网中的文化适配问题。AI 驱动的跨文化商务智能诊断。",
    type: "website",
    locale: "zh_CN",
    siteName: "Wendo 文渡",
    images: [{
      url: "/wendo_logo_vectorized.svg",
      width: 400,
      height: 400,
      alt: "Wendo 文渡 Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wendo 文渡 — 跨境外贸网站本地化与文化适配诊断平台",
    description: "帮助中国出海企业发现并修复英文官网中的文化适配问题。",
    images: ["/wendo_logo_vectorized.svg"],
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
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
