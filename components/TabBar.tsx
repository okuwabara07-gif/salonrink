'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { tabs } from './tabs'
import styles from './TabBar.module.css'

export default function TabBar() {
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
    <nav className={styles.tabBar}>
      {tabs.map(tab => {
        const isActive = activeTabId === tab.id
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{tab.icon}</span>
            <span className={styles.label}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
