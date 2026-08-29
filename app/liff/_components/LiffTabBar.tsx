'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { withLiffEnv } from '../_lib/liffEnv'

export type LiffTabKey = 'home' | 'records' | 'karte' | 'salon'

const ICONS: Record<LiffTabKey, ReactNode> = {
  home: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.2 12 3.5l9 7.7" />
      <path d="M5.4 10v9.5a1 1 0 0 0 1 1h11.2a1 1 0 0 0 1-1V10" />
      <path d="M9.8 20.5v-6h4.4v6" />
    </svg>
  ),
  records: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14.5" rx="2.2" />
      <circle cx="8.6" cy="10" r="1.5" />
      <path d="M4.5 17.5l4.6-4.6 3.6 3.6 2.8-2.8 4 4" />
    </svg>
  ),
  karte: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4.5" width="14" height="16.5" rx="2.2" />
      <path d="M9.2 3h5.6v3.4H9.2z" />
      <path d="M8.8 11h6.4M8.8 14.4h6.4M8.8 17.8h4" />
    </svg>
  ),
  salon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6.6" r="2.6" />
      <circle cx="6" cy="17.4" r="2.6" />
      <path d="M8.3 8.3 20.5 18.6" />
      <path d="M8.3 15.7 20.5 5.4" />
    </svg>
  ),
}

const TABS: { key: LiffTabKey; label: string; color: string; href: string }[] = [
  { key: 'home', label: 'ホーム', color: '#A98D4B', href: '/liff/home' },
  { key: 'records', label: 'きろく', color: '#B07A54', href: '/liff/records' },
  { key: 'karte', label: 'マイカルテ', color: '#7E8C64', href: '/liff/karte' },
  { key: 'salon', label: 'サロン', color: '#8A6E8C', href: '/liff/salon' },
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
        boxShadow: '0 -1px 8px rgba(46,42,36,.06)',
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
              gap: '4px',
              minHeight: '66px',
              padding: '9px 0 10px',
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
                  left: '20%',
                  right: '20%',
                  height: '3px',
                  borderRadius: '0 0 99px 99px',
                  background: tab.color,
                }}
              />
            )}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '30px',
                borderRadius: '10px',
                color: tab.color,
                opacity: isActive ? 1 : 0.55,
                background: isActive ? `${tab.color}1F` : 'transparent',
                transition: 'opacity .15s',
              }}
            >
              {ICONS[tab.key]}
            </span>
            <span
              style={{
                fontSize: '11px',
                lineHeight: 1,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '.02em',
                color: isActive ? tab.color : '#A2988A',
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
