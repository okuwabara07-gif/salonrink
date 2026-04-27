export default function Footer() {
  return (
    <footer style={{ background: '#2a2a2a', color: '#ffffff', padding: '60px 20px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              SalonRink
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              HPBの顧客データをそのまま活用できるサロン経営SaaS
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              サービス
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="/#features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  機能一覧
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/#pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  料金
                </a>
              </li>
              <li>
                <a href="/faq" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              その他
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                <a href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  プライバシー
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <a href="/tokusho" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  特定商取引法
                </a>
              </li>
              <li>
                <a href="/company" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px' }}>
                  企業情報
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          © 2026 AOKAE LLC. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
