'use client'

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--text-primary)',
        color: '#FAF6EE',
        padding: 'clamp(60px, 8vw, 80px) clamp(20px, 5vw, 60px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ロゴ + キャッチ + SNS */}
        <div style={{ marginBottom: 'clamp(50px, 8vw, 60px)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-noto-serif-jp)',
              fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
              fontWeight: 400,
              color: '#FAF6EE',
              marginTop: 0,
              marginBottom: 'clamp(8px, 2vw, 12px)',
              letterSpacing: 0.05,
            }}
          >
            SalonRink
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
              fontWeight: 300,
              color: '#FAF6EE',
              opacity: 0.85,
              marginTop: 0,
              marginBottom: 'clamp(20px, 3vw, 24px)',
              lineHeight: 1.6,
            }}
          >
            美容師とお客様を、一生でつなぐ。
          </p>

          {/* SNS アイコン（旧コードから移植） */}
          <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 16px)' }}>
            {/* Instagram */}
            <a
              href="https://instagram.com/salonrink"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FAF6EE',
                transition: 'all 0.3s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
            </a>

            {/* LINE */}
            <a
              href="https://lin.ee/salonrink"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FAF6EE',
                transition: 'all 0.3s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.19 4.85 3.15 6.36L4.28 20l3.5-2.18C8.99 19.46 10.46 20 12 20c5.52 0 10-3.58 10-8s-4.48-10-10-10zm3.5 9h-7v-2h7v2zm0-4h-7V5h7v2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* リンクグループ 3カラム */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(30px, 5vw, 50px)',
            marginBottom: 'clamp(50px, 8vw, 60px)',
          }}
        >
          {/* サービス */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                fontWeight: 600,
                color: '#FAF6EE',
                marginTop: 0,
                marginBottom: 'clamp(12px, 2vw, 16px)',
                textTransform: 'uppercase',
                letterSpacing: 0.05,
              }}
            >
              サービス
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/#features"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  機能一覧
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/#pricing"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  料金プラン
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/faq"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  よくある質問
                </a>
              </li>
            </ul>
          </div>

          {/* サポート（新規） */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                fontWeight: 600,
                color: '#FAF6EE',
                marginTop: 0,
                marginBottom: 'clamp(12px, 2vw, 16px)',
                textTransform: 'uppercase',
                letterSpacing: 0.05,
              }}
            >
              サポート
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="#"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  お問い合わせ
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="#"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  資料請求
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/case-studies"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  導入事例
                </a>
              </li>
            </ul>
          </div>

          {/* 運営会社 */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-noto-sans-jp)',
                fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                fontWeight: 600,
                color: '#FAF6EE',
                marginTop: 0,
                marginBottom: 'clamp(12px, 2vw, 16px)',
                textTransform: 'uppercase',
                letterSpacing: 0.05,
              }}
            >
              運営会社
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/company"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  会社概要
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/privacy"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  プライバシーポリシー
                </a>
              </li>
              <li style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                <a
                  href="/tokusho"
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                    color: '#FAF6EE',
                    opacity: 0.75,
                    textDecoration: 'none',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  特定商取引法
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 'clamp(20px, 3vw, 24px)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-noto-sans-jp)',
              fontSize: 'clamp(0.75rem, 1.2vw, 0.8125rem)',
              color: '#FAF6EE',
              opacity: 0.6,
              margin: 0,
            }}
          >
            © 2026 AOKAE合同会社 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
