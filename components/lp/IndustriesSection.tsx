'use client'

export default function IndustriesSection() {
  const challenges = [
    {
      title: '顧客の好みを覚えきれない',
      description: '前回の会話を忘れてしまうので、信頼関係が続けない',
      number: '01',
    },
    {
      title: 'アレルギー情報の見落とし',
      description: '大切な情報を見落としてしまう。トラブルの原因に。',
      number: '02',
    },
    {
      title: '失客の原因が分からない',
      description: 'なぜ来なくなったのか分からない。対策が打てない...',
      number: '03',
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
            gap: 'clamp(20px, 3vw, 32px)',
          }}
        >
          {challenges.map((challenge, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 'clamp(32px, 5vw, 40px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
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
              {/* ナンバー */}
              <div
                style={{
                  fontFamily: 'var(--font-noto-serif-jp)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: 300,
                  color: 'var(--accent-gold)',
                  marginBottom: 'clamp(16px, 2vw, 24px)',
                  lineHeight: 1,
                }}
              >
                {challenge.number}
              </div>

              {/* カード内タイトル */}
              <h3
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginTop: 0,
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  lineHeight: 1.4,
                }}
              >
                {challenge.title}
              </h3>

              {/* カード内本文 */}
              <p
                style={{
                  fontFamily: 'var(--font-noto-sans-jp)',
                  fontSize: 'clamp(0.875rem, 1.5vw, 0.9375rem)',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {challenge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
