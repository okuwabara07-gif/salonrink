'use client'

import Image from 'next/image'

export default function IndustriesSection() {
  const challenges = [
    {
      image: '/images/lp-redesign/challenge-1.jpg',
      alt: '顧客の好みを覚えきれない',
    },
    {
      image: '/images/lp-redesign/challenge-2.jpg',
      alt: 'アレルギー情報の見落とし',
    },
    {
      image: '/images/lp-redesign/challenge-3.jpg',
      alt: '失客の原因が分からない',
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
        {/* セクションタイトル */}
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif-jp)',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 'clamp(40px, 5vw, 60px)',
            letterSpacing: 0.02,
          }}
        >
          こんな悩み、ありませんか?
        </h2>

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
                className="industries-card-image"
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  aspectRatio: '16/10',
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
