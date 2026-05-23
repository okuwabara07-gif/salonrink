'use client';

import Link from 'next/link';
import styles from './page.module.css';

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
        <p className={styles.subtitle}>主な機能をお試しいただけます</p>

        <div className={styles.cardGrid}>
          <Link href="/demo/booking" className={styles.card}>
            <div className={styles.cardIcon}>📅</div>
            <h2 className={styles.cardTitle}>予約管理</h2>
            <p className={styles.cardDesc}>タイムテーブル / 予約管理</p>
          </Link>

          <Link href="/demo/customers" className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <h2 className={styles.cardTitle}>顧客一覧</h2>
            <p className={styles.cardDesc}>顧客データベース</p>
          </Link>

          <Link href="/demo/cons" className={styles.card}>
            <div className={styles.cardIcon}>🤖</div>
            <h2 className={styles.cardTitle}>AI コンシェルジュ</h2>
            <p className={styles.cardDesc}>自動カウンセリング</p>
          </Link>

          <Link href="/demo/settings" className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h2 className={styles.cardTitle}>メニュー設定</h2>
            <p className={styles.cardDesc}>施術メニュー管理</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
