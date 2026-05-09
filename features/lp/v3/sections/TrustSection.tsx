'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const TRUST = [
  { i: 'lock', t: 'AES-256 暗号化', d: '個人情報を安全に保護' },
  { i: 'shield', t: 'TLS 1.3 通信', d: '通信全体を暗号化' },
  { i: 'folder', t: 'サロン別データ分離', d: 'RLS による厳格な分離' },
  { i: 'card', t: '決済は Stripe', d: 'PCI DSS Level 1 認証' },
];

export default function TrustSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <h2 className="h2" style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)' }}>
            安心して使える、確かなセキュリティ
          </h2>
        </FadeUp>
        <div className="grid-4" style={{ marginTop: 32 }}>
          {TRUST.map((t, i) => (
            <FadeUp key={i} delay={i * 60}>
              <div className="trust-card">
                <span className="trust-icon">
                  <Icon name={t.i as any} size={20} />
                </span>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.t}</div>
                <div style={{ fontSize: 11, color: 'var(--c-fg-3)' }}>{t.d}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
