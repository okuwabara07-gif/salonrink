'use client'

import React from 'react'

/**
 * ミニアプリ共通ボトムナビ(5タブ)。
 * active に現在のタブキーを渡すとハイライトされる。
 */

const C = { rose: '#C24E40', muted: '#6f655d', line: '#ece6df' }

type TabKey = 'home' | 'diagnosis' | 'products' | 'history' | 'mypage'

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: 'home', label: 'ホーム', href: '/miniapp' },
  { key: 'diagnosis', label: '診断', href: '/tools/hair-check' },
  { key: 'products', label: '製品一覧', href: '/miniapp/products' },
  { key: 'history', label: '購入履歴', href: '/miniapp/orders' },
  { key: 'mypage', label: 'マイページ', href: '/miniapp/mypage' },
]

export default function MiniappNav({ active }: { active: TabKey }) {
  return (
    <nav style={navStyle}>
      {TABS.map((t) => (
        <a
          key={t.key}
          href={t.href}
          style={{ ...navItem, ...(t.key === active ? { color: C.rose, fontWeight: 700 } : {}) }}
        >
          {t.label}
        </a>
      ))}
    </nav>
  )
}

const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  background: '#fff',
  borderTop: `1px solid ${C.line}`,
  maxWidth: 480,
  margin: '0 auto',
  zIndex: 10,
}
const navItem: React.CSSProperties = {
  flex: 1,
  textAlign: 'center',
  padding: '12px 0',
  fontSize: 12,
  color: C.muted,
  textDecoration: 'none',
}
