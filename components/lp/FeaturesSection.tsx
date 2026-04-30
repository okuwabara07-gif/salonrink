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
  ]

  return (
    <section
      id="features"
      style={{
        background: 'var(--bg-card)',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .features-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: clamp(40px, 5vw, 60px) !important;
            align-items: center !important;
          }
          .features-phone-section {
            display: flex !important;
            justify-content: center !important;
            margin-bottom: 0 !important;
            order: 1 !important;
          }
          .features-phone-mockup {
            width: clamp(360px, 40vw, 480px) !important;
          }
          .features-list {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(20px, 3vw, 28px) !important;
            order: 2 !important;
          }
          .feature-arrow {
            display: none !important;
          }
        }
      `}</style>

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

        {/* サブタイトル */}
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

        {/* メインコンテナ: PC時に2列 */}
        <div
          className="features-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* スマホ画像: 中央・大きく */}
          <div
            className="features-phone-section"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 'clamp(40px, 6vw, 60px)',
            }}
          >
            <div
              className="features-phone-mockup"
              style={{
                position: 'relative',
                width: 'clamp(280px, 80%, 360px)',
                aspectRatio: '3/4',
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

          {/* 機能カード: 縦並び + 矢印で繋ぐ */}
          <div
            className="features-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
          {aiFeatures.map((feature, index) => (
            <div
              key={feature.number}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* 矢印(1番目を除く) */}
              {index > 0 && (
                <div
                  className="feature-arrow"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    height: '32px',
                    marginBottom: 'clamp(16px, 2vw, 24px)',
                  }}
                >
                  {/* 縦線 */}
                  <div
                    style={{
                      width: '2px',
                      height: '16px',
                      background: 'var(--accent-gold)',
                    }}
                  />
                  {/* 下向き三角 */}
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '8px solid var(--accent-gold)',
                      marginTop: '2px',
                    }}
                  />
                </div>
              )}

              {/* カード */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--sr-border)',
                  borderRadius: 12,
                  padding: 'clamp(20px, 3vw, 24px)',
                  display: 'flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  width: 'clamp(280px, 90%, 500px)',
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
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
