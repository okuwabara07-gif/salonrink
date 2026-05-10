'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const INTEGRATIONS = [
  {
    name: 'LINE',
    icon: 'chat',
    badge: null,
    cta: null,
    features: [
      'LINE公式アカウントと連携',
      'メッセージ・顧客情報を自動同期',
      '事前カウンセリングを自動化',
    ],
  },
  {
    name: 'Stripe',
    icon: 'card',
    badge: null,
    cta: null,
    features: [
      'オンライン決済に対応',
      '売上データを自動で同期',
      '安全でスムーズな決済体験',
    ],
  },
  {
    name: 'ホットペッパーBeauty',
    icon: 'folder',
    badge: 'ベータ連携中',
    cta: 'お試し申込',
    features: [
      '予約情報を自動で同期',
      'お客様情報を一元管理',
      '空き状況の自動反映にも対応',
    ],
  },
  {
    name: 'minimo',
    icon: 'star',
    badge: 'COMING SOON',
    cta: null,
    features: [
      '予約情報を自動で同期(予定)',
      'メニュー・顧客情報を一元管理(予定)',
      '近日対応予定',
    ],
  },
];

export default function Integrations() {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>INTEGRATIONS</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            いま使っているツールと、<br />シームレスに連携。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="integrations-grid" style={{ marginTop: 40 }}>
            {INTEGRATIONS.map((integ, i) => (
              <div key={integ.name} className="integration-card">
                <FadeUp delay={i * 60}>
                  <div className="integration-icon">
                    <Icon name={integ.icon as any} size={24} />
                  </div>
                  <div className="integration-name">{integ.name}</div>
                  {integ.badge && (
                    <div className="integration-badge">{integ.badge}</div>
                  )}
                  <ul style={{ margin: '12px 0 0', padding: '0', listStyle: 'none', fontSize: '12px', color: 'var(--c-fg-2)' }}>
                    {integ.features.map((f) => (
                      <li key={f} style={{ marginBottom: '6px' }}>✓ {f}</li>
                    ))}
                  </ul>
                  {integ.cta && (
                    <div className="integration-cta" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--c-border)', width: '100%' }}>
                      {integ.cta}
                    </div>
                  )}
                </FadeUp>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div style={{
            marginTop: 40,
            padding: '24px',
            background: 'var(--c-accent-soft)',
            borderRadius: 'var(--r-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔌</span>
                その他のサービスとも連携可能
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--c-fg-2)', lineHeight: 1.6 }}>
                上記以外のサービスとも、API・Webhookで連携可能です。お気軽にご相談ください。
              </p>
            </div>
            <a href="/contact" style={{
              padding: '10px 16px',
              background: 'var(--c-accent)',
              color: 'var(--c-on-accent)',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}>
              連携についてお問い合わせ ›
            </a>
          </div>
        </FadeUp>
        <FadeUp delay={240}>
          <p style={{
            marginTop: 24,
            fontSize: 12,
            color: 'var(--c-fg-3)',
            lineHeight: 1.7,
            textAlign: 'center',
          }}>
            ※ 各サービスの仕様変更により、連携内容が変更される場合があります。<br />
            ※ ホットペッパーBeauty 連携はベータ版です。一部機能制限があります。
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
