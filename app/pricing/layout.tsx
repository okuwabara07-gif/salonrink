import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '料金プラン | SalonRink',
  description: 'SalonRink の料金プラン。Light ¥1,980/月、Standard ¥2,980/月、Premium ¥4,580/月。すべてのプランに14日間無料期間付き。',
  alternates: { canonical: 'https://salonrink.com/pricing' },
  openGraph: {
    title: '料金プラン | SalonRink',
    description: 'Light ¥1,980/月から始められる、美容サロン向けAIカルテ SaaS。',
    url: 'https://salonrink.com/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
