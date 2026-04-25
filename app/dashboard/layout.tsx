import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const navItems = [
    { id: 'home', label: 'ホーム', path: '/dashboard' },
    { id: 'booking', label: '予約管理', path: '/dashboard/booking' },
    { id: 'line', label: 'LINE連携', path: '/dashboard/line' },
    { id: 'hotpepper', label: 'HPB連携', path: '/dashboard/hotpepper' },
    { id: 'hpb-setup', label: 'HPB設定', path: '/dashboard/hpb-setup' },
    { id: 'sync-status', label: '同期状態', path: '/dashboard/sync-status' },
    { id: 'karte', label: 'カルテ', path: '/dashboard/karte' },
    { id: 'richmenu', label: 'リッチメニュー', path: '/dashboard/richmenu' },
    { id: 'plan', label: 'プラン', path: '/dashboard/plan' },
    { id: 'settings', label: '設定', path: '/dashboard/settings' },
  ]

  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#F8F4EF' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* サイドバー */}
          <aside style={{
            width: 220,
            background: '#1A1018',
            padding: '24px 0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}>
            {/* ロゴ */}
            <div style={{ padding: '0 20px', marginBottom: 32, lineHeight: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: 6, color: '#FAF6EE' }}>
                SalonRink
              </div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: '#B8966A', marginTop: 4 }}>
                SalonRink
              </div>
            </div>

            {/* ナビゲーション */}
            <style>{`
              .nav-link {
                display: block;
                padding: 12px 20px;
                font-size: 13px;
                color: rgba(255,255,255,0.6);
                text-decoration: none;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
              }
              .nav-link:hover {
                color: #FAF6EE;
                background: rgba(184,150,106,.1);
                border-left: 2px solid #B8966A;
              }
            `}</style>
            <nav style={{ flex: 1 }}>
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.path}
                  className="nav-link"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* フッター */}
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                {salon.name || 'サロン名未設定'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                {salon.owner_name || ''}
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid rgba(255,255,255,.15)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: 11,
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  ログアウト
                </button>
              </form>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
