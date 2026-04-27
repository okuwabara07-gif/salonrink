'use client'

import Link from 'next/link'

interface MenuItem {
  id: string
  icon: string
  label: string
  path?: string
  action?: 'form' | 'link'
  status?: 'active' | 'coming-soon'
}

const menuItems: MenuItem[] = [
  {
    id: 'plan',
    icon: '📊',
    label: 'プラン',
    path: '/dashboard/more/plan',
    status: 'active',
  },
  {
    id: 'settings',
    icon: '⚙',
    label: '設定',
    path: '/dashboard/more/settings',
    status: 'active',
  },
  {
    id: 'shop',
    icon: '🛍',
    label: '店販EC',
    path: '#',
    status: 'coming-soon',
  },
  {
    id: 'logout',
    icon: '🚪',
    label: 'ログアウト',
    action: 'form',
    status: 'active',
  },
]

export default function MorePage() {
  return (
    <main style={{ padding: '40px', maxWidth: 600, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
          その他
        </h1>
      </div>

      {/* メニューリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {menuItems.map(item => {
          if (item.action === 'form') {
            return (
              <form key={item.id} action="/auth/signout" method="post">
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: '#fff',
                    border: '1px solid #E0D8D0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    fontSize: 14,
                    color: item.status === 'coming-soon' ? '#888' : '#1A1018',
                    opacity: item.status === 'coming-soon' ? 0.6 : 1,
                    pointerEvents: item.status === 'coming-soon' ? 'none' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (item.status !== 'coming-soon') {
                      e.currentTarget.style.background = '#F8F4EF'
                      e.currentTarget.style.borderColor = '#B8966A'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#E0D8D0'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  {item.status === 'coming-soon' && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888' }}>Coming Soon</span>
                  )}
                  {item.status === 'active' && (
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>→</span>
                  )}
                </button>
              </form>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.path || '#'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: '#fff',
                border: '1px solid #E0D8D0',
                borderRadius: 8,
                cursor: item.status === 'coming-soon' ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                fontSize: 14,
                color: item.status === 'coming-soon' ? '#888' : '#1A1018',
                opacity: item.status === 'coming-soon' ? 0.6 : 1,
                pointerEvents: item.status === 'coming-soon' ? 'none' : 'auto',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
              {item.status === 'coming-soon' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888' }}>Coming Soon</span>
              )}
              {item.status === 'active' && (
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>→</span>
              )}
            </Link>
          )
        })}
      </div>
    </main>
  )
}
