import type { Metadata } from 'next';
import LpPage from '@/features/lp-concierge/LpPage';

export const metadata: Metadata = {
  title: 'SalonRink Concierge — 再来店率と業務時間を、LINEひとつで変える。',
  description:
    'いまのLINE公式アカウントに、AIカルテと顧客記憶を追加するだけ。新しいアプリ不要、最短5分で開始。月¥1,980から、14日間無料。',
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
    title: 'SalonRink Concierge — 再来店率と業務時間を、LINEひとつで変える。',
    description:
      'いまのLINE公式アカウントに、AIカルテと顧客記憶を追加。新アプリ不要、最短5分で開始。月¥1,980から、14日間無料。',
    url: 'https://salonrink.com',
    siteName: 'SalonRink Concierge',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SalonRink Concierge | 再来店率と業務時間を、LINEひとつで変える。',
    description:
      'LINE公式アカウントに追加するだけで、AIカルテと顧客記憶が動作。新アプリ不要、5分で開始。月¥1,980から。',
    creator: '@salonrink_jp',
  },
};

export default function HomePage() {
  return <LpPage />;
}
