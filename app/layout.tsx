import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://salonrink.com'

export const metadata: Metadata = {
  title: "SALOMÉ（サロメ）| LINEで予約自動化するサロン経営SaaS",
  description: "美容サロンのLINE予約・顧客管理・リマインド通知を自動化。月額¥980から。ホットペッパー依存から脱却。",
  keywords: ["サロン管理", "LINE予約", "予約システム", "顧客管理", "美容サロン", "SaaS"],
  authors: [{ name: "AOKAE合同会社" }],
  verification: {
    google: "LhDE3K0d8OvwCM_wvoTnUiVQ9pj9r8H7abwiz7ShlV4",
  },
  openGraph: {
    title: "SALOMÉ（サロメ）| LINEで予約自動化するサロン経営SaaS",
    description: "美容サロンのLINE予約・顧客管理・リマインド通知を自動化。月額¥980から。ホットペッパー依存から脱却。",
    url: siteUrl,
    siteName: "SALOMÉ",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SALOMÉ - サロン経営SaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SALOMÉ（サロメ）| LINEで予約自動化するサロン経営SaaS",
    description: "美容サロンのLINE予約・顧客管理・リマインド通知を自動化。月額¥980から。",
    creator: "@salonrink_jp",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3460729726810386"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
