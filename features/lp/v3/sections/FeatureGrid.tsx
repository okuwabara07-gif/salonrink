'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const RICH_FEATURES = [
  { i: 'brain', t: 'AIカルテ自動生成', d: '会話から自動でカルテを構造化', img: '/v3/karte-img.png' },
  { i: 'chat', t: 'LIFFカウンセリング', d: '事前回答で時短・抜け漏れ防止', img: '/v3/feature-01-line-bot.svg' },
  { i: 'shield', t: '事前カウンセリング管理', d: '情報を一元化してスタッフ全員で共有', img: '/v3/feature-04-customer.webp' },
  { i: 'calendar', t: '予約管理', d: 'ダブルブッキング防止 + LINE 自動同期', img: '/v3/feature-02-reservation.webp' },
  { i: 'chart', t: '売上ダッシュボード', d: 'リアルタイム可視化で経営判断を支援', img: '/v3/feature-07-marketing.webp' },
  { i: 'folder', t: '顧客履歴一元管理', d: '写真・好み・施術履歴をすべて保存', img: '/v3/feature-08-pc-dashboard.webp' },
  { i: 'spark', t: 'API連携', d: '他 SaaS とシームレスに接続', img: '/v3/feature-09-integration.webp' },
];

const ICON_FEATURES = [
  { i: 'spark', t: 'AIメニュー提案', d: '次回最適メニューを自動提案' },
  { i: 'card', t: 'オンライン決済', d: 'Stripe 連携で安心の決済' },
  { i: 'lock', t: '権限管理', d: 'スタッフ別にアクセス制御' },
  { i: 'chat', t: 'リマインド配信', d: 'LINE で自動リマインド' },
  { i: 'star', t: '口コミ収集', d: 'Google レビュー連動' },
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

        {/* Rich card grid: 7 features with images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ marginTop: 40 }}>
          {RICH_FEATURES.map((f, i) => (
            <FadeUp key={i} delay={i * 60}>
              <div style={{
                background: 'var(--c-bg-card)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--c-accent-soft)', color: 'var(--c-accent-2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={f.i as any} size={18} />
                  </span>
                  <div style={{ fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 16 }}>{f.t}</div>
                </div>
                <div style={{ padding: '0 24px 16px', fontSize: 12, color: 'var(--c-fg-3)', lineHeight: 1.7 }}>
                  {f.d}
                </div>
                <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--c-bg-2)', marginTop: 'auto' }}>
                  <img src={f.img} alt={f.t} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Icon-only feature row: 5 features */}
        <div style={{
          marginTop: 28,
          background: 'var(--c-bg-card)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px 8px',
        }}>
          <div style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.16em', color: 'var(--c-fg-3)', marginBottom: 18 }}>
            その他の機能
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ICON_FEATURES.map((f, i) => (
              <FadeUp key={i} delay={i * 40}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '14px 12px', textAlign: 'center', gap: 8,
                }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--c-accent-soft)', color: 'var(--c-accent-2)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={f.i as any} size={16} />
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{f.t}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--c-fg-3)', lineHeight: 1.6 }}>{f.d}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
