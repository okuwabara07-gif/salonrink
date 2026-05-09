'use client';

import FadeUp from '@/features/lp/v3/components/FadeUp';

const INTEGS = ['LINE', 'Stripe', 'ホットペッパー Beauty (近日対応)'];

export default function Integrations() {
  return (
    <section className="section section-cream">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>INTEGRATIONS</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            いま使っているツールと、シームレスに。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <div className="integ-grid" style={{ marginTop: 36 }}>
            {INTEGS.map((n) => (
              <div key={n} className="integ-cell">
                {n}
              </div>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--c-fg-3)' }}>
            上記以外のサービスとも、API・Webhookで連携可能です。
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
