'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const INTEGRATIONS = [
  {
    name: 'LINE',
    icon: 'chat',
    color: '#06C755',
    bgSoft: '#E8F8EC',
    badge: 'Messaging API 対応',
    cta: '対応済み',
    ctaIcon: 'check',
    features: [
      'LINE公式アカウントと連携',
      'メッセージ・顧客情報を自動同期',
      '事前カウンセリングを自動化',
    ],
  },
  {
    name: 'Stripe',
    icon: 'card',
    color: '#7B5FE6',
    bgSoft: '#EEEAFC',
    badge: '決済プロバイダ',
    cta: '対応済み',
    ctaIcon: 'check',
    features: [
      'オンライン決済に対応',
      '売上データを自動で同期',
      '安全でスムーズな決済体験',
    ],
  },
  {
    name: 'ホットペッパーBeauty',
    icon: 'folder',
    color: '#E8716C',
    bgSoft: '#FCEAE9',
    badge: 'ベータ連携中',
    cta: 'お試し申込',
    ctaIcon: 'arrow',
    features: [
      '予約情報を自動で同期',
      'お客様情報を一元管理',
      '空き状況の自動反映にも対応',
    ],
  },
  {
    name: 'minimo',
    icon: 'star',
    color: '#6FB1DD',
    bgSoft: '#E6F1F8',
    badge: 'COMING SOON',
    cta: '近日サポート予定',
    ctaIcon: 'calendar',
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
            いま使っているツールと、<br />シームレスに。
          </h2>
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: '14px', color: 'var(--c-fg-2)' }}>
            主要サービスと連携して、予約・顧客・カルテ情報を自動で同期。
          </p>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="integrations-grid" style={{ marginTop: 40 }}>
            {INTEGRATIONS.map((integ, i) => (
              <div key={integ.name} className="integration-card">
                <FadeUp delay={i * 60}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: integ.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Icon name={integ.icon as any} size={32} />
                  </div>
                  <div className="integration-name">{integ.name}</div>
                  {integ.badge && (
                    <div style={{
                      background: integ.bgSoft,
                      color: integ.color,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-block',
                      marginTop: '8px',
                    }}>
                      {integ.badge}
                    </div>
                  )}
                  <ul style={{ margin: '12px 0 0', padding: '0', listStyle: 'none', fontSize: '12px', color: 'var(--c-fg-2)' }}>
                    {integ.features.map((f) => (
                      <li key={f} style={{ marginBottom: '6px' }}>
                        <span style={{ color: integ.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {integ.cta && (
                    <div style={{
                      background: integ.color,
                      color: 'white',
                      padding: '14px',
                      textAlign: 'center',
                      fontWeight: '600',
                      marginTop: 'auto',
                      margin: '14px -20px -20px -20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}>
                      {integ.cta}
                      <Icon name={integ.ctaIcon as any} size={16} />
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
