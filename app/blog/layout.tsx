import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ブログ | SalonRink',
  description: '美容サロン経営、LINE予約システム、顧客管理に関する情報をお届けします。売上向上のコツ、業務効率化のヒント、トレンド情報など。',
  alternates: { canonical: 'https://salonrink.com/blog' },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
