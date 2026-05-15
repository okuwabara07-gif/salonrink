import type { Metadata } from 'next';
import LpPage from '@/features/lp-concierge/LpPage';

export const metadata: Metadata = {
  title: 'SalonRink Concierge — サロンに、専属コンシェルジュを。',
  description:
    'お客様一人ひとりの好み・履歴・前回の悩みまで覚えている、AIコンシェルジュ。LINE完結のサロン管理SaaS。月¥1,980から、14日間無料。本日発売開始。',
  keywords: [
    'サロンコンシェルジュ',
    'SalonRink Concierge',
    'AIカルテ',
    'LINE予約',
    '美容サロン',
    'サロン管理',
    'SaaS',
    'AOKAE合同会社',
  ],
  authors: [{ name: 'AOKAE合同会社' }],
  openGraph: {
    title: 'SalonRink Concierge — サロンに、専属コンシェルジュを。',
    description:
      'あなたの好み、前回の悩み、お気に入りの担当さん。覚えていてくれる、その嬉しさを。LINE完結のサロン管理SaaS、月¥1,980から。',
    url: 'https://salonrink.com',
    siteName: 'SalonRink Concierge',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalonRink Concierge | サロンに、専属コンシェルジュを。',
    description:
      'お客様一人ひとりの「いつも」を記憶する、AIコンシェルジュ。月¥1,980から、14日間無料。',
    creator: '@salonrink_jp',
  },
};

export default function HomePage() {
  return <LpPage />;
}
