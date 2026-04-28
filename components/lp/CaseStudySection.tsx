'use client'

import Image from 'next/image'

export default function CaseStudySection() {
  return (
    <section
      id="case-study"
      style={{
        background: '#ffffff',
        padding: '80px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: 'var(--sr-blue-pale-deepest)',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          導入事例
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Case Study Card */}
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              background: 'var(--sr-bg-card)',
            }}
          >
            <div
              style={{
                aspectRatio: '3/2',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/images/lp/case-kirei-tsurumi.webp"
                alt="キレイ鶴見店"
                fill
                loading="lazy"
                style={{
                  objectFit: 'cover',
                }}
              />
            </div>

            <div style={{ padding: '32px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--sr-text-soft)',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                CASE 01
              </p>

              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--sr-blue-pale-deepest)',
                  marginBottom: '16px',
                }}
              >
                キレイ鶴見店
              </h3>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--sr-text-soft)',
                  lineHeight: 1.8,
                  marginBottom: '24px',
                }}
              >
                ホットペッパーの顧客データを活用しながら、LINE予約に切り替え。予約管理の手間が3分の1に削減され、スタッフ間の情報共有も格段に改善。顧客カルテ機能で施術履歴が一元管理できるようになり、より質の高いカウンセリングが実現できました。
              </p>

              <div style={{ display: 'flex', gap: '16px' }}>
                <a
                  href="#contact"
                  style={{
                    display: 'inline-block',
                    background: 'var(--sr-blue-pale-deepest)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  詳細を見る
                </a>
              </div>
            </div>
          </div>

          {/* Right side text content */}
          <div>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--sr-text-soft)',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}
            >
              SalonRink導入企業の実際の成果をご紹介。ホットペッパービューティーから乗り換えたサロン様の具体的な改善事例をお読みください。
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid var(--sr-border)',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--sr-text-soft)',
                    marginBottom: '8px',
                  }}
                >
                  予約管理時間削減
                </p>
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--sr-blue-pale-deepest)',
                  }}
                >
                  66%
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid var(--sr-border)',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--sr-text-soft)',
                    marginBottom: '8px',
                  }}
                >
                  リマインド配信率
                </p>
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--sr-blue-pale-deepest)',
                  }}
                >
                  95%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
