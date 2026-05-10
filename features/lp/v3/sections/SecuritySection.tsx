'use client';

import Icon from '@/features/lp/v3/components/Icon';
import FadeUp from '@/features/lp/v3/components/FadeUp';

const SECURITY_FEATURES = [
  {
    icon: 'lock',
    title: 'AES-256 暗号化',
    desc: 'すべての顧客データは金融グレードの暗号化で保護。',
  },
  {
    icon: 'shield',
    title: 'TLS 1.3 通信',
    desc: '保存時も転送時も最高レベルのセキュリティ。',
  },
  {
    icon: 'folder',
    title: 'RLS（行レベルセキュリティ）',
    desc: '顧客情報へのアクセスを厳密に制御・監視。',
  },
  {
    icon: 'check',
    title: 'PCI DSS準拠',
    desc: 'Stripe統合により決済セキュリティ基準を満たす。',
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
            <span className="underline-accent">確実に守られています</span>。
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
                  <Icon name={feat.icon as any} size={20} />
                </div>
                <div className="security-content">
                  <h3 className="security-title">{feat.title}</h3>
                  <p className="security-desc">{feat.desc}</p>
                </div>
              </FadeUp>
            </div>
          ))}
        </div>

        <FadeUp delay={340}>
          <div className="security-footer" style={{ marginTop: 40 }}>
            セキュリティに関するご質問、脆弱性報告は<br />
            <strong>security@aokae.net</strong> までお願いします。
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
