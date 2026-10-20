import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '料金プラン | SalonRink',
  description: 'SalonRink の料金プラン。LINE会員証とポイントのPASSは0円。自動化 月1,500円、通知 月800円、AI 月800円を必要なときに追加。初期費用0円・税込。',
  alternates: { canonical: 'https://salonrink.com/pricing' },
  openGraph: {
    title: '料金プラン | SalonRink',
    description: '紙のポイントカードを、無料でLINE会員証に。PASS 0円から始められます。',
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
