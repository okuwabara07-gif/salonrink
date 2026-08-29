import type { Metadata } from 'next';
import LpPageFinal from '@/features/lp-v2-final/LpPageFinal';

const siteUrl = 'https://salonrink.com';

export const metadata: Metadata = {
  title: 'SalonRink | 美容サロンの予約・カルテ管理を月 ¥1,980 から',
  description:
    '紙カルテとホットペッパーの二重管理をやめませんか。小規模サロンのための LINE 予約・カルテ管理。月額 ¥1,980・初期費用 0 円・14 日間無料。',
  keywords: [
    'サロン管理',
    'LINE予約',
    '予約システム',
    '顧客管理',
    '美容サロン',
    'カルテ管理',
    'SaaS',
  ],
  authors: [{ name: 'AOKAE合同会社' }],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: 'SalonRink | 美容サロンの予約・カルテ管理を月 ¥1,980 から',
    description:
      '紙カルテとホットペッパーの二重管理をやめませんか。小規模サロンのための LINE 予約・カルテ管理。14 日間無料で試せます。',
    url: siteUrl,
    siteName: 'SalonRink',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'SalonRink',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalonRink | 美容サロンの予約・カルテ管理を月 ¥1,980 から',
    description:
      '紙カルテとホットペッパーの二重管理をやめませんか。LINE 予約・カルテ管理システム。14 日間無料。',
    creator: '@salonrink_jp',
    images: [`${siteUrl}/og-image.jpg`],
  },
};

export default function HomePage() {
  return <LpPageFinal />;
}
