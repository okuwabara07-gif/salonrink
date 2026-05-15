'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

/* ============================================================
   /dashboard/cons — コンシェルジュ機能 (案A v2 進化版)
   ============================================================
   既存ダッシュボードと同一デザイントークンで動作
   AIアドバイザー + KPI + アクションカード + スタッフ深掘り(Pro)
   ============================================================ */

type Recommendation = {
  pri: string;
  tag: string;
  tagCls: 'rose' | 'sage' | 'mocha' | 'mauve';
  title: string;
  body: string;
  metrics: [string, string][];
  cta: string;
};

const RECOMMENDATIONS: Recommendation[] = [
  {
    pri: '01',
    tag: '空き枠埋め',
    tagCls: 'rose',
    title: '木曜 16:00-18:00 枠にカラー客を誘導',
    body:
      '木曜午後の空き枠は過去 8 週で平均 72% 空き。前回来店から 55〜70 日のカラー客 14 名に「平日午後 1,000円OFF」のDMを送ると、過去類似施策のCV率 18% を当て込んで売上見込 +¥38,000。',
    metrics: [['想定売上', '+¥38k'], ['対象', '14名'], ['工数', '5分']],
    cta: 'DM下書きを作成',
  },
  {
    pri: '02',
    tag: '客単価UP',
    tagCls: 'sage',
    title: 'カラー客にヘッドスパを15%でクロスセル',
    body:
      '直近4週、カラー客のヘッドスパ併用率は 11%。同価格帯の他店平均は 22%。「カラー後 +¥2,200 でヘッドスパ」の券面提案で、リピート上位 40 名に当てると ¥+24k/月。',
    metrics: [['客単価', '+¥1,650'], ['対象', '40名'], ['期間', '2週間']],
    cta: 'メニュー券を作る',
  },
  {
    pri: '03',
    tag: 'リピート改善',
    tagCls: 'mocha',
    title: '90日経過の指名客 11 名に再来店リマインド',
    body:
      '前回から 88〜92 日経過し、まだ次回予約のない指名客が 11 名。離反確率 62%。過去同タイミングの再来CV率 41%を踏まえ、LINEに前回メニュー込みの軽いリマインドを推奨。',
    metrics: [['再来見込', '4.5名'], ['想定売上', '+¥31k'], ['工数', '8分']],
    cta: 'LINEを準備',
  },
];

const STAFF_PERF = [
  { name: '太郎', rate: 0.78, avg: '¥8,400', repeat: '54%', trend: '↗' },
  { name: 'さつき', rate: 0.62, avg: '¥7,200', repeat: '49%', trend: '→' },
  { name: 'みなみ', rate: 0.41, avg: '¥6,300', repeat: '38%', trend: '↘' },
  { name: 'ゆう', rate: 0.55, avg: '¥7,100', repeat: '45%', trend: '↗' },
];

const CHANNELS = [
  { ch: 'Instagram', body: '「白髪ぼかしハイライト」のリール投稿。火・木 20 時投稿で同地域類似店の中央エンゲージ +38%。', kpi: 'CPA ¥1,200' },
  { ch: 'Google', body: '「鶴見 白髪染め」の検索流入は前月比 +14%。営業時間欄に「平日 16-18 時 1,000円OFF」訴求の追記を推奨。', kpi: 'CPA ¥800' },
  { ch: 'ホットペッパー', body: '掲載順位 12 → 8 位を狙う。週末枠を 2 枚開放するとアルゴリズム評価が上昇する可能性。', kpi: 'CPA ¥2,400' },
];

function KpiSpark({ d, color }: { d: string; color: string }) {
  return (
    <svg viewBox="0 0 58 24" width="58" height="24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <path d={d} />
    </svg>
  );
}

