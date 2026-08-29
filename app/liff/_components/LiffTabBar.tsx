'use client'

import type { MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { withLiffEnv } from '../_lib/liffEnv'

export type LiffTabKey = 'home' | 'records' | 'karte' | 'salon'

const TABS: { key: LiffTabKey; label: string; kanji: string; href: string }[] = [
  { key: 'home', label: 'ホーム', kanji: '家', href: '/liff/home' },
  { key: 'records', label: 'きろく', kanji: '録', href: '/liff/records' },
  { key: 'karte', label: 'マイカルテ', kanji: '帖', href: '/liff/karte' },
  { key: 'salon', label: 'サロン', kanji: '店', href: '/liff/salon' },
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
      style={{
        borderColor: '#E5DDCF',
        backgroundColor: '#fff',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 6px rgba(46,42,36,.04)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            prefetch={false}
            onClick={(e) => handleNav(e, tab.href)}
            className="flex-1"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              minHeight: '58px',
              padding: '8px 0 9px',
              textDecoration: 'none',
              position: 'relative',
              color: isActive ? '#2E2A24' : '#A2988A',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '22%',
                  right: '22%',
                  height: '2.5px',
                  borderRadius: '0 0 99px 99px',
                  background: '#A98D4B',
                }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--font-serif), "Shippori Mincho", serif',
                fontSize: '17px',
                lineHeight: 1,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#A98D4B' : '#B3A996',
              }}
            >
              {tab.kanji}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                lineHeight: 1,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '.02em',
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
