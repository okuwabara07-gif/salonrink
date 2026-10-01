'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M3 10.8 12 3.5l9 7.3" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9.8v-5.6a2.2 2.2 0 0 1 4.4 0V21h3.3a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  pass: <path d="M12 3.5c3 2.2 5.5 3 8 3v5.2c0 4.3-3.3 7.4-8 8.8-4.7-1.4-8-4.5-8-8.8V6.5c2.5 0 5-.8 8-3z" />,
  cal: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  link: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 11 15.7 7M8.3 13l7.4 4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  line: <path d="M12 4c-5 0-8.5 3.2-8.5 7 0 3.4 2.8 6.1 6.7 6.8L10 21l3.5-3.1c4.2-.4 7-3.2 7-6.9 0-3.8-3.5-7-8.5-7z" />,
  clip: (
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4.5" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11.5" rx="1.5" />
      <path d="M3 9h18M12 9v11.5M12 9C10.5 5.5 7 5 7 7.2 7 9 12 9 12 9zm0 0c1.5-3.5 5-4 5-1.8C17 9 12 9 12 9z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.2 2.5 2.5 4.9-5" />
    </>
  ),
  chevL: <path d="m14.5 6-6 6 6 6" />,
  chevR: <path d="m9.5 6 6 6-6 6" />,
  qr: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 19.5h1.5M19 14h1.5" />
    </>
  ),
}

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}


export type SalonNavKey = 'today' | 'settings' | 'stats'

const NAV: { icon: string; label: string; href: string; key?: SalonNavKey; isNew?: boolean }[] = [
  { icon: 'home', label: 'ホーム', href: '/dashboard' },
  { icon: 'pass', label: '本日のPASS', href: '/salon/today', key: 'today', isNew: true },
  { icon: 'cal', label: '予約', href: '/dashboard/booking' },
  { icon: 'users', label: '顧客', href: '/dashboard/customers' },
  { icon: 'mail', label: 'DM配信', href: '/dashboard/messages' },
  { icon: 'link', label: '連携', href: '/dashboard/integrations' },
  { icon: 'gear', label: '設定', href: '/dashboard/settings' },
]

const PASS_SUB: { label: string; href: string; key: SalonNavKey }[] = [
  { label: 'PASS設定', href: '/salon/pass/settings', key: 'settings' },
  { label: '導入効果', href: '/salon/pass/stats', key: 'stats' },
]

const SHELL_CSS = `
.sr-shell{grid-template-columns:250px minmax(0,1fr)}
@media (max-width:1439px){.sr-shell{grid-template-columns:220px minmax(0,1fr)}}
`

export function SalonShell({
  active,
  salonName,
  children,
}: {
  active: SalonNavKey
  salonName: string
  children: ReactNode
}) {
  return (
    <div
      className="sr-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        background: 'linear-gradient(135deg,#F7FAFE,#EEF4FB)',
        fontFamily: 'var(--sans)',
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#1F2A37',
      }}
    >
      <style>{SHELL_CSS}</style>
      <aside
        style={{
          padding: '34px 18px 24px',
          background: 'linear-gradient(180deg,#FFFFFF,#F3F7FC)',
          borderRight: '1px solid #E3E9F1',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '40px', fontWeight: 500, lineHeight: 1.1 }}>
            SalonRink
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#2A3544' }}>{salonName}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NAV.map((n) => {
            const on = n.key === active
            return (
              <div key={n.href} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link
                  href={n.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minHeight: '52px',
                    padding: '0 14px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: on ? 'linear-gradient(90deg,#3C82D6,#2F6FC4)' : 'transparent',
                    color: on ? '#fff' : '#1F2A37',
                    boxShadow: on ? '0 6px 16px rgba(47,111,196,.3)' : 'none',
                  }}
                >
                  <span style={{ display: 'flex', flex: 'none' }}>
                    <Icon name={n.icon} />
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>
                  {n.isNew && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#fff',
                        background: '#3C82D6',
                        borderRadius: '999px',
                        padding: '0 7px',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </Link>
                {n.key === 'today' &&
                  PASS_SUB.map((s) => {
                    const subOn = s.key === active
                    return (
                      <Link
                        key={s.href}
                        href={s.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: '40px',
                          padding: '0 14px 0 48px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: subOn ? 'linear-gradient(90deg,#3C82D6,#2F6FC4)' : 'transparent',
                          color: subOn ? '#fff' : '#3B4656',
                          boxShadow: subOn ? '0 6px 16px rgba(47,111,196,.3)' : 'none',
                        }}
                      >
                        {s.label}
                      </Link>
                    )
                  })}
              </div>
            )
          })}
        </nav>
      </aside>
      {children}
    </div>
  )
}
