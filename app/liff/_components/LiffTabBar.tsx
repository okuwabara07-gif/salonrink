'use client'

import type { MouseEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { withLiffEnv } from '../_lib/liffEnv'

export type LiffTabKey = 'home' | 'records' | 'karte' | 'salon'

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ICONS: Record<LiffTabKey, ReactNode> = {
  home: (
    <svg {...ICON_PROPS}>
      <path d="M3 10.8 12 3.5l9 7.3" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9.8v-5.6a2.2 2.2 0 0 1 4.4 0V21h3.3a1 1 0 0 0 1-1V9.5" />
    </svg>
  ),
  records: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="6.5" width="18" height="14" rx="2.5" />
      <path d="M8.5 6.5 10 4h4l1.5 2.5" />
      <circle cx="12" cy="13.3" r="3.4" />
    </svg>
  ),
  karte: (
    <svg {...ICON_PROPS}>
      <rect x="4.5" y="4" width="15" height="17" rx="2.5" />
      <path d="M8.5 9h7M8.5 12.7h7M8.5 16.4h4.5" />
    </svg>
  ),
  salon: (
    <svg {...ICON_PROPS}>
      <circle cx="6.3" cy="6.3" r="2.6" />
      <circle cx="6.3" cy="17.7" r="2.6" />
      <path d="M20.5 4 8.6 15.9M14.7 14.6l5.8 5.4M8.6 8.1l3.6 3.7" />
    </svg>
  ),
}

const TABS: { key: LiffTabKey; label: string; color: string; href: string }[] = [
  { key: 'home', label: 'ホーム', color: '#B08654', href: '/liff/home' },
  { key: 'records', label: 'きろく', color: '#7E9A6F', href: '/liff/records' },
  { key: 'karte', label: 'マイカルテ', color: '#A8705C', href: '/liff/karte' },
  { key: 'salon', label: 'サロン', color: '#6E86A8', href: '/liff/salon' },
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
        boxShadow: '0 -2px 8px rgba(46,42,36,.05)',
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
              color: isActive ? tab.color : '#B9B0A2',
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
                background: isActive ? `${tab.color}1F` : 'transparent',
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
