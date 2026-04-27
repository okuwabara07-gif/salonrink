'use client'

export default function NumbersSection() {
  const numbers = [
    { label: '月額最安', value: '¥980', description: 'フリーランス向けプラン' },
    { label: 'HPB手数料', value: '¥0', description: '初期費用・手数料なし' },
    { label: '導入時間', value: '10分', description: 'わずか10分で開始可能' },
    { label: '無料期間', value: '14日', description: '全機能トライアル可能' },
  ]

  return (
    <section
      style={{
        background: 'var(--sr-bg)',
        padding: '80px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: 'var(--sr-blue-pale-deepest)',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          すべてのサロンオーナーへ
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          {numbers.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--sr-bg-card)',
                padding: '40px 24px',
                borderRadius: '16px',
                border: '1px solid var(--sr-border)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--sr-text-soft)',
                  fontWeight: 600,
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 'clamp(32px, 6vw, 48px)',
                  fontWeight: 700,
                  color: 'linear-gradient(135deg, #ffd1dc 0%, #f0a0a0 100%)',
                  background: 'linear-gradient(135deg, #ffd1dc 0%, #f0a0a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '12px',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--sr-text-soft)',
                }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
