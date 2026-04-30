'use client'

import Image from 'next/image'

export default function FeaturesSection() {
  const aiFeatures = [
    {
      number: '1',
      title: '顧客サマリ自動生成',
      description: 'AI が過去のデータを分析し、最適なサマリを生成',
    },
    {
      number: '2',
      title: 'アレルギー警告',
      description: 'AI がリスクを検知し、施術前に警告',
    },
    {
      number: '3',
      title: '次回提案',
      description: 'AI が最適な施術・ケアを提案',
    },
    {
      number: '4',
      title: '失客予兆検知',
      description: 'AI が来店パターンから失客リスクを予測',
    },
  ]

  return (
    <section
      id="features"
      style={{
        background: 'var(--bg-card)',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* セクションタイトル */}
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif-jp)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            letterSpacing: 0.02,
          }}
        >
          AI が自動で記録、提案、警告
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 'clamp(60px, 8vw, 80px)',
            letterSpacing: 0.01,
          }}
        >
          サロンワークに、AI というパートナーを。
        </p>

        {/* メインレイアウト: スマホ + 機能カード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(40px, 5vw, 60px)',
            alignItems: 'center',
          }}
        >
          {/* 左側: スマホモックアップ */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: 'clamp(280px, 100%, 450px)',
                aspectRatio: '3/4',
                margin: '0 auto',
              }}
            >
              <Image
                src="/images/lp-redesign/phone-mockup.jpg"
                alt="SalonRink カルテ画面"
                fill
                style={{
                  objectFit: 'contain',
                }}
                priority
              />
            </div>
          </div>

          {/* 右側: 機能カード */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(16px, 2vw, 24px)',
            }}
          >
            {aiFeatures.map((feature) => (
              <div
                key={feature.number}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--sr-border)',
                  borderRadius: 12,
                  padding: 'clamp(20px, 3vw, 24px)',
                  display: 'flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* ナンバーバッジ */}
                <div
                  style={{
                    width: 'clamp(36px, 5vw, 40px)',
                    height: 'clamp(36px, 5vw, 40px)',
                    minWidth: 'clamp(36px, 5vw, 40px)',
                    background: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  {feature.number}
                </div>

                {/* テキスト */}
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginTop: 0,
                      marginBottom: 'clamp(6px, 1vw, 8px)',
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* モバイル対応 */}
        <style>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
