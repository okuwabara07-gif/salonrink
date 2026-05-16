'use client';

import React from 'react';
import styles from './page.module.css';

/* ============================================================
   /dashboard/cons — コンシェルジュ(準備中ゲート)
   ============================================================
   AI経営アドバイザー本実装(KPI実集計 + Claude Haiku 生成 +
   日次キャッシュ + レート制限)は Phase B/C で対応。
   それまでは偽データを表示しないため Coming Soon を表示する。
   ============================================================ */

export default function ConsPage() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年 ${today.getMonth() + 1}月 ${today.getDate()}日(${'日月火水木金土'[today.getDay()]})`;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon} aria-hidden>✦</div>
        <div>
          <h1 className={styles.headTitle}>コンシェルジュ</h1>
          <p className={styles.headSub}>AI経営アドバイザー · {dateStr}</p>
        </div>
        <span className={styles.newBadge}>NEW</span>
      </div>

      {/* Coming soon */}
      <section
        className={styles.card}
        style={{
          textAlign: 'center',
          padding: '56px 28px',
          marginTop: 20,
        }}
      >
        <div
          aria-hidden
          style={{
            fontSize: 40,
            marginBottom: 14,
            opacity: 0.7,
          }}
        >
          ✦
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--serif)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          AI経営アドバイザーを準備中です
        </h2>
        <p
          style={{
            margin: '14px auto 0',
            maxWidth: 520,
            fontSize: 13.5,
            lineHeight: 1.8,
            color: 'var(--ink-2)',
          }}
        >
          売上・予約・顧客データを AI が分析し、空き枠対策・客単価向上・
          リピート改善などの具体的な打ち手を、優先度順にご提案します。
          実データに基づく分析を正確にお届けするため、現在開発を進めています。
        </p>
        <p
          style={{
            margin: '20px auto 0',
            maxWidth: 520,
            fontSize: 12.5,
            lineHeight: 1.7,
            color: 'var(--muted)',
          }}
        >
          公開準備が整い次第、こちらの画面でご利用いただけるようになります。
          それまでは「顧客」「DM配信」「予約」の各機能をご活用ください。
        </p>

        <div
          style={{
            display: 'inline-flex',
            gap: 10,
            marginTop: 28,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a
            href="/dashboard/customers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              background: 'var(--ink)',
              color: '#f0e6d2',
            }}
          >
            顧客一覧へ →
          </a>
          <a
            href="/dashboard/messages"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--line-2)',
              color: 'var(--ink-2)',
            }}
          >
            DM配信へ →
          </a>
        </div>
      </section>
    </div>
  );
}
