'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { tabs } from './tabs'
import styles from './Sidebar.module.css'

interface SidebarProps {
  salonName?: string
  ownerName?: string
}

export default function Sidebar({ salonName = 'サロン名未設定', ownerName = '' }: SidebarProps) {
  const pathname = usePathname()

  const getActiveTabId = () => {
    if (pathname === '/dashboard') return 'home'
    if (pathname.startsWith('/dashboard/booking')) return 'booking'
    if (pathname.startsWith('/dashboard/customers')) return 'customers'
    if (pathname.startsWith('/dashboard/integrations')) return 'integrations'
    if (pathname.startsWith('/dashboard/more')) return 'more'
    return 'home'
  }

  const activeTabId = getActiveTabId()

  return (
    <aside className={styles.sidebar}>
      {/* ロゴ */}
      <div className={styles.logo}>
        <div className={styles.logoTitle}>SalonRink</div>
        <div className={styles.logoSubtitle}>SalonRink</div>
      </div>

      {/* ナビゲーション */}
      <nav className={styles.nav}>
        {tabs.map(tab => {
          const isActive = activeTabId === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className={styles.footer}>
        <div className={styles.footerSalonName}>{salonName}</div>
        <div className={styles.footerOwnerName}>{ownerName}</div>
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.logoutButton}>
            ログアウト
          </button>
        </form>
      </div>
    </aside>
  )
}
