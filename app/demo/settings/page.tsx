'use client';

import React from 'react';
import { sampleMenu } from '@/lib/demo/fixtures';
import styles from './page.module.css';

export default function DemoSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.demoBadge}>
        <span className={styles.demoBadgeIcon}>🔍</span>
        デモモード - これは架空データです
      </div>

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>メニュー設定</h2>
          <p className={styles.subtitle}>施術メニュー管理</p>
        </div>
        <button
          className={styles.addMenuBtn}
          onClick={() =>
            alert('これはデモです。\n\n実際にご利用いただくには、無料相談をお試しください。')
          }
        >
          + 新規メニュー追加
        </button>
      </div>

      <div className={styles.menuCard}>
        <h3 className={styles.cardTitle}>施術メニュー ({sampleMenu.length}件)</h3>
        <div className={styles.menuTable}>
          <div className={styles.tableHeader}>
            <div className={styles.colName}>メニュー名</div>
            <div className={styles.colMeta}>料金 / 所要時間</div>
            <div className={styles.colCategory}>カテゴリ</div>
            <div className={styles.colActions}>操作</div>
          </div>
          {sampleMenu.map((menu) => (
            <div key={menu.id} className={styles.tableRow}>
              <div className={styles.colName}>
                <div className={styles.menuName}>{menu.name}</div>
                {menu.description && (
                  <div className={styles.menuDesc}>{menu.description}</div>
                )}
              </div>
              <div className={styles.colMeta}>
                <div>¥{menu.price.toLocaleString()}</div>
                <div className={styles.duration}>{menu.durationMinutes}分</div>
              </div>
              <div className={styles.colCategory}>
                <span className={styles.categoryBadge}>{menu.category}</span>
              </div>
              <div className={styles.colActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() =>
                    alert('これはデモです。\n\n実際にご利用いただくには、無料相談をお試しください。')
                  }
                >
                  編集
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() =>
                    alert('これはデモです。\n\n実際にご利用いただくには、無料相談をお試しください。')
                  }
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoIcon}>ℹ️</div>
        <div className={styles.infoText}>
          <p className={styles.infoTitle}>料金設定のヒント</p>
          <p className={styles.infoDesc}>
            定期的なカラーメンテナンス（4-6週間）と、初回ハイライトは異なる価格帯で提案することで、
            リピート顧客の客単価を最適化できます。
          </p>
        </div>
      </div>
    </div>
  );
}
