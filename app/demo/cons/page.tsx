'use client';

import React from 'react';
import { sampleConsAnalysis } from '@/lib/demo/fixtures';
import styles from './page.module.css';

export default function DemoConsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.demoBadge}>
        <span className={styles.demoBadgeIcon}>🔍</span>
        デモモード - これは架空データです
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>🤖 AI コンシェルジュ</h2>
        <button
          className={styles.reanalysisBtn}
          onClick={() =>
            alert('これはデモです。\n\n実際にご利用いただくには、無料相談をお試しください。')
          }
        >
          🔄 再分析を実行
        </button>
      </div>

      <div className={styles.analysisGrid}>
        {/* Today's analysis */}
        <div className={styles.analysisCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>📊</div>
            <h3 className={styles.cardTitle}>本日のAI分析</h3>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.analysisText}>{sampleConsAnalysis.todayAnalysis}</p>
          </div>
        </div>

        {/* Tomorrow's alerts */}
        <div className={styles.analysisCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>⚠️</div>
            <h3 className={styles.cardTitle}>明日のリスクアラート</h3>
          </div>
          <div className={styles.cardContent}>
            <ul className={styles.alertList}>
              {sampleConsAnalysis.tomorrowAlerts.map((alert, idx) => (
                <li key={idx} className={styles.alertItem}>
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className={styles.analysisCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>💡</div>
            <h3 className={styles.cardTitle}>おすすめ提案</h3>
          </div>
          <div className={styles.cardContent}>
            <ul className={styles.recommendationList}>
              {sampleConsAnalysis.recommendations.map((rec, idx) => (
                <li key={idx} className={styles.recommendationItem}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerText}>
          💬 このAI分析は、日々の予約・顧客データから自動生成されます。
          <br />
          実際の営業判断は、サロンスタッフの経験と組み合わせてご利用ください。
        </div>
      </div>
    </div>
  );
}
