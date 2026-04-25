import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サロン登録 | SalonRink - LINE予約自動化SaaS',
  description: 'SalonRink（サロメ）への登録フローです。基本情報とプラン選択後、14日間の無料トライアルを開始できます。',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
