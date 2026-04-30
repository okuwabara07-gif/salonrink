'use client'

import Image from 'next/image'

export default function CaseStudySection() {
  const testimonials = [
    {
      image: '/images/lp-redesign/testimonial-sato.jpg',
      alt: '佐藤翔太 - salon Lumière オーナー',
    },
    {
      image: '/images/lp-redesign/testimonial-tanaka.jpg',
      alt: '田中美咲 - hair design Rêve スタイリスト',
    },
    {
      image: '/images/lp-redesign/testimonial-suzuki.jpg',
      alt: '鈴木健太 - BARBER KEN オーナー',
    },
  ]

  return (
    <section
      style={{
        background: 'var(--bg-main)',
        padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 60px)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
          美容師の声
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
          SalonRink を使って、サロンワークが変わりました。
        </p>

        {/* テスティモニアルカード */}
        <div
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
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                aspectRatio: '16/9',
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
                src={testimonial.image}
                alt={testimonial.alt}
                fill
                style={{
                  objectFit: 'cover',
                }}
              />
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
          他にも多くのサロン様にご利用いただいています。
        </p>
      </div>
    </section>
  )
}
