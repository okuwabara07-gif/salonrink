'use client'

import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { withLiffEnv } from '../_lib/liffEnv'

export type LiffTabKey = 'home' | 'records' | 'karte' | 'salon'

const TABS: { key: LiffTabKey; label: string; href: string }[] = [
  { key: 'home', label: 'ホーム', href: '/liff/home' },
  { key: 'records', label: 'きろく', href: '/liff/records' },
  { key: 'karte', label: 'マイカルテ', href: '/liff/karte' },
  { key: 'salon', label: 'サロン', href: '/liff/salon' },
]

export default function LiffTabBar({ active }: { active: LiffTabKey }) {
  const router = useRouter()

  // ?liffenv=review|dev で開かれている審査導線を、画面遷移で落とさない。
  // useSearchParams は静的プリレンダを外すため、クリック時に読む。
  const handleNav = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (typeof window === 'undefined') return
    const target = withLiffEnv(href, window.location.search)
    if (target !== href) {
      e.preventDefault()
      router.push(target)
    }
  }

  return (
    <div
      className="flex border-t"
      style={{ borderColor: '#E5DDCF', backgroundColor: '#fff', padding: '10px 0 16px' }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            prefetch={false}
            onClick={(e) => handleNav(e, tab.href)}
            className="flex-1 text-center text-[10px]"
            style={{
              fontWeight: isActive ? 700 : 'normal',
              color: isActive ? '#8A7A5F' : '#A2988A',
              textDecoration: 'none',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
