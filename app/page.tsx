import type { Metadata } from 'next';
import AppShell from '@/features/lp/v3/AppShell';

export const metadata: Metadata = {
  title: 'SalonRink — いつもの、その先へ。',
  description: 'LINE 完結のサロン管理 SaaS。AI カルテで、お客様の「いつも」をスタッフ全員で。月額 ¥1,980 から、14 日間無料で試せる。',
  openGraph: {
    title: 'SalonRink — いつもの、その先へ。',
    description: 'LINE 完結のサロン管理 SaaS。AI カルテで、お客様の「いつも」をスタッフ全員で。',
    url: 'https://salonrink.com',
    siteName: 'SalonRink',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function HomePage() {
  return <AppShell />;
}
