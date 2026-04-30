'use client'

export default function CaseStudySection() {
  const testimonials = [
    {
      name: '佐藤 翔太',
      salon: 'salon Lumière オーナー',
      comment: 'お客様の好みをAIが記録してくれて、提案の精度が上がりました。リピート率が30%向上しました。',
      initials: '佐',
      accentColor: 'var(--accent-gold)',
    },
    {
      name: '田中 美咲',
      salon: 'hair design Rêve スタイリスト',
      comment: 'アレルギー警告で安心して施術できるようになり、お客様からの信頼も厚くなりました。',
      initials: '田',
      accentColor: '#B59B78',
    },
    {
      name: '鈴木 健太',
      salon: 'BARBER KEN オーナー',
      comment: '失客リストとAI提案のおかげで、離脱していたお客様が戻ってくるようになりました。',
      initials: '鈴',
      accentColor: '#9D8F7F',
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
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 'clamp(28px, 5vw, 36px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
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
              {/* ヘッダー: アバター + 名前・サロン */}
              <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 16px)', marginBottom: 'clamp(20px, 3vw, 24px)' }}>
                {/* 円形アバター */}
                <div
                  style={{
                    width: 'clamp(56px, 8vw, 64px)',
                    height: 'clamp(56px, 8vw, 64px)',
                    minWidth: 'clamp(56px, 8vw, 64px)',
                    borderRadius: '50%',
                    background: testimonial.accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-noto-sans-jp)',
                  }}
                >
                  {testimonial.initials}
                </div>

                {/* 名前・サロン */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(1rem, 1.8vw, 1.0625rem)',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginTop: 0,
                      marginBottom: 'clamp(4px, 1vw, 6px)',
                      lineHeight: 1.3,
                    }}
                  >
                    {testimonial.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-noto-sans-jp)',
                      fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {testimonial.salon}
                  </p>
                </div>
              </div>

              {/* コメント */}
              <p
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(0.9rem, 1.6vw, 0.9375rem)',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                "{testimonial.comment}"
              </p>
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
