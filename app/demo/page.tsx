'use client';

import Link from 'next/link';
import styles from './page.module.css';

const CARDS = [
  { href: '/demo/booking', image: '/demo/cards/card-booking.png', alt: '予約管理' },
  { href: '/demo/customers', image: '/demo/cards/card-customers.png', alt: '顧客一覧' },
  { href: '/demo/cons', image: '/demo/cards/card-cons.png', alt: 'AI コンシェルジュ' },
  { href: '/demo/settings', image: '/demo/cards/card-settings.png', alt: 'メニュー設定' },
];

export default function DemoPage() {
  return (
    <div className={styles.page}>
      <div className={styles.notice}>
        <div className={styles.noticeIcon}>ℹ️</div>
        <p className={styles.noticeText}>
          これはデモ画面です。実際のサロンでお試しいただくには
          <Link href="/cons" className={styles.noticeLink}>無料相談</Link>
          をご利用ください。
        </p>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>SalonRink デモへようこそ</h1>

        <div className={styles.cardGrid}>
          {CARDS.map((card) => (
            <Link key={card.href} href={card.href} className={styles.card}>
              <img
                src={card.image}
                alt={card.alt}
                className={styles.cardImage}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
