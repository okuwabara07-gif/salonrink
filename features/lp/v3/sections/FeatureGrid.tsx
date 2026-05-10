'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const FEATURES = [
  {
    i: 'brain',
    t: 'AIカルテ自動生成',
    d: '会話から自動でカルテを整理',
    img: '/v3/feature-01-karte.webp',
    wide: true,
  },
  {
    i: 'chat',
    t: 'LINEカウンセリング',
    d: '事前回答でカウンセリングを時短に',
    img: '/v3/feature-02-line.webp',
    wide: true,
  },
  {
    i: 'shield',
    t: 'アレルギー情報自動表示',
    d: '施術リスクを事前に確認',
    img: '/v3/feature-03-allergy.webp',
  },
  {
    i: 'calendar',
    t: '予約管理',
    d: 'ダブルブッキングを防止しスムーズな予約運用を実現',
    img: '/v3/feature-04-booking.webp',
  },
  {
    i: 'folder',
    t: '顧客履歴一元管理',
    d: '写真・施術履歴・メモをすべて一元管理',
    img: '/v3/feature-05-customer.webp',
  },
  {
    i: 'chart',
    t: '売上ダッシュボード',
    d: 'リアルタイムでサロンの状況を可視化',
    img: '/v3/feature-06-dashboard.webp',
  },
  {
    i: 'spark',
    t: 'AIメニュー提案',
    d: '次回施術の提案を自動でサポート',
    img: '/v3/feature-07-menu.webp',
  },
  {
    i: 'menu',
    t: 'その他の機能',
    d: 'サロン運営を支える機能群',
    img: '/v3/feature-08-others.webp',
  },
];

export default function FeatureGrid() {
  return (
    <section className="section section-cream" id="features">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>FEATURES</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            サロン運営に必要な機能、<br />
            すべてが一つに。
          </h2>
        </FadeUp>

        {/* 8-card grid: span-6 × 2 (top) + span-4 × 3 (middle) + span-4 × 3 (bottom) */}
        <div className="features-grid" style={{ marginTop: 40 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={f.wide ? 'features-card-wide' : 'features-card'}
            >
              <FadeUp delay={i * 60}>
                <div style={{
                  background: 'var(--c-bg-card)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                  {/* Header: icon + title */}
                  <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--c-accent-soft)',
                      color: 'var(--c-accent-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon name={f.i as any} size={18} />
                    </span>
                    <div style={{
                      fontFamily: 'var(--f-display)',
                      fontWeight: 500,
                      fontSize: 16,
                      color: 'var(--c-fg)',
                    }}>
                      {f.t}
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div style={{
                    padding: '0 24px 16px',
                    fontSize: 12,
                    color: 'var(--c-fg-3)',
                    lineHeight: 1.7,
                  }}>
                    {f.d}
                  </div>

                  {/* Image */}
                  <div style={{
                    width: '100%',
                    aspectRatio: f.wide ? '16/9' : '4/3',
                    background: 'var(--c-bg-2)',
                    marginTop: 'auto',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={f.img}
                      alt={f.i === 'menu' ? 'オンライン決済、リマインド配信、権限管理、口コミ収集、API連携などの機能群' : f.t}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
