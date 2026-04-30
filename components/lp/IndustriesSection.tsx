'use client'

import Image from 'next/image'

export default function IndustriesSection() {
  const challenges = [
    {
      image: '/images/lp-redesign/challenge-1.jpg',
      alt: 'お客様の好みを、思い出すのが大変',
      title: 'お客様の好みを、思い出すのが大変',
      subtitle: '前回の会話、覚えておきたいから',
    },
    {
      image: '/images/lp-redesign/challenge-2.jpg',
      alt: 'ケア情報、安心して見たい',
      title: 'ケア情報、安心して見たい',
      subtitle: '施術前にひと目で確認できたら',
    },
    {
      image: '/images/lp-redesign/challenge-3.jpg',
      alt: 'お客様の傾向を、もっと知りたい',
      title: 'お客様の傾向を、もっと知りたい',
      subtitle: '"なぜ"をデータで見えるように',
    },
  ]

  return (
    <section
      style={{
        background: 'var(--bg-main)',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .industries-card-image {
            aspect-ratio: 4/3 !important;
          }
          .industries-card-wrapper {
            max-width: 380px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* EYEBROW */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
            fontWeight: 600,
            color: '#C9A961',
            textAlign: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            letterSpacing: 0.15,
            textTransform: 'uppercase',
          }}
        >
          CHALLENGE
        </p>

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
          サロンには、こんな"小さなお悩み"が。
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
          SalonRinkは、美容師の想いに寄り添う機能を揃えています。
        </p>

        {/* カード グリッド */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(20px, 3vw, 28px)',
          }}
        >
          {challenges.map((challenge, i) => (
            <div
              key={i}
              className="industries-card-wrapper"
              style={{
                margin: '0 auto',
                width: '100%',
                maxWidth: 'min(100%, 360px)',
              }}
            >
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* 画像部分 */}
                <div
                  className="industries-card-image"
                  style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                  }}
                >
                  <Image
                    src={challenge.image}
                    alt={challenge.alt}
                    fill
                    style={{
                      objectFit: 'cover',
                    }}
                    priority={i === 0}
                  />
                </div>

                {/* テキスト部分 */}
                <div
                  style={{
                    padding: 'clamp(16px, 2.5vw, 20px)',
                    background: '#FFFFFF',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.95rem, 1.8vw, 1.0625rem)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {challenge.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {challenge.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
