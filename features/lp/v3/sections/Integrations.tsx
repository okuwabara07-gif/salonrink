'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const INTEGRATIONS = [
  { name: 'LINE', icon: 'chat', badge: null, cta: null },
  { name: 'Stripe', icon: 'card', badge: null, cta: null },
  { name: 'ホットペッパー Beauty', icon: 'folder', badge: 'ベータ連携中', cta: 'お試し申込' },
  { name: 'minimo', icon: 'star', badge: 'COMING SOON', cta: null },
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
                  {integ.cta && (
                    <div className="integration-cta">{integ.cta}</div>
                  )}
                </FadeUp>
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <p className="lede" style={{ textAlign: 'center', marginTop: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            上記以外のサービスとも、API・Webhookで連携可能です。<br />
            詳しくはお気軽にお問い合わせください。
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
