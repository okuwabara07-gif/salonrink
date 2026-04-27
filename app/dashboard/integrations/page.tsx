'use client'

import Link from 'next/link'

interface IntegrationCard {
  id: string
  icon: string
  title: string
  description: string
  path: string
  status: 'active' | 'coming-soon'
}

const integrations: IntegrationCard[] = [
  {
    id: 'line',
    icon: '💬',
    title: 'LINE連携',
    description: 'LINE予約・リマインド・フォローアップ',
    path: '/dashboard/integrations/line',
    status: 'active',
  },
  {
    id: 'hotpepper',
    icon: '🍽',
    title: 'ホットペッパー連携',
    description: 'ホットペッパーからの予約を自動同期',
    path: '/dashboard/integrations/hotpepper',
    status: 'active',
  },
  {
    id: 'richmenu',
    icon: '📱',
    title: 'リッチメニュー設定',
    description: 'LINEのリッチメニューをカスタマイズ',
    path: '/dashboard/integrations/richmenu',
    status: 'active',
  },
  {
    id: 'otayori',
    icon: '📮',
    title: 'おたより配信',
    description: '顧客にメッセージを一括配信',
    path: '/dashboard/integrations/otayori',
    status: 'coming-soon',
  },
]

export default function IntegrationsPage() {
  return (
    <main style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
          連携設定
        </h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
          外部サービスとの連携を管理します
        </p>
      </div>

      {/* 統合カード */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {integrations.map(integration => (
          <div
            key={integration.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              border: '1px solid #E0D8D0',
              opacity: integration.status === 'coming-soon' ? 0.6 : 1,
              pointerEvents: integration.status === 'coming-soon' ? 'none' : 'auto',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>{integration.icon}</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1018', margin: '0 0 8px 0' }}>
              {integration.title}
            </h2>
            <p style={{ fontSize: 13, color: '#7A6E64', lineHeight: 1.6, marginBottom: 20 }}>
              {integration.description}
            </p>

            {integration.status === 'active' ? (
              <Link
                href={integration.path}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#B8966A',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                設定する →
              </Link>
            ) : (
              <div style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#E0D8D0',
                color: '#888',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}>
                Coming Soon
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
