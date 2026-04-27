'use client'

export default function IndustriesSection() {
  const industries = [
    { name: '美容室', icon: '✂️', bg: 'bg-photo-salon-1' },
    { name: '理容室', icon: '💈', bg: 'bg-photo-salon-2' },
    { name: 'ネイルサロン', icon: '💅', bg: 'bg-photo-salon-3' },
    { name: 'エステ', icon: '💆', bg: 'bg-photo-salon-4' },
    { name: 'アイラッシュ', icon: '👁️', bg: 'bg-photo-salon-5' },
    { name: '脱毛サロン', icon: '✨', bg: 'bg-photo-salon-6' },
    { name: '整体・リラク', icon: '🧘', bg: 'bg-photo-salon-7' },
    { name: 'その他サービス', icon: '🏪', bg: 'bg-photo-salon-8' },
  ]

  return (
    <section
      style={{
        background: '#ffffff',
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
            marginBottom: '16px',
          }}
        >
          対応している業種
        </h2>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--sr-text-soft)',
            marginBottom: '60px',
            fontSize: '16px',
          }}
        >
          美容系・健康系・リラクゼーション系、多様な業種に対応
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
          }}
        >
          {industries.map((ind, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1/1',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* ダミー背景 */}
              <div
                className={ind.bg}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />

              {/* オーバーレイ */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '32px' }}>{ind.icon}</div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {ind.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
