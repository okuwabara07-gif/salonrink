'use client'

import Image from 'next/image'

export default function CaseStudySection() {
  const testimonials = [
    {
      image: '/images/lp-redesign/testimonial-sato.jpg',
      alt: 'S.S 様 - salon Lumière オーナー',
      name: 'S.S 様',
      role: '東京都・salon Lumière オーナー',
      quote: 'お客様の好みをすぐ確認できて、カウンセリングの質が上がりました。リピート率も上がっています。',
    },
    {
      image: '/images/lp-redesign/testimonial-tanaka.jpg',
      alt: 'T.M 様 - hair design Rêve スタイリスト',
      name: 'T.M 様',
      role: '神奈川県・hair design Rêve スタイリスト',
      quote: 'ケア情報がスムーズに見れて、安心して施術できるのが本当にありがたいです。',
    },
    {
      image: '/images/lp-redesign/testimonial-suzuki.jpg',
      alt: 'S.K 様 - BARBER KEN オーナー',
      name: 'S.K 様',
      role: '大阪府・BARBER KEN オーナー',
      quote: '分析レポートが分かりやすく、経営判断にも役立っています。導入して良かったです。',
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
          .case-study-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .case-study-card {
            aspect-ratio: 4/3 !important;
            max-width: 360px !important;
            margin: 0 auto !important;
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
          VOICE
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
          導入サロンから、嬉しい声が届いています。
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            fontWeight: 300,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 'clamp(60px, 8vw, 80px)',
          }}
        >
          SalonRinkを導入して、サロンワークが変わりました。
        </p>

        {/* テスティモニアルカード */}
        <div
          className="case-study-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(24px, 3vw, 32px)',
            marginBottom: 'clamp(60px, 8vw, 80px)',
          }}
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="case-study-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: '#FFFFFF',
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
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/10',
                }}
              >
                <Image
                  src={testimonial.image}
                  alt={testimonial.alt}
                  fill
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* テキスト部分 */}
              <div
                style={{
                  padding: 'clamp(16px, 2.5vw, 20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1.5vw, 12px)',
                }}
              >
                {/* 引用文 */}
                <p
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.quote}"
                </p>

                {/* 名前 */}
                <p
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {testimonial.name}
                </p>

                {/* 役職 */}
                <p
                  style={{
                    fontFamily: 'var(--font-noto-sans-jp)',
                    fontSize: 'clamp(0.75rem, 1.2vw, 0.8rem)',
                    fontWeight: 400,
                    color: 'var(--text-soft)',
                    margin: 0,
                  }}
                >
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 控えめな注記 */}
        <p
          style={{
            fontFamily: 'var(--font-noto-sans-jp)',
            fontSize: 'clamp(0.8rem, 1.4vw, 0.875rem)',
            fontWeight: 400,
            color: 'var(--text-soft)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          ※個人の感想であり、効果を保証するものではありません
        </p>
      </div>
    </section>
  )
}
