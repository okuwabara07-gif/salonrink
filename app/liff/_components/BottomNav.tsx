'use client'

/**
 * app/liff/_components/BottomNav.tsx
 *
 * LIFF 共通ボトムナビゲーション
 * - 5タブ: ホーム / カルテ / 顧客 / メニュー / 設定
 * - 現在のパス(usePathname)から active タブ判定
 * - active は accent カラー、非 active は ink-3
 */

import { usePathname, useRouter } from 'next/navigation'
import {
  IconHome,
  IconClipboardList,
  IconUsers,
  IconList,
  IconSettings,
} from '@tabler/icons-react'

const TABS = [
  { label: 'ホーム', path: '/liff', icon: IconHome },
  { label: 'カルテ', path: '/liff/karte', icon: IconClipboardList },
  { label: '顧客', path: '/liff/customers', icon: IconUsers },
  { label: 'メニュー', path: '/liff/menu', icon: IconList },
  { label: '設定', path: '/liff/settings', icon: IconSettings },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (tabPath: string): boolean => {
    if (tabPath === '/liff') {
      return pathname === '/liff'
    }
    return pathname.startsWith(tabPath)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-card">
      <div className="flex justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)

          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center py-3 px-2 flex-1 transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--ink-3)',
              }}
              type="button"
            >
              <Icon size={24} stroke={1.5} />
              <span className="text-xs mt-1 leading-none">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
