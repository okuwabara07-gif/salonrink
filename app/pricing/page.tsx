import type { Metadata } from 'next'
import { PricingClient } from './pricing-client'

export const metadata: Metadata = {
  title: '料金プラン | SalonRink',
  description: 'SalonRink の料金プラン詳細。フリーランス¥980/月・スタンダード¥2,480/月・プロ¥3,980/月。初期費用¥3,000（SNSシェアで無料化可能）。全プラン14日間無料トライアル付き。',
  alternates: { canonical: 'https://salonrink.com/pricing' },
  openGraph: {
    title: '料金プラン | SalonRink',
    description: 'フリーランス¥980/月から始められる、美容サロン向けLINE予約管理SaaS。初期費用はSNSシェアで無料化。',
    url: 'https://salonrink.com/pricing',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
