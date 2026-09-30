'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { withLiffEnv } from '../_lib/liffEnv'

// LiffTabBar と同じく ?liffenv= を遷移で落とさないリンク
export default function PassNavLink({
  href,
  style,
  children,
}: {
  href: string
  style?: CSSProperties
  children: ReactNode
}) {
  const router = useRouter()
  const handleNav = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = withLiffEnv(href, window.location.search)
    if (target !== href) {
      e.preventDefault()
      router.push(target)
    }
  }
  return (
    <Link href={href} onClick={handleNav} style={{ textDecoration: 'none', color: 'inherit', ...style }}>
      {children}
    </Link>
  )
}
