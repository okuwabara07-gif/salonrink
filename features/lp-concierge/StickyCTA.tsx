'use client'

import styles from './StickyCTA.module.css'

export default function StickyCTA() {
  return (
    <div className={styles.stickyCtaBar}>
      <a href="/register" className={`${styles.stickyCtaButton} ${styles.stickyCtaPrimary}`}>
        14日間無料で試す
      </a>
      <a
        href="https://lin.ee/UDNlEOAA"
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.stickyCtaButton} ${styles.stickyCtaSecondary}`}
      >
        LINEで相談
      </a>
    </div>
  )
}
