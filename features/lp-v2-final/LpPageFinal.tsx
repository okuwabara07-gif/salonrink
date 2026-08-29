'use client';

import React from 'react';
import Link from 'next/link';

export default function LpPageFinal() {
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(0);

  return (
    <>
      <style jsx global>{`
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
  color: #1a1a1a;
  background: #fff;
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  cursor: pointer;
  border: none;
}

/* Navigation */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 20px;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.nav-link {
  font-size: 14px;
  color: #666;
  transition: color 0.2s;
  padding: 8px 16px;
}

.nav-link:hover {
  color: #06c755;
}

/* Hero Section */
.hero {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(28px, 7vw, 42px);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 24px;
  color: #1a1a1a;
}

.hero-subtitle {
  font-size: clamp(14px, 4vw, 16px);
  color: #666;
  line-height: 1.8;
  margin-bottom: 32px;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 48px;
}

.btn {
  padding: 16px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #06c755;
  color: #fff;
}

.btn-primary:hover {
  background: #05a648;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #06c755;
  border: 2px solid #06c755;
}

.btn-secondary:hover {
  background: rgba(6, 199, 85, 0.05);
}

.hero-benefit {
  font-size: 12px;
  color: #999;
  line-height: 1.8;
  margin-top: 32px;
}

.hero-benefit strong {
  color: #1a1a1a;
}

/* Sections */
.section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: clamp(24px, 6vw, 36px);
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.3;
  text-align: center;
}

.section-subtitle {
  font-size: 15px;
  color: #666;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.7;
}

/* Features Section */
.features {
  background: #fafafa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #fff;
  padding: 32px 24px;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
}

/* Pricing Section */
.pricing {
  background: #fff;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.price-card {
  background: #f9f9f9;
  padding: 28px 24px;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.price-card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #06c755;
  margin-bottom: 8px;
}

.price-period {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}

.price-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.price-features {
  text-align: left;
  font-size: 13px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.price-features li {
  list-style: none;
  margin-bottom: 6px;
}

.price-features li:before {
  content: "✓ ";
  color: #06c755;
  font-weight: 600;
  margin-right: 6px;
}

.price-highlight {
  background: #fff;
  border: 2px solid #06c755;
}

.price-highlight .price-amount {
  color: #06c755;
}

.price-note {
  font-size: 13px;
  color: #999;
  text-align: center;
  margin-top: 24px;
  line-height: 1.7;
}

.price-note strong {
  color: #1a1a1a;
}

/* FAQ Section */
.faq {
  background: #fafafa;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: #fff;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
}

.faq-q {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 15px;
  color: #1a1a1a;
  transition: background 0.2s;
}

.faq-item.active .faq-q,
.faq-q:hover {
  background: #f5f5f5;
}

.faq-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: transform 0.2s;
  color: #06c755;
}

.faq-item.active .faq-toggle {
  transform: rotate(180deg);
}

.faq-a {
  padding: 0 24px 20px;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  display: none;
}

.faq-item.active .faq-a {
  display: block;
}

/* Final CTA */
.final-cta {
  background: linear-gradient(135deg, #06c755 0%, #05a648 100%);
  color: #fff;
  text-align: center;
  padding: 60px 20px;
}

.final-cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.final-cta h2 {
  font-size: clamp(24px, 6vw, 36px);
  margin-bottom: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.final-cta p {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.95;
  line-height: 1.7;
}

.final-cta .btn {
  color: #06c755;
  background: #fff;
  margin: 0 auto;
}

.final-cta .btn:hover {
  background: #f5f5f5;
}

/* Footer */
.footer {
  background: #1a1a1a;
  color: #999;
  padding: 40px 20px 20px;
  font-size: 13px;
  line-height: 1.8;
  text-align: center;
}

.footer a {
  color: #999;
  transition: color 0.2s;
}

.footer a:hover {
  color: #06c755;
}

/* Responsive */
@media (max-width: 640px) {
  .nav-inner {
    gap: 12px;
  }

  .nav-link {
    display: none;
  }

  .hero {
    padding: 40px 16px;
  }

  .hero h1 {
    font-size: 26px;
    margin-bottom: 16px;
  }

  .hero-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .section {
    padding: 48px 16px;
  }

  .section-title {
    font-size: 22px;
  }

  .section-subtitle {
    font-size: 13px;
    margin-bottom: 28px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 24px 16px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .price-card {
    padding: 20px 16px;
  }

  .faq-q {
    padding: 16px 16px;
    font-size: 14px;
  }

  .faq-a {
    padding: 0 16px 16px;
    font-size: 13px;
  }

  .final-cta {
    padding: 40px 16px;
  }

  .final-cta h2 {
    font-size: 22px;
  }

  .final-cta p {
    font-size: 14px;
  }
}
      `}</style>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">SalonRink</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/blog" className="nav-link">ブログ</a>
            <a href="/tokusho" className="nav-link">特商法</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>紙カルテとホットペッパーの<br />二重管理、やめませんか</h1>

          <p className="hero-subtitle">
            小規模サロンのための予約・カルテ管理<br />
            月額 ¥1,980 から・初期費用 0 円・14 日間無料
          </p>

          <div className="hero-cta">
            <a href="/register" className="btn btn-primary">
              14 日間無料で始める
            </a>
            <a
              href="https://fmpmgilgvvfezursmyic.supabase.co/functions/v1/salon-check"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              サロン経営診断（無料・1分）
            </a>
          </div>

          <div className="hero-benefit">
            <strong>クレジットカード登録不要</strong><br />
            解約料 0 円・いつでもキャンセル可
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features">
        <h2 className="section-title">SalonRink の 3 つの機能</h2>
        <p className="section-subtitle">紙とアプリの二重管理をなくす</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>予約一元管理</h3>
            <p>
              ホットペッパーと連携し、すべての予約を 1 つの画面で管理。二重チェック作業を削減。
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>LINE カルテ共有</h3>
            <p>
              カルテは LINE のトーク画面から。顧客も スタッフも同じ情報を見られます。
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>経営診断</h3>
            <p>
              あなたのサロンの現状を 1 分で診断。改善のヒントを提案します。
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section pricing">
        <h2 className="section-title">料金プラン</h2>
        <p className="section-subtitle">シンプルな月額制。追加費用はありません。</p>

        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-card-title">Core</div>
            <div className="price-amount">¥1,980</div>
            <div className="price-period">/ 月</div>
            <div className="price-desc">予約・カルテ管理の基本機能</div>
            <ul className="price-features">
              <li>LINE 連携</li>
              <li>カルテ管理</li>
              <li>予約管理</li>
              <li>顧客分析</li>
            </ul>
          </div>

          <div className="price-card price-highlight">
            <div className="price-card-title">セット A</div>
            <div className="price-amount">¥2,780</div>
            <div className="price-period">/ 月</div>
            <div className="price-desc">Core + 人気の追加機能</div>
            <ul className="price-features">
              <li>Core の全機能</li>
              <li>自動リマインダー</li>
              <li>クーポン管理</li>
              <li>テンプレート機能</li>
            </ul>
          </div>

          <div className="price-card">
            <div className="price-card-title">セット B</div>
            <div className="price-amount">¥2,980</div>
            <div className="price-period">/ 月</div>
            <div className="price-desc">カスタマイズ対応</div>
            <ul className="price-features">
              <li>セット A の全機能</li>
              <li>ホットペッパー連携</li>
              <li>売上分析</li>
              <li>優先サポート</li>
            </ul>
          </div>

          <div className="price-card">
            <div className="price-card-title">セット C</div>
            <div className="price-amount">¥4,580</div>
            <div className="price-period">/ 月</div>
            <div className="price-desc">小規模多店舗向け</div>
            <ul className="price-features">
              <li>セット B の全機能</li>
              <li>複数店舗対応</li>
              <li>高度な分析機能</li>
              <li>専任サポート</li>
            </ul>
          </div>
        </div>

        <div className="price-note">
          <strong>すべてのプランに 14 日間の無料トライアルが付属します。</strong><br />
          クレジットカード登録不要・解約料 0 円。いつでもキャンセル可能です。
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section faq">
        <h2 className="section-title">よくある質問</h2>
        <p className="section-subtitle">導入前の不安を解消します</p>

        <div className="faq-list">
          {[
            {
              q: '本当に月 ¥1,980 から始められるのですか？',
              a: 'はい。Core プラン月 ¥1,980 が最安です。追加費用なし、初期費用も 0 円です。14 日間無料で試した後、解約すれば費用は発生しません。'
            },
            {
              q: 'ホットペッパーと連携できますか？',
              a: 'はい。セット B 以上で対応しています。ホットペッパーの予約と SalonRink のカルテが自動で同期されます。'
            },
            {
              q: '今使っているシステムから移行できますか？',
              a: 'はい。過去のカルテデータは手動インポート、または当社サポートでお手伝いします。無料体験中に相談可能です。'
            },
            {
              q: 'スマートフォンだけで使えますか？',
              a: 'もちろんです。LINE のトーク画面から完全に操作可能。追加アプリは不要です。タブレットやパソコンからのアクセスも対応。'
            },
            {
              q: '顧客データはどこに保存されますか？',
              a: 'クラウドで安全に管理されます。自動バックアップで万が一の場合も安心。セキュリティは業界標準に準拠。'
            },
            {
              q: '解約したい場合、違約金はかかりますか？',
              a: 'いいえ。解約料・違約金はゼロです。月単位で自由に変更・キャンセルができます。'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`faq-item ${expandedFaq === idx ? 'active' : ''}`}
            >
              <div
                className="faq-q"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className="faq-toggle">▼</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-content">
          <h2>今すぐ始めましょう</h2>
          <p>
            クレジットカード登録不要。<br />
            14 日間、すべての機能を無料で試せます。
          </p>
          <a href="/register" className="btn">
            14 日間無料で始める
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ marginBottom: '20px' }}>
          <p>© 2024 SalonRink. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <a href="/tokusho">特商法</a>
          <a href="/privacy">プライバシーポリシー</a>
          <a href="/terms">利用規約</a>
          <a href="/blog">ブログ</a>
        </div>
      </footer>
    </>
  );
}
