'use client'

function PhoneIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="6" width="40" height="52" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="16" y="12" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <line x1="32" y1="48" x2="32" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function LineContact() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--sr-blue-pale-deepest)', marginBottom: '40px' }}>
          LINEで気軽に相談
        </h2>
        <div
          style={{
            background: 'linear-gradient(135deg, #c8d4e0 0%, #b4c0d0 100%)',
            width: '200px',
            height: '200px',
            margin: '0 auto 40px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <PhoneIcon />
        </div>
        <p style={{ color: 'var(--sr-text-soft)', marginBottom: '24px', fontSize: '16px' }}>
          QRコードを読み込んでLINE公式アカウントを友だち追加
        </p>
        <a
          href="https://line.me/R/ti/p/%40salonrink"
          style={{
            display: 'inline-block',
            background: '#00B900',
            color: '#ffffff',
            padding: '14px 40px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          LINE友達追加
        </a>
      </div>
    </section>
  )
}
