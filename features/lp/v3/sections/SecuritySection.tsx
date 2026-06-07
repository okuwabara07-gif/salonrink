'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const SECURITY_FEATURES = [
  {
    icon: 'lock',
    title: 'AES-256 暗号化',
    desc: '業界標準の暗号化技術で、個人情報を安全に保護します。',
    badgeIcon: 'shield',
    badgeLabel: '個人情報を安全に保護',
  },
  {
    icon: 'shield',
    title: 'TLS 1.3 通信',
    desc: '最新の TLS 1.3 プロトコルで、通信全体を暗号化します。',
    badgeIcon: 'lock',
    badgeLabel: '通信全体を暗号化',
  },
  {
    icon: 'folder',
    title: 'サロン別データ分離',
    desc: 'RLS(Row Level Security)により、サロンごとのデータを厳格に分離。他サロンの情報は閲覧できません。',
    badgeIcon: 'folder',
    badgeLabel: 'RLS による厳格な分離',
  },
  {
    icon: 'card',
    title: '決済は Stripe',
    desc: 'PCI DSS Level 1 認定取得済の Stripe を利用し、安全な決済を実現します。',
    badgeIcon: 'shield',
    badgeLabel: 'PCI DSS Level 1 認定済 Stripe 利用',
  },
];

export default function SecuritySection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <div className="eyebrow" style={{ textAlign: 'center', display: 'block' }}>SECURITY</div>
        </FadeUp>
        <FadeUp delay={80}>
          <h2 className="h2" style={{ marginTop: 14, textAlign: 'center' }}>
            あなたの顧客データは、<br />
            <span className="underline-accent">適切に保護されています</span>。
          </h2>
        </FadeUp>
        <FadeUp delay={140}>
          <p className="lede" style={{ textAlign: 'center', marginTop: 14, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            美容業界で扱う個人情報を、金融・医療レベルのセキュリティで保護。
          </p>
        </FadeUp>

        <div className="security-grid" style={{ marginTop: 40 }}>
          {SECURITY_FEATURES.map((feat, i) => (
            <div key={i} className="security-card">
              <FadeUp delay={i * 60}>
                <div className="security-icon">
                  <Icon name={feat.icon as any} size={24} />
                </div>
                <h3 className="security-title">{feat.title}</h3>
                <div className="security-divider" />
                <p className="security-desc">{feat.desc}</p>
                <div className="security-badge">
                  <Icon name={feat.badgeIcon as any} size={14} />
                  <span>{feat.badgeLabel}</span>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>

        <FadeUp delay={340}>
          <div className="security-footer" style={{ marginTop: 40 }}>
            <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡</span>
              自社内での継続的な脆弱性チェックを実施
            </div>
            <p style={{ margin: '0', fontSize: '14px', color: 'var(--c-fg-2)', lineHeight: 1.6 }}>
              キーローテーション・アクセス制御・定期的な脆弱性チェックを継続的に行い、常に安全性を高めています。
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
