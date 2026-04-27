'use client'

export default function IntegrationLogos() {
  const logos = [
    { name: 'LINE', bg: '#7bca9c' },
    { name: 'HPB', bg: '#f0a878' },
    { name: 'Stripe', bg: '#a8a8d0' },
    { name: 'Google', bg: 'conic-gradient(from 0deg, #4285F4 0deg, #34A853 90deg, #FBBC04 180deg, #EA4335 270deg)' },
  ]

  return (
    <section style={{ background: '#ffffff', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--sr-text-soft)', marginBottom: '40px' }}>
          連携サービス
        </h3>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {logos.map((logo) => {
            if (logo.name === 'Google') {
              return (
                <div
                  key={logo.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: logo.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 700,
                  }}
                >
                  G
                </div>
              )
            }
            return (
              <div
                key={logo.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  background: logo.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '8px',
                }}
              >
                {logo.name}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
