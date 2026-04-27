import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import TabBar from '@/components/TabBar'

export const metadata: Metadata = {
  title: 'ダッシュボード | SalonRink',
  description: 'サロン管理ダッシュボード',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // サロン情報取得（owner_user_id で検索）
  const { data: salon } = await supabase
    .from('salons')
    .select('id, name, owner_name, plan')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!salon) redirect('/dashboard')

  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#F8F4EF' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* PC用サイドバー（768px以上で表示） */}
          <Sidebar salonName={salon.name} ownerName={salon.owner_name} />

          {/* メインコンテンツ */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: 'max(80px, env(safe-area-inset-bottom))',
          }}>
            {children}
          </main>
        </div>

        {/* モバイル用タブバー（768px未満で表示） */}
        <TabBar />
      </body>
    </html>
  )
}
