import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SalonRink の全機能 | いつもの、その先へ',
  description: 'AIカルテ、予約管理、顧客管理、LINE連携など、SalonRink の全機能を紹介。',
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