export default function ConsPage() {
  const router = useRouter();

  const handleDeepDive = () => alert('AI対話機能は Phase 4 で実装予定です(Claude Haiku 接続)');
  const handleMonthlyReport = () => alert('月次レポート機能は Phase 4 で実装予定です(Pro プラン限定)');
  const handleSeeAll = () => alert('全提案表示は Pro プラン限定機能です');
  const handleCreateMenuCoupon = () => alert('メニュー券生成は Phase 4 で実装予定です');
  const goToMessages = () => router.push('/dashboard/messages');

  const today = new Date();
  const dateStr = `${today.getFullYear()}年 ${today.getMonth() + 1}月 ${today.getDate()}日(${'日月火水木金土'[today.getDay()]})`;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headIcon} aria-hidden>✦</div>
        <div>
          <h1 className={styles.headTitle}>コンシェルジュ</h1>
          <p className={styles.headSub}>AI経営アドバイザー · {dateStr} 時点の分析</p>
        </div>
        <span className={styles.newBadge}>NEW</span>
      </div>

      {/* AI greeting */}
      <section className={styles.greeting}>
        <div className={styles.greetingAvatar}>R</div>
        <div className={styles.greetingBody}>
          <p className={styles.greetingTitle}>
            テスト太郎さん、5月の経営状況を分析しました。
          </p>
          <p className={styles.greetingText}>
            今月は前月比 <strong className={styles.greenStrong}>+12.4%</strong> のペースで推移しています。
            一方で <strong>16〜18時の空き枠</strong>が平均より 28% 多く、ここを埋められれば月次 <strong>+¥48,000</strong> の上振れ余地があります。
            下記に優先度順で 3 つの打ち手を整理しました。
          </p>
          <div className={styles.greetingActions}>
            <button type="button" className={styles.btn} onClick={handleDeepDive}>対話で深掘りする</button>
            <button type="button" className={styles.btnGhost} onClick={handleMonthlyReport}>月次レポートを見る</button>
            <span className={styles.greetingTime}>最終更新 10:49</span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLeft}>
            <p className={styles.kpiLabel}>経営スコア</p>
            <p className={styles.kpiVal}>72<span className={styles.kpiUnit}>/100</span></p>
            <p className={styles.kpiDelta}>↗ +4 pt vs 先月</p>
          </div>
          <div className={styles.kpiSpark}>
            <KpiSpark d="M2 22 L8 18 L14 20 L20 14 L26 16 L32 9 L38 11 L44 6 L50 8 L56 4" color="#8a5a3d" />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLeft}>
            <p className={styles.kpiLabel}>売上達成率(月)</p>
            <p className={styles.kpiVal}>63<span className={styles.kpiUnit}>%</span></p>
            <p className={styles.kpiDelta}>¥504k / 目標 ¥800k</p>
          </div>
          <div className={styles.kpiSpark}>
            <KpiSpark d="M2 14 L8 16 L14 11 L20 13 L26 9 L32 12 L38 7 L44 9 L50 5 L56 7" color="#5e2a2a" />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLeft}>
            <p className={styles.kpiLabel}>リピート率(90日)</p>
            <p className={styles.kpiVal}>48<span className={styles.kpiUnit}>%</span></p>
            <p className={`${styles.kpiDelta} ${styles.kpiDeltaDown}`}>↘ -2.1 pt vs 先月</p>
          </div>
          <div className={styles.kpiSpark}>
            <KpiSpark d="M2 10 L8 12 L14 9 L20 13 L26 11 L32 14 L38 10 L44 13 L50 11 L56 8" color="#6e6a3c" />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLeft}>
            <p className={styles.kpiLabel}>改善余地</p>
            <p className={styles.kpiVal}>+¥86<span className={styles.kpiUnit}>k</span></p>
            <p className={styles.kpiDelta}>今月中に実行可能 · 7件</p>
          </div>
          <div className={styles.kpiSpark}>
            <KpiSpark d="M2 18 L8 14 L14 16 L20 11 L26 13 L32 9 L38 11 L44 6 L50 9 L56 4" color="#b5705e" />
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>本日からの提案</h2>
          <span className={styles.cardSub}>優先度順 · AIが売上・予約・顧客データから抽出</span>
          <button type="button" className={styles.cardAction} onClick={handleSeeAll}>すべて表示 →</button>
        </div>
        {RECOMMENDATIONS.map((r, i) => (
          <div key={i} className={`${styles.rec} ${i > 0 ? styles.recBorder : ''}`}>
            <div className={styles.recPri}>{r.pri}</div>
            <div className={styles.recMain}>
              <div className={styles.recTitleRow}>
                <span className={`${styles.tag} ${styles[`tag${r.tagCls[0].toUpperCase()}${r.tagCls.slice(1)}`]}`}>{r.tag}</span>
                <h3 className={styles.recTitle}>{r.title}</h3>
              </div>
              <p className={styles.recBody}>{r.body}</p>
            </div>
            <div className={styles.recMetrics}>
              {r.metrics.map(([k, v]) => (
                <div key={k} className={styles.recMetric}>
                  <p className={styles.recMetricLabel}>{k}</p>
                  <p className={styles.recMetricValue}>{v}</p>
                </div>
              ))}
            </div>
            <div className={styles.recCtaWrap}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  if (r.cta.includes('DM') || r.cta.includes('LINE')) {
                    goToMessages();
                  } else if (r.cta.includes('メニュー券')) {
                    handleCreateMenuCoupon();
                  } else {
                    alert(`「${r.cta}」は Phase 4 で実装予定です`);
                  }
                }}
              >{r.cta}</button>
            </div>
          </div>
        ))}
      </section>

      {/* Staff perf + Channels */}
      <section className={styles.bottomRow}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>スタッフ別パフォーマンス</h2>
            <span className={styles.cardSub}>直近 30 日 · 指名率 / 客単価 / リピート率</span>
            <span className={styles.lockBadge}>◆ Pro 限定 · 深掘り分析</span>
          </div>
          <div className={styles.staffHeader}>
            <span>スタッフ</span>
            <span>指名率</span>
            <span className={styles.tRight}>客単価</span>
            <span className={styles.tRight}>リピ率</span>
            <span className={styles.tRight}>傾向</span>
          </div>
          {STAFF_PERF.map((s, i) => (
            <div key={i} className={styles.staffRow}>
              <div className={styles.staffNameCell}>
                <div className={styles.staffAvatar}>{s.name[0]}</div>
                <span>{s.name}</span>
              </div>
              <div className={styles.pbar}>
                <div
                  className={styles.pbarFill}
                  style={{
                    width: `${s.rate * 100}%`,
                    background: s.rate > 0.6 ? '#7a8a5c' : s.rate > 0.45 ? '#8a5a3d' : '#b5705e',
                  }}
                />
              </div>
              <span className={`${styles.mono} ${styles.tRight}`}>{s.avg}</span>
              <span className={`${styles.mono} ${styles.tRight}`}>{s.repeat}</span>
              <span
                className={styles.tRight}
                style={{ color: s.trend === '↗' ? '#7a8a5c' : s.trend === '↘' ? '#5e2a2a' : '#8a7860' }}
              >
                {s.trend}
              </span>
            </div>
          ))}
          <div className={styles.aiNote}>
            <strong>AI所見:</strong> みなみさんの指名率は 41% と店舗平均 58% を下回ります。
            直近フリー客の指名転換率がカット 8% / カラー 23% で、カウンセリング時間が短い傾向。
            同層のロールプレイ教材を 2 件用意できます。
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>新規集客チャネル提案</h2>
            <span className={styles.cardSub}>本日の AI ピック</span>
          </div>
          {CHANNELS.map((c, i) => (
            <div key={i} className={`${styles.channel} ${i > 0 ? styles.recBorder : ''}`}>
              <div className={styles.channelHead}>
                <span className={`${styles.tag} ${styles.tagMauve}`}>{c.ch}</span>
                <span className={`${styles.mono} ${styles.channelKpi}`}>想定 {c.kpi}</span>
              </div>
              <p className={styles.channelBody}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro upsell */}
      <section className={styles.proUpsell}>
        <div className={styles.proUpsellInner}>
          <div>
            <p className={styles.proKicker}>◆ PRO PLAN</p>
            <h3 className={styles.proTitle}>もっと深い分析と、AIとの無制限対話を。</h3>
            <p className={styles.proSub}>
              スタッフ別深掘り / 月次レポート無制限 / AI対話無制限 / カスタム目標設定が解放されます。
            </p>
          </div>
          <a href="/dashboard/plan" className={styles.proCta}>
            プランを比較する →
          </a>
        </div>
      </section>
    </div>
  );
}
