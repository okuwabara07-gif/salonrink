'use client'

import type { ReactNode } from 'react'
import PassNavLink from './PassNavLink'
import { PASS_TOKENS as T } from './PassCard'

export function PassHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <div
      style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        borderBottom: `1px solid ${T.line}`,
        flex: 'none',
      }}
    >
      <PassNavLink
        href={backHref}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          color: T.sub,
        }}
      >
        <span aria-label="戻る">‹</span>
      </PassNavLink>
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: '17px',
          fontWeight: 500,
          marginRight: '44px',
        }}
      >
        {title}
      </span>
    </div>
  )
}

export function PassPage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: T.bg,
        color: T.text,
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function PassNotice({ text }: { text: string }) {
  return (
    <div style={{ padding: '88px 24px', textAlign: 'center', fontSize: '16px', lineHeight: 1.75, color: T.sub }}>
      {text}
    </div>
  )
}
