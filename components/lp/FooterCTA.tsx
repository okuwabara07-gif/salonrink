'use client'

export default function FooterCTA() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #6a8eb0 0%, #7da5c7 100%)',
        padding: '80px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          今すぐ無料で始めましょう
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '40px',
          }}
        >
          14日間の無料トライアル。クレジットカード不要。
        </p>
        <a
          href="/register"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ffd1dc 0%, #f0a0a0 100%)',
            color: '#ffffff',
            padding: '18px 50px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '18px',
            boxShadow: '0 6px 20px rgba(240,160,160,0.4)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          無料登録
        </a>
      </div>
    </section>
  )
}
