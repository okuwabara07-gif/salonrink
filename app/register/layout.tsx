import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サロン登録 | SalonRink - LINE予約自動化SaaS',
  description: 'SalonRink（サロンリンク）への登録フローです。メールアドレスとサロン名だけで、今日からLINE会員証が使えます。',
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
