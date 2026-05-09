'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'grid', gap: 32, gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', gap: 28, gridTemplateColumns: '1fr' }}>
          <div>
            <div className="nav-logo" style={{ color: 'var(--c-bg)' }}>
              <span className="logo-mark" /> SalonRink<small>.com</small>
            </div>
            <p style={{ color: 'var(--c-fg-4)', marginTop: 14, lineHeight: 1.85, fontSize: 13 }}>
              美容室のためのAIカルテSaaS。<br />
              サロンとお客様を、もっと近くに。
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--c-bg)', fontSize: 13 }}>Product</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><a href="#features">機能</a></li>
                <li><a href="#plans">プラン</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--c-bg)', fontSize: 13 }}>Company</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><a href="/company">運営会社</a></li>
                <li><a href="/tokushoho">特定商取引法に基づく表記</a></li>
                <li><a href="/privacy">プライバシーポリシー</a></li>
                <li><a href="/terms">利用規約</a></li>
                <li><a href="mailto:support@salonrink.com">お問い合わせ</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #322a21', paddingTop: 20, fontSize: 11, color: 'var(--c-fg-4)', lineHeight: 1.85 }}>
          <strong style={{ color: 'var(--c-bg)' }}>運営：</strong> AOKAE合同会社 / お問い合わせ: support@salonrink.com
          <br />
          <span style={{ fontSize: 10, color: 'var(--c-fg-4)', opacity: 0.75 }}>
            ※ 代表者氏名・住所・電話番号は support@salonrink.com まで請求があった場合に開示します（特定商取引法に基づく表記）
          </span>
        </div>
      </div>
      <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #322a21', fontSize: 12, color: 'var(--c-fg-4)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span>© 2026 AOKAE合同会社. All rights reserved.</span>
        <span>Made with care in Tokyo</span>
      </div>
    </footer>
  );
}
